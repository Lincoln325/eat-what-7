import { describe, it, expect } from 'vitest'
import { extractRegion } from './region'
import type { BilingualPlaceDetails } from '@/lib/domain/place-mapping'

function raw(
  zhComps: Array<{ longText: string; types: string[] }>,
  enComps: Array<{ longText: string; types: string[] }> = [],
): BilingualPlaceDetails {
  return {
    zh_hk: { id: 'x', addressComponents: zhComps },
    en: { id: 'x', addressComponents: enComps },
  } as unknown as BilingualPlaceDetails
}

describe('extractRegion', () => {
  it('prefers the zh neighborhood', () => {
    expect(
      extractRegion(
        raw(
          [{ longText: '銅鑼灣', types: ['neighborhood', 'political'] }],
          [{ longText: 'Causeway Bay', types: ['neighborhood', 'political'] }],
        ),
      ),
    ).toBe('銅鑼灣')
  })

  it('falls back to en neighborhood (translated) when zh has none', () => {
    expect(
      extractRegion(
        raw(
          [{ longText: '香港島', types: ['administrative_area_level_1', 'political'] }],
          [{ longText: 'Kowloon City', types: ['neighborhood', 'political'] }],
        ),
      ),
    ).toBe('九龍城')
  })

  it('falls back to admin area when no neighborhood anywhere', () => {
    expect(
      extractRegion(
        raw([{ longText: '九龍', types: ['administrative_area_level_1', 'political'] }]),
      ),
    ).toBe('九龍')
  })

  it('translates an English district name to Chinese', () => {
    expect(
      extractRegion(raw([{ longText: 'Central', types: ['neighborhood', 'political'] }])),
    ).toBe('中環')
  })

  it('translates a known English fallback area to Chinese', () => {
    expect(
      extractRegion(
        raw([{ longText: 'Kowloon City', types: ['neighborhood', 'political'] }]),
      ),
    ).toBe('九龍城')
  })

  it('leaves an unknown English name unchanged rather than blanking it', () => {
    expect(
      extractRegion(raw([{ longText: 'Somewhere', types: ['neighborhood'] }])),
    ).toBe('Somewhere')
  })

  it('passes through a Chinese district untouched', () => {
    expect(
      extractRegion(raw([{ longText: '銅鑼灣', types: ['neighborhood'] }])),
    ).toBe('銅鑼灣')
  })

  it('returns null when no usable component exists', () => {
    expect(extractRegion(raw([{ longText: 'HK', types: ['country'] }]))).toBeNull()
  })

  it('handles missing addressComponents', () => {
    expect(extractRegion({ en: { id: 'x' }, zh_hk: { id: 'x' } } as unknown as BilingualPlaceDetails)).toBeNull()
  })
})
