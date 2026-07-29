export interface Restaurant {
  id: string
  name: string
  // Google's own translated label for primaryType (e.g. "壽司餐廳"), shown
  // on the card. Not the same as our curated filter labels in cuisine-mapping.ts.
  typeLabel: string
  imageUrl: string | null
  imageBlurhash: string | null
  rating: number | null
  priceLevel: number | null
  // Chinese-translated supplementary tags (already filtered/deduped via
  // tag-labels.ts) — never render raw Google type strings directly.
  tags: string[]
  googleMapsUri: string | null
}

// Full detail view for the RestaurantDetailSheet — a superset of the card's
// Restaurant, with contact info and opening hours resolved from the cached
// raw_place_data (no extra Google call). Fetched on demand by id.
export interface RestaurantDetail {
  id: string
  name: string
  typeLabel: string
  imageUrl: string | null
  imageBlurhash: string | null
  rating: number | null
  ratingCount: number | null
  priceLevel: number | null
  tags: string[]
  address: string | null
  phone: string | null
  website: string | null
  googleMapsUri: string | null
  // Localised weekday lines, e.g. "星期一: 上午11:00 至 下午10:00"
  openingHours: string[]
  updatedAt: string | null
}

// Preview of a place resolved from a Google Maps URL, before it's committed
// to the database. Carries the raw bilingual payload so confirm can insert
// without a second details call.
export interface PlacePreview {
  name: string
  typeLabel: string
  imageUrl: string | null
  rating: number | null
  ratingCount: number | null
  priceLevel: number | null
  address: string | null
  tags: string[]
  alreadyExists: boolean
  existingId: string | null
  // Opaque handoff to POST /confirm — the resolved place id.
  placeId: string
}

export type AppView = 'swipe' | 'selection'
