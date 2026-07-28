export interface Restaurant {
  id: string
  name: string
  cuisineLabel: string
  imageUrl: string | null
  imageBlurhash: string | null
  rating: number | null
  priceLevel: number | null
  tags: string[]
  googleMapsUri: string | null
}

export type AppView = 'swipe' | 'selection'
