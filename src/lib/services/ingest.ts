import { mapPlaceToRestaurantRow } from '@/lib/domain/place-mapping'
import { translateTags } from '@/lib/domain/tag-labels'
import { fetchPlaceDetails, getPhotoUrl } from '@/lib/infra/places-api'
import { processImage } from '@/lib/infra/image-pipeline'
import { uploadRestaurantImage, deleteRestaurantImage } from '@/lib/infra/storage'
import {
  findByPlaceId,
  insertRestaurant,
  updateRestaurantById,
  getPlaceIdById,
  type InsertRestaurantInput,
} from '@/lib/infra/restaurant-repo'
import { RESTAURANT_IMAGE_BASE_URL } from '@/lib/storage-url'
import type { PlacePreview } from '@/lib/types'

// Bundles the display preview shown to the user with the fully-built insert
// payload. The payload is opaque to the client and handed back to confirmPlace
// verbatim, so Google is called exactly once (during preview).
export interface PreviewResult {
  preview: PlacePreview
  payload: InsertRestaurantInput | null
}

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

// Step 1: resolve + fetch + build (image uploaded, keyed by placeId with
// upsert). Nothing is written to the restaurants table yet.
export async function previewPlace(placeId: string): Promise<PreviewResult> {
  const existing = await findByPlaceId(placeId)
  if (existing) {
    // Cheap display-only fetch so the user sees which place they pasted.
    const en = await fetchPlaceDetails(placeId, 'en')
    return {
      preview: {
        name: en.displayName?.text ?? existing.name,
        typeLabel: en.primaryTypeDisplayName?.text ?? '餐廳',
        imageUrl: null,
        rating: en.rating ?? null,
        ratingCount: en.userRatingCount ?? null,
        priceLevel: null,
        address: en.formattedAddress ?? null,
        tags: translateTags(en.types ?? []),
        alreadyExists: true,
        existingId: existing.id,
        placeId,
      },
      payload: null,
    }
  }

  const payload = await buildRecord(placeId)
  const imageUrl = payload.primary_image_path
    ? `${RESTAURANT_IMAGE_BASE_URL}/${payload.primary_image_path}`
    : null

  return {
    preview: {
      name: payload.name_zh ?? payload.name,
      typeLabel: payload.primary_type_display_name_zh ?? '餐廳',
      imageUrl,
      rating: payload.rating,
      ratingCount: payload.total_ratings,
      priceLevel: payload.price_level,
      address: payload.address,
      tags: translateTags(payload.tags),
      alreadyExists: false,
      existingId: null,
      placeId,
    },
    payload,
  }
}

export interface ConfirmResult {
  id: string
  name: string
}

// Step 2: insert the record built during preview. No Google call.
export async function confirmPlace(
  payload: InsertRestaurantInput,
): Promise<ConfirmResult> {
  const existing = await findByPlaceId(payload.google_place_id)
  if (existing) return { id: existing.id, name: existing.name }

  const record = await insertRestaurant(payload)
  return { id: record.id, name: record.name }
}

export interface IngestResult {
  id: string
  name: string
  already_existed: boolean
}

// One-shot ingest (build + insert) used by the batch importer and the legacy
// single-URL route. The interactive Add flow uses previewPlace/confirmPlace
// instead so the user can review before committing.
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

// Remove a saved place and its storage image.
export async function purgePlaceImage(id: string): Promise<void> {
  const placeId = await getPlaceIdById(id)
  if (placeId) {
    try {
      await deleteRestaurantImage(placeId)
    } catch {
      // Missing image is fine — deletion of the row is what matters.
    }
  }
}
