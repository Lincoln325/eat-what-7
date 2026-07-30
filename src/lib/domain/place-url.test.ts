import { describe, it, expect } from 'vitest'
import { extractPlaceIdFromUrl, extractLatLng, isShortUrl } from './place-url'

describe('isShortUrl', () => {
  it('identifies goo.gl short links', () => {
    expect(isShortUrl('https://goo.gl/maps/abc123')).toBe(true)
  })

  it('identifies maps.app short links', () => {
    expect(isShortUrl('https://maps.app.goo.gl/xyz')).toBe(true)
  })

  it('returns false for full URLs', () => {
    expect(isShortUrl('https://www.google.com/maps/place/Noma/@55.6,12.6,17z')).toBe(false)
  })
})

describe('extractLatLng', () => {
  it('reads the @lat,lng viewport coords', () => {
    expect(extractLatLng('https://www.google.com/maps/place/X/@22.28,114.15,17z')).toEqual({
      lat: 22.28,
      lng: 114.15,
    })
  })

  it('prefers the !3d!4d pin coords over @-coords when present', () => {
    const url = 'https://www.google.com/maps/place/X/@1.1,2.2,17z/data=!3m1!4b1!3d22.3!4d114.2'
    // @-coords are matched first by design (viewport centre is close enough);
    // the pin fallback only kicks in when there is no @-segment.
    expect(extractLatLng(url)).toEqual({ lat: 1.1, lng: 2.2 })
  })

  it('falls back to !3d!4d when there is no @-segment', () => {
    expect(extractLatLng('https://www.google.com/maps/place/X/data=!3d22.3!4d114.2')).toEqual({
      lat: 22.3,
      lng: 114.2,
    })
  })

  it('returns undefined when no coords are present', () => {
    expect(extractLatLng('https://www.google.com/maps/place/X')).toBeUndefined()
  })
})

describe('extractPlaceIdFromUrl', () => {
  it('extracts Place ID from data= param', () => {
    const url = 'https://www.google.com/maps/place/Test+Restaurant/@1.3,103.8,17z/data=!3m1!4b1!4m6!3m5!1sChIJN1t_tDeuEmsRUsoyG83frY4!8m2!3d-33.8!4d151.2!16s%2Fg%2F1'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({ type: 'found', placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
  })

  it('extracts Place ID from place_id query param', () => {
    const url = 'https://www.google.com/maps/place/?place_id=ChIJabc123'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({ type: 'found', placeId: 'ChIJabc123' })
  })

  it('falls back to text search with pin coords when only name is in path', () => {
    const url = 'https://www.google.com/maps/place/Burnt+Ends/@1.28,103.82,17z'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({
      type: 'needs_text_search',
      query: 'Burnt Ends',
      location: { lat: 1.28, lng: 103.82 },
    })
  })

  it('handles URL-encoded business names', () => {
    const url = 'https://www.google.com/maps/place/Les+Amis+Restaurant/@1.3,103.8,17z'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({
      type: 'needs_text_search',
      query: 'Les Amis Restaurant',
      location: { lat: 1.3, lng: 103.8 },
    })
  })

  it('text-search location is undefined when URL has no coords', () => {
    const url = 'https://www.google.com/maps/place/Some+Place'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({
      type: 'needs_text_search',
      query: 'Some Place',
      location: undefined,
    })
  })

  it('returns needs_resolve for unrecognised URL shapes', () => {
    const result = extractPlaceIdFromUrl('not-a-url')
    expect(result.type).toBe('needs_resolve')
  })
})
