import { extractPlaceIdFromUrl, isShortUrl } from '@/lib/domain/place-url'
import type { LatLng } from '@/lib/domain/place-url'
import type { PlaceDetails } from '@/lib/domain/place-mapping'
import type { SearchPlace } from '@/lib/domain/place-search'

const PLACES_BASE = 'https://places.googleapis.com/v1'

// Cheap card fields (Text Search / Details "Pro" tier). Deliberately excludes
// rating/priceLevel (Enterprise tier) — those are fetched only on confirm-add.
const SEARCH_FIELD_MASK = [
  'id', 'displayName', 'formattedAddress', 'shortFormattedAddress',
  'primaryTypeDisplayName', 'types', 'photos',
].join(',')

const MAX_RESULTS = 5

const DETAILS_FIELD_MASK = [
  'id', 'displayName', 'formattedAddress', 'location',
  'priceLevel', 'rating', 'userRatingCount',
  'internationalPhoneNumber', 'websiteUri', 'businessStatus',
  'types', 'primaryType', 'primaryTypeDisplayName', 'regularOpeningHours', 'photos', 'reviews',
  'addressComponents', 'editorialSummary',
  'accessibilityOptions', 'delivery', 'dineIn', 'takeout',
  'reservable', 'servesBeer', 'servesBreakfast', 'servesBrunch',
  'servesDinner', 'servesLunch', 'servesWine', 'curbsidePickup',
  'googleMapsUri', 'utcOffsetMinutes',
].join(',')

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY is not set')
  return key
}

// Text Search (Pro tier) capped at MAX_RESULTS. HK region + optional location
// bias (from a pasted URL's pin) so the user picks from the right candidates
// rather than us guessing. The old auto-pick of places[0] silently returned
// same-name overseas places / wrong branches — now a human disambiguates.
export async function searchPlaces(
  query: string,
  location?: LatLng,
): Promise<SearchPlace[]> {
  const body: Record<string, unknown> = {
    textQuery: query,
    regionCode: 'HK',
    languageCode: 'zh-HK',
    pageSize: MAX_RESULTS,
  }
  if (location) {
    body.locationBias = {
      circle: {
        center: { latitude: location.lat, longitude: location.lng },
        radius: 500, // metres — tight enough to pin the exact branch
      },
    }
  }

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': SEARCH_FIELD_MASK.split(',').map((f) => `places.${f}`).join(','),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(`Places API error: ${res.status} — ${errBody?.error?.message ?? ''}`)
  }
  const json = await res.json()
  return (json.places ?? []).slice(0, MAX_RESULTS) as SearchPlace[]
}

// A pasted URL resolves to a specific place; fetch just the card-level fields
// for it (Pro tier) so URL mode and text mode present identical result cards.
export async function fetchSearchPlace(placeId: string): Promise<SearchPlace> {
  const res = await fetch(`${PLACES_BASE}/places/${placeId}?languageCode=zh-HK`, {
    headers: {
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': SEARCH_FIELD_MASK,
    },
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(`Places API error: ${res.status} — ${errBody?.error?.message ?? ''}`)
  }
  return (await res.json()) as SearchPlace
}

// Turn a pasted Maps URL into search results. When the URL carries a place id
// we resolve it to a single card; otherwise we run a text search biased to the
// pin so the branch the link points at ranks first.
export async function searchByUrl(mapsUrl: string): Promise<SearchPlace[]> {
  let url = mapsUrl
  if (isShortUrl(url)) {
    const res = await fetch(url, { redirect: 'follow' })
    url = res.url
  }

  const result = extractPlaceIdFromUrl(url)
  if (result.type === 'found') return [await fetchSearchPlace(result.placeId)]
  if (result.type === 'needs_text_search') {
    return searchPlaces(result.query, result.location)
  }
  throw new Error('Could not extract place from URL')
}

// Resolve a photo resource name to a keyless, client-safe image URL.
// skipHttpRedirect returns JSON { photoUri } pointing at googleusercontent —
// so the API key never leaves the server.
export async function resolvePhotoUrl(
  photoName: string,
  maxWidthPx = 800,
): Promise<string | null> {
  const res = await fetch(
    `${PLACES_BASE}/${photoName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`,
    { headers: { 'X-Goog-Api-Key': apiKey() } },
  )
  if (!res.ok) return null
  const json = await res.json().catch(() => null)
  return json?.photoUri ?? null
}

export async function fetchPlaceDetails(
  placeId: string,
  languageCode = 'en',
): Promise<PlaceDetails> {
  const res = await fetch(
    `${PLACES_BASE}/places/${placeId}?languageCode=${languageCode}`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey(),
        'X-Goog-FieldMask': DETAILS_FIELD_MASK,
      },
    },
  )
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(`Places API error: ${res.status} — ${errBody?.error?.message ?? ''}`)
  }
  return (await res.json()) as PlaceDetails
}

// photoName is the resource path, e.g. "places/ChIJ.../photos/AeK..."
// Returns a URL that 302-redirects to the actual image binary.
export function getPhotoUrl(photoName: string, maxWidthPx = 1200): string {
  return `${PLACES_BASE}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey()}`
}
