import { describe, it, expect } from 'vitest'
import { extractPlaceIdFromUrl, isShortUrl } from './place-url'

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

  it('falls back to text search when only name is in path', () => {
    const url = 'https://www.google.com/maps/place/Burnt+Ends/@1.28,103.82,17z'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({ type: 'needs_text_search', query: 'Burnt Ends' })
  })

  it('handles URL-encoded business names', () => {
    const url = 'https://www.google.com/maps/place/Les+Amis+Restaurant/@1.3,103.8,17z'
    const result = extractPlaceIdFromUrl(url)
    expect(result).toEqual({ type: 'needs_text_search', query: 'Les Amis Restaurant' })
  })

  it('returns needs_resolve for unrecognised URL shapes', () => {
    const result = extractPlaceIdFromUrl('not-a-url')
    expect(result.type).toBe('needs_resolve')
  })
})
