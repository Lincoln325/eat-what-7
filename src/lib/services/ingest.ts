import { mapPlaceToRestaurantRow } from '@/lib/domain/place-mapping'
import { fetchPlaceDetails, getPhotoUrl } from '@/lib/infra/places-api'
import { processImage } from '@/lib/infra/image-pipeline'
import { uploadRestaurantImage } from '@/lib/infra/storage'
import {
  findByPlaceId,
  insertRestaurant,
  updateRestaurantById,
  getPlaceIdById,
  type InsertRestaurantInput,
} from '@/lib/infra/restaurant-repo'

// Build the DB record (details + image pipeline) for a place WITHOUT inserting.
// Returns null payload when the place already exists.
async function buildRecord(placeId: string): Promise<InsertRestaurantInput> {
  const [en, zh_hk] = await Promise.all([
    fetchPlaceDetails(placeId, 'en'),
    fetchPlaceDetails(placeId, 'zh-HK'),
  ])
  const row = mapPlaceToRestaurantRow({ en, zh_hk })

  let imagePath: string | null = null
  let blurhash: string | null = null
  let imageWidth: number | null = null
  let imageHeight: number | null = null

  if (en.photos?.[0]) {
    try {
      const photoUrl = getPhotoUrl(en.photos[0].name)
      const processed = await processImage(photoUrl)
      imagePath = await uploadRestaurantImage(placeId, processed.buffer)
      blurhash = processed.blurhash
      imageWidth = processed.width
      imageHeight = processed.height
    } catch {
      // Image failure should not block the restaurant from being saved
    }
  }

  return {
    ...row,
    primary_image_path: imagePath,
    image_blurhash: blurhash,
    image_width: imageWidth,
    image_height: imageHeight,
    submitted_by: null,
  }
}

export interface ConfirmResult {
  id: string
  name: string
}

export interface IngestResult {
  id: string
  name: string
  already_existed: boolean
}

// One-shot ingest (build + insert): fetch bilingual details, process + upload
// the image, insert. Used by the batch importer and by the interactive Add
// flow once the user has picked a place from the search results.
export async function ingestPlace(placeId: string): Promise<IngestResult> {
  const existing = await findByPlaceId(placeId)
  if (existing) {
    return { id: existing.id, name: existing.name, already_existed: true }
  }
  const payload = await buildRecord(placeId)
  const record = await insertRestaurant(payload)
  return { id: record.id, name: record.name, already_existed: false }
}

// Re-fetch a saved place from Google and overwrite its mutable fields +
// image. Explicit, user-triggered — the only path that re-spends quota on an
// existing row.
export async function refreshPlace(id: string): Promise<ConfirmResult> {
  const placeId = await getPlaceIdById(id)
  if (!placeId) throw new Error('Restaurant not found')

  const payload = await buildRecord(placeId)
  // Don't overwrite provenance on refresh; buildRecord defaults it to null.
  const fields = { ...payload }
  delete (fields as Partial<typeof fields>).submitted_by
  const record = await updateRestaurantById(id, fields)
  return { id: record.id, name: record.name }
}
