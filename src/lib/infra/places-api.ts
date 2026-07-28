import { extractPlaceIdFromUrl, isShortUrl } from '@/lib/domain/place-url'
import type { PlaceDetails } from '@/lib/domain/place-mapping'

const PLACES_BASE = 'https://places.googleapis.com/v1'

const DETAILS_FIELD_MASK = [
  'id', 'displayName', 'formattedAddress', 'location',
  'priceLevel', 'rating', 'userRatingCount',
  'internationalPhoneNumber', 'websiteUri', 'businessStatus',
  'types', 'primaryType', 'regularOpeningHours', 'photos', 'reviews',
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

export async function resolvePlaceId(mapsUrl: string): Promise<string> {
  let url = mapsUrl

  if (isShortUrl(url)) {
    const res = await fetch(url, { redirect: 'follow' })
    url = res.url
  }

  const result = extractPlaceIdFromUrl(url)

  if (result.type === 'found') return result.placeId
  if (result.type === 'needs_text_search') return findPlaceByText(result.query)

  throw new Error('Could not extract Place ID from URL')
}

async function findPlaceByText(query: string): Promise<string> {
  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: query }),
  })
  const json = await res.json()
  const placeId = json.places?.[0]?.id
  if (!placeId) throw new Error(`Place not found for query: ${query}`)
  return placeId
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': DETAILS_FIELD_MASK,
    },
  })
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
