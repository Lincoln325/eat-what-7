export type CuisineType =
  | 'Chinese'
  | 'Japanese'
  | 'Korean'
  | 'Western'
  | 'Thai'
  | 'Italian'
  | 'Indian'

export interface Restaurant {
  id: string
  name: string
  cuisine: CuisineType
  imageUrl: string
  rating: number
  distanceKm: number
  priceRange: 1 | 2 | 3
  tags: string[]
}

export type AppView = 'swipe' | 'selection'
