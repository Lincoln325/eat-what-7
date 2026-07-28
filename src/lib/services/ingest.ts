import { mapPlaceToRestaurantRow } from '@/lib/domain/place-mapping'
import { fetchPlaceDetails, getPhotoUrl } from '@/lib/infra/places-api'
import { processImage } from '@/lib/infra/image-pipeline'
import { uploadRestaurantImage } from '@/lib/infra/storage'
import { findByPlaceId, insertRestaurant } from '@/lib/infra/restaurant-repo'

export interface IngestResult {
  id: string
  name: string
  already_existed: boolean
}

export async function ingestPlace(
  placeId: string,
  submittedBy?: string,
): Promise<IngestResult> {
  const existing = await findByPlaceId(placeId)
  if (existing) {
    return { id: existing.id, name: existing.name, already_existed: true }
  }

  const place = await fetchPlaceDetails(placeId)
  const row = mapPlaceToRestaurantRow(place)

  // Image pipeline
  let imagePath: string | null = null
  let blurhash: string | null = null
  let imageWidth: number | null = null
  let imageHeight: number | null = null

  if (place.photos?.[0]) {
    try {
      const photoUrl = getPhotoUrl(place.photos[0].name)
      const processed = await processImage(photoUrl)
      imagePath = await uploadRestaurantImage(placeId, processed.buffer)
      blurhash = processed.blurhash
      imageWidth = processed.width
      imageHeight = processed.height
    } catch {
      // Image failure should not block the restaurant from being saved
    }
  }

  const record = await insertRestaurant({
    ...row,
    primary_image_path: imagePath,
    image_blurhash: blurhash,
    image_width: imageWidth,
    image_height: imageHeight,
    submitted_by: submittedBy ?? null,
  })

  return { id: record.id, name: record.name, already_existed: false }
}
