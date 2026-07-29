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

export type AppView = 'swipe' | 'selection'
