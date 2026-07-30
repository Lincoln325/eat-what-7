import type { BilingualPlaceDetails } from '@/lib/domain/place-mapping'

interface AddressComponent {
  longText?: string
  shortText?: string
  types?: string[]
}

// Google's zh-HK payload sometimes echoes the English district name (e.g.
// "Central", "Kowloon City") instead of translating it. This maps the common
// HK districts + neighborhoods we see back to Chinese so cards read uniformly.
// Bounded set — HK has ~18 districts plus a handful of well-known areas.
const EN_TO_ZH_DISTRICT: Record<string, string> = {
  // Hong Kong Island
  Central: '中環',
  Admiralty: '金鐘',
  'Sheung Wan': '上環',
  'Sai Ying Pun': '西營盤',
  'Kennedy Town': '堅尼地城',
  'Shek Tong Tsui': '石塘咀',
  'Wan Chai': '灣仔',
  'Causeway Bay': '銅鑼灣',
  'Tin Hau': '天后',
  'North Point': '北角',
  'Quarry Bay': '鰂魚涌',
  'Tai Koo': '太古',
  'Sai Wan Ho': '西灣河',
  'Shau Kei Wan': '筲箕灣',
  'Chai Wan': '柴灣',
  'Happy Valley': '跑馬地',
  Aberdeen: '香港仔',
  'Wong Chuk Hang': '黃竹坑',
  'Stanley': '赤柱',
  'Repulse Bay': '淺水灣',
  'Hong Kong Island': '香港島',
  // Kowloon
  'Tsim Sha Tsui': '尖沙咀',
  'Jordan': '佐敦',
  'Yau Ma Tei': '油麻地',
  'Mong Kok': '旺角',
  'Prince Edward': '太子',
  'Sham Shui Po': '深水埗',
  'Cheung Sha Wan': '長沙灣',
  'Lai Chi Kok': '荔枝角',
  'Kowloon City': '九龍城',
  'To Kwa Wan': '土瓜灣',
  'Hung Hom': '紅磡',
  'Ho Man Tin': '何文田',
  'Kowloon Tong': '九龍塘',
  'Wong Tai Sin': '黃大仙',
  'Diamond Hill': '鑽石山',
  'Kowloon Bay': '九龍灣',
  'Ngau Tau Kok': '牛頭角',
  'Kwun Tong': '觀塘',
  'Lam Tin': '藍田',
  'Yau Tong': '油塘',
  Kowloon: '九龍',
  // New Territories
  'Tsuen Wan': '荃灣',
  'Kwai Chung': '葵涌',
  'Tsing Yi': '青衣',
  'Sha Tin': '沙田',
  'Shatin': '沙田',
  'Tai Wai': '大圍',
  'Ma On Shan': '馬鞍山',
  'Tai Po': '大埔',
  'Fanling': '粉嶺',
  'Sheung Shui': '上水',
  'Yuen Long': '元朗',
  'Tin Shui Wai': '天水圍',
  'Tuen Mun': '屯門',
  'Sai Kung': '西貢',
  'Tseung Kwan O': '將軍澳',
  'New Territories': '新界',
  'Tung Chung': '東涌',
}

// Translate an English HK district/area name to Chinese when we know it;
// otherwise return it unchanged (better a known English name than nothing).
function toZhDistrict(value: string): string {
  return EN_TO_ZH_DISTRICT[value] ?? value
}

function componentByType(
  components: AddressComponent[],
  type: string,
): string | null {
  const match = components.find((c) => c.types?.includes(type))
  return match?.longText ?? null
}

// Extract a short, human region label for the swipe card — the district people
// actually name (中環 / 銅鑼灣 / 九龍城), not the full address. Google's zh-HK
// translation is inconsistent (sometimes returns "Central" even in the zh
// payload), so we prefer zh but fall back to en, and fall back from the
// specific neighborhood to the broader administrative area when needed.
export function extractRegion(raw: BilingualPlaceDetails): string | null {
  const zh = (raw?.zh_hk?.addressComponents ?? []) as AddressComponent[]
  const en = (raw?.en?.addressComponents ?? []) as AddressComponent[]

  const region =
    componentByType(zh, 'neighborhood') ??
    componentByType(en, 'neighborhood') ??
    componentByType(zh, 'administrative_area_level_1') ??
    componentByType(en, 'administrative_area_level_1') ??
    null

  return region === null ? null : toZhDistrict(region)
}
