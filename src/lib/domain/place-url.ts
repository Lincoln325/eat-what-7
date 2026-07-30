export interface LatLng {
  lat: number
  lng: number
}

export type PlaceIdResult =
  | { type: 'found'; placeId: string }
  | { type: 'needs_text_search'; query: string; location?: LatLng }
  | { type: 'needs_resolve'; url: string }

// Pull the pin coordinates out of a resolved Maps URL. The `@lat,lng,zoom`
// segment points at the exact place the link was shared for, so it lets us
// disambiguate same-name places in other regions and pick the correct branch.
export function extractLatLng(url: string): LatLng | undefined {
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) }

  // Fallback: the data= block carries the true pin as !3d<lat>!4d<lng>
  // (the @-coords are the map viewport centre, which can drift).
  const dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (dMatch) return { lat: Number(dMatch[1]), lng: Number(dMatch[2]) }

  return undefined
}

// Pure: extract Place ID from a fully-resolved (non-short) Google Maps URL
export function extractPlaceIdFromUrl(url: string): PlaceIdResult {
  // Pattern: !1sChIJ... in the data= param
  const dataMatch = url.match(/!1s(ChIJ[^!&]+)/)
  if (dataMatch) {
    return { type: 'found', placeId: decodeURIComponent(dataMatch[1]) }
  }

  // Direct query param
  try {
    const parsed = new URL(url)
    const directId = parsed.searchParams.get('place_id')
    if (directId) return { type: 'found', placeId: directId }

    // Extract business name from path for text search fallback. Real share
    // URLs rarely carry a ChIJ id, so this is the common path — pair the name
    // with the pin coordinates so the search resolves the exact place.
    const pathMatch = url.match(/\/maps\/place\/([^/@]+)/)
    if (pathMatch) {
      const query = decodeURIComponent(pathMatch[1].replace(/\+/g, ' '))
      return { type: 'needs_text_search', query, location: extractLatLng(url) }
    }
  } catch {
    // invalid URL — fall through
  }

  return { type: 'needs_resolve', url }
}

export function isShortUrl(url: string): boolean {
  return url.includes('goo.gl') || url.includes('maps.app')
}
