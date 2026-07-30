import {
  searchPlaces,
  searchByUrl,
  resolvePhotoUrl,
} from '@/lib/infra/places-api'
import { findManyByPlaceIds } from '@/lib/infra/restaurant-repo'
import { mapToSearchResult } from '@/lib/domain/place-search'
import { isShortUrl } from '@/lib/domain/place-url'
import type { PlaceSearchResult } from '@/lib/types'

// Cheap, no-sharp search for the Add flow. One Text Search call (or a URL
// resolve) → up to 5 cards, each with a resolved thumbnail and an
// already-in-DB flag so the client can disable duplicates. Google is NOT hit
// for full details or image processing here — that happens on confirm-add.
export async function searchForAdd(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim()
  const looksLikeUrl = /^https?:\/\//i.test(trimmed) || isShortUrl(trimmed)

  const places = looksLikeUrl
    ? await searchByUrl(trimmed)
    : await searchPlaces(trimmed)

  const bases = places.map(mapToSearchResult)

  const existing = await findManyByPlaceIds(bases.map((b) => b.placeId))
  const existingById = new Map(existing.map((r) => [r.google_place_id, r.id]))

  // Resolve thumbnails in parallel (≤5). A keyless photoUri, so it's safe to
  // hand to the client.
  return Promise.all(
    bases.map(async (b) => {
      const imageUrl = b.photoName ? await resolvePhotoUrl(b.photoName) : null
      const existingId = existingById.get(b.placeId) ?? null
      return {
        placeId: b.placeId,
        name: b.name,
        typeLabel: b.typeLabel,
        address: b.address,
        tags: b.tags,
        imageUrl,
        alreadyExists: existingId !== null,
        existingId,
      }
    }),
  )
}
