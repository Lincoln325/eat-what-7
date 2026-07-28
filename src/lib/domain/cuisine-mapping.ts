// Static config: maps a curated cuisine filter to Google's Places API
// `primaryType` taxonomy (Table A). Google rarely changes this, and updating
// it is a code change, not a DB migration — cuisine is a UI filter grouping
// over Google's taxonomy, not an entity we own.
export interface CuisineFilter {
  key: string
  label: string
  googleTypes: string[]
}

export const CUISINE_FILTERS: CuisineFilter[] = [
  {
    key: 'chinese',
    label: 'Chinese',
    googleTypes: [
      'chinese_restaurant',
      'cantonese_restaurant',
      'dim_sum_restaurant',
      'hot_pot_restaurant',
      'szechuan_restaurant',
    ],
  },
  {
    key: 'japanese',
    label: 'Japanese',
    googleTypes: [
      'japanese_restaurant',
      'sushi_restaurant',
      'ramen_restaurant',
      'izakaya_restaurant',
    ],
  },
  {
    key: 'korean',
    label: 'Korean',
    googleTypes: ['korean_restaurant'],
  },
  {
    key: 'western',
    label: 'Western',
    googleTypes: [
      'american_restaurant',
      'hamburger_restaurant',
      'steak_house',
      'barbecue_restaurant',
      'sandwich_shop',
    ],
  },
  {
    key: 'thai',
    label: 'Thai',
    googleTypes: ['thai_restaurant'],
  },
  {
    key: 'italian',
    label: 'Italian',
    googleTypes: ['italian_restaurant', 'pizza_restaurant'],
  },
  {
    key: 'indian',
    label: 'Indian',
    googleTypes: ['indian_restaurant'],
  },
]

// Pure: find the cuisine filter for a restaurant. primaryType is the strong
// signal, but Google sometimes returns a generic primaryType (e.g. "restaurant")
// even when a specific type exists in tags (e.g. "steak_house") — fall back
// to scanning tags in that case.
export function findCuisineForRestaurant(
  primaryType: string | null,
  tags: string[] = [],
): CuisineFilter | null {
  if (primaryType) {
    const byPrimaryType = CUISINE_FILTERS.find((c) => c.googleTypes.includes(primaryType))
    if (byPrimaryType) return byPrimaryType
  }
  return CUISINE_FILTERS.find((c) => c.googleTypes.some((t) => tags.includes(t))) ?? null
}

// Pure: flatten all googleTypes for a given cuisine key, for use in a query filter
export function getGoogleTypesForCuisineKey(key: string): string[] {
  return CUISINE_FILTERS.find((c) => c.key === key)?.googleTypes ?? []
}
