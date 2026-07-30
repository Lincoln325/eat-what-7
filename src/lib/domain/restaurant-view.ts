import type { Restaurant } from '@/lib/types'
import { translateTags } from './tag-labels'

export interface RestaurantSource {
  id: string
  name: string
  name_zh: string | null
  primary_type_display_name_zh: string | null
  tags: string[]
  rating: number | null
  price_level: number | null
  primary_image_path: string | null
  image_blurhash: string | null
  google_maps_uri: string | null
  region: string | null
}

// Pure: map a DB row to the frontend view model, resolving image URL.
// Card's type label uses Google's own translated primaryTypeDisplayName —
// not our curated cuisine-mapping.ts filter labels, which exist only to
// group restaurants for the filter UI and don't cover every Google type.
export function mapToRestaurant(row: RestaurantSource, imageBaseUrl: string): Restaurant {
  return {
    id: row.id,
    name: row.name_zh ?? row.name,
    typeLabel: row.primary_type_display_name_zh ?? '餐廳',
    imageUrl: row.primary_image_path ? `${imageBaseUrl}/${row.primary_image_path}` : null,
    imageBlurhash: row.image_blurhash,
    rating: row.rating,
    priceLevel: row.price_level,
    tags: translateTags(row.tags),
    googleMapsUri: row.google_maps_uri,
    region: row.region,
  }
}
