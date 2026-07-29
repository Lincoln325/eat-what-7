// Static config: Chinese labels for Google Places `types` values, used only
// for the supplementary tag chips on the card (not the main type badge,
// which uses Google's own primaryTypeDisplayName translation). Broader
// coverage than cuisine-mapping.ts's curated filter list — includes
// descriptive tags (bakery, cafe, bar) that aren't cuisines. Unmapped tags
// are silently dropped rather than shown in raw snake_case.
const TAG_LABELS: Record<string, string> = {
  chinese_restaurant: '中菜',
  cantonese_restaurant: '粵菜',
  szechuan_restaurant: '川菜',
  dim_sum_restaurant: '點心',
  hot_pot_restaurant: '火鍋',
  japanese_restaurant: '日本菜',
  izakaya_restaurant: '居酒屋',
  sushi_restaurant: '壽司',
  ramen_restaurant: '拉麵',
  korean_restaurant: '韓菜',
  barbecue_restaurant: '燒烤',
  thai_restaurant: '泰菜',
  vietnamese_restaurant: '越南菜',
  american_restaurant: '西餐',
  steak_house: '扒房',
  hamburger_restaurant: '漢堡',
  sandwich_shop: '三文治',
  italian_restaurant: '意大利菜',
  pizza_restaurant: '薄餅',
  indian_restaurant: '印度菜',
  seafood_restaurant: '海鮮',
  dessert_shop: '甜品',
  dessert_restaurant: '甜品',
  bakery: '麵包店',
  cafe: '咖啡店',
  bar: '酒吧',
  pub: '酒吧',
  fast_food_restaurant: '快餐',
  food_court: '美食廣場',
  vegan_restaurant: '純素',
  vegetarian_restaurant: '素食',
  fine_dining_restaurant: '高級餐廳',
  breakfast_restaurant: '早餐',
  brunch_restaurant: '早午餐',
  halal_restaurant: '清真',
}

// Pure: translate raw Google tags to Chinese, dropping anything unmapped
// and de-duplicating (multiple tags can map to the same label).
export function translateTags(tags: string[]): string[] {
  const seen = new Set<string>()
  for (const tag of tags) {
    const label = TAG_LABELS[tag]
    if (label) seen.add(label)
  }
  return [...seen]
}
