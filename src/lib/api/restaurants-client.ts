import type { Restaurant } from '@/lib/types'
import { mapToRestaurant, type RestaurantSource } from '@/lib/domain/restaurant-view'
import { RESTAURANT_IMAGE_BASE_URL } from '@/lib/storage-url'

export const PAGE_SIZE = 20

export async function fetchRestaurantsPage(
  cuisineKeys: string[],
  offset: number,
): Promise<Restaurant[]> {
  const params = new URLSearchParams({ offset: String(offset), limit: String(PAGE_SIZE) })
  if (cuisineKeys.length > 0) params.set('cuisine', cuisineKeys.join(','))

  const res = await fetch(`/api/restaurants?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch restaurants: ${res.status}`)

  const { restaurants }: { restaurants: RestaurantSource[] } = await res.json()
  return restaurants.map((row) => mapToRestaurant(row, RESTAURANT_IMAGE_BASE_URL))
}
