import { describe, it, expect } from 'vitest'
import { mapToSearchResult } from './place-search'

describe('mapToSearchResult', () => {
  it('maps a full place to a card base', () => {
    const result = mapToSearchResult({
      id: 'ChIJabc',
      displayName: { text: '添好運' },
      shortFormattedAddress: '中環租庇利街',
      formattedAddress: '香港中環租庇利街 24-26 號',
      primaryTypeDisplayName: { text: '點心店' },
      types: ['restaurant', 'chinese_restaurant'],
      photos: [{ name: 'places/ChIJabc/photos/xyz' }],
    })
    expect(result).toEqual({
      placeId: 'ChIJabc',
      name: '添好運',
      typeLabel: '點心店',
      address: '中環租庇利街',
      tags: expect.any(Array),
      photoName: 'places/ChIJabc/photos/xyz',
    })
  })

  it('prefers short address, falls back to formatted', () => {
    expect(
      mapToSearchResult({ id: 'x', formattedAddress: '長地址' }).address,
    ).toBe('長地址')
  })

  it('falls back gracefully when fields are missing', () => {
    const result = mapToSearchResult({ id: 'x' })
    expect(result).toEqual({
      placeId: 'x',
      name: '未命名',
      typeLabel: '餐廳',
      address: null,
      tags: [],
      photoName: null,
    })
  })
})
