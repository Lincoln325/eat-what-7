export type PlaceIdResult =
  | { type: 'found'; placeId: string }
  | { type: 'needs_text_search'; query: string }
  | { type: 'needs_resolve'; url: string }

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

    // Extract business name from path for text search fallback
    const pathMatch = url.match(/\/maps\/place\/([^/@]+)/)
    if (pathMatch) {
      const query = decodeURIComponent(pathMatch[1].replace(/\+/g, ' '))
      return { type: 'needs_text_search', query }
    }
  } catch {
    // invalid URL — fall through
  }

  return { type: 'needs_resolve', url }
}

export function isShortUrl(url: string): boolean {
  return url.includes('goo.gl') || url.includes('maps.app')
}
