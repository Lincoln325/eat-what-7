// Static config: maps a curated cuisine/subtype filter to Google's Places API
// `primaryType` taxonomy (Table A). Google rarely changes this, and updating
// it is a code change, not a DB migration — cuisine is a UI filter grouping
// over Google's taxonomy, not an entity we own.
//
// Flat list by design: broad cuisines (中菜, 日本菜) sit alongside specific
// subtypes (壽司, 拉麵) at the same level, so overlap between chips is
// expected and fine — a sushi place matches both 日本菜 and 壽司.
export interface CuisineFilter {
  key: string
  label: string
  googleTypes: string[]
}

export const CUISINE_FILTERS: CuisineFilter[] = [
  { key: 'chinese', label: '中菜', googleTypes: ['chinese_restaurant', 'cantonese_restaurant', 'szechuan_restaurant'] },
  { key: 'dim_sum', label: '點心', googleTypes: ['dim_sum_restaurant'] },
  { key: 'hot_pot', label: '火鍋', googleTypes: ['hot_pot_restaurant'] },
  { key: 'japanese', label: '日本菜', googleTypes: ['japanese_restaurant', 'izakaya_restaurant'] },
  { key: 'sushi', label: '壽司', googleTypes: ['sushi_restaurant'] },
  { key: 'ramen', label: '拉麵', googleTypes: ['ramen_restaurant'] },
  { key: 'korean', label: '韓菜', googleTypes: ['korean_restaurant'] },
  { key: 'bbq', label: '燒烤', googleTypes: ['barbecue_restaurant'] },
  { key: 'thai', label: '泰菜', googleTypes: ['thai_restaurant'] },
  { key: 'vietnamese', label: '越南菜', googleTypes: ['vietnamese_restaurant'] },
  { key: 'western', label: '西餐', googleTypes: ['american_restaurant'] },
  { key: 'steakhouse', label: '扒房', googleTypes: ['steak_house'] },
  { key: 'burgers', label: '漢堡', googleTypes: ['hamburger_restaurant'] },
  { key: 'italian', label: '意大利菜', googleTypes: ['italian_restaurant'] },
  { key: 'pizza', label: '意式薄餅', googleTypes: ['pizza_restaurant'] },
  { key: 'indian', label: '印度菜', googleTypes: ['indian_restaurant'] },
  { key: 'seafood', label: '海鮮', googleTypes: ['seafood_restaurant'] },
  { key: 'dessert', label: '甜品/糖水', googleTypes: ['dessert_shop', 'dessert_restaurant'] },
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
