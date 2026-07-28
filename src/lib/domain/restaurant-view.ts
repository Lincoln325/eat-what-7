import type { Restaurant } from '@/lib/types'
import { findCuisineForRestaurant } from './cuisine-mapping'

export interface RestaurantSource {
  id: string
  name: string
  primary_type: string | null
  tags: string[]
  rating: number | null
  price_level: number | null
  primary_image_path: string | null
  image_blurhash: string | null
  google_maps_uri: string | null
}

// Pure: map a DB row to the frontend view model, resolving image URL and cuisine label.
export function mapToRestaurant(row: RestaurantSource, imageBaseUrl: string): Restaurant {
  const cuisine = findCuisineForRestaurant(row.primary_type, row.tags)

  return {
    id: row.id,
    name: row.name,
    cuisineLabel: cuisine?.label ?? 'Other',
    imageUrl: row.primary_image_path ? `${imageBaseUrl}/${row.primary_image_path}` : null,
    imageBlurhash: row.image_blurhash,
    rating: row.rating,
    priceLevel: row.price_level,
    tags: row.tags,
    googleMapsUri: row.google_maps_uri,
  }
}
