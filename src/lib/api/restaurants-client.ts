import type { Restaurant, RestaurantDetail, PlaceSearchResult } from '@/lib/types'
import { mapToRestaurant, type RestaurantSource } from '@/lib/domain/restaurant-view'
import { RESTAURANT_IMAGE_BASE_URL } from '@/lib/storage-url'

export const PAGE_SIZE = 20

export interface Coords {
  lat: number
  lng: number
}

export async function fetchRestaurantsPage(
  cuisineKeys: string[],
  offset: number,
  seed: string,
  coords: Coords | null,
): Promise<Restaurant[]> {
  const params = new URLSearchParams({ offset: String(offset), limit: String(PAGE_SIZE), seed })
  if (cuisineKeys.length > 0) params.set('cuisine', cuisineKeys.join(','))
  if (coords) {
    params.set('lat', String(coords.lat))
    params.set('lng', String(coords.lng))
  }

  const res = await fetch(`/api/restaurants?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch restaurants: ${res.status}`)

  const { restaurants }: { restaurants: RestaurantSource[] } = await res.json()
  return restaurants.map((row) => mapToRestaurant(row, RESTAURANT_IMAGE_BASE_URL))
}

async function asError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}))
  throw new Error(body?.error ?? fallback)
}

export async function fetchRestaurantDetail(id: string): Promise<RestaurantDetail> {
  const res = await fetch(`/api/restaurants/${id}`)
  if (!res.ok) return asError(res, `Failed to load detail: ${res.status}`)
  const { restaurant }: { restaurant: RestaurantDetail } = await res.json()
  return restaurant
}

export async function deleteRestaurant(id: string): Promise<void> {
  const res = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' })
  if (!res.ok) await asError(res, `Failed to delete: ${res.status}`)
}

export async function refreshRestaurant(id: string): Promise<void> {
  const res = await fetch(`/api/restaurants/${id}/refresh`, { method: 'POST' })
  if (!res.ok) await asError(res, `Failed to refresh: ${res.status}`)
}

// Search for places to add — a name or a pasted Maps URL. Returns up to 5
// selectable candidates. Cheap: no details/image work happens here.
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const res = await fetch('/api/restaurants/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) return asError(res, `Failed to search: ${res.status}`)
  const { results }: { results: PlaceSearchResult[] } = await res.json()
  return results
}

export interface AddResult {
  placeId: string
  ok: boolean
  name?: string
  alreadyExisted?: boolean
  error?: string
}

export interface AddResponse {
  added: number
  failed: number
  results: AddResult[]
}

// Add the selected place ids. This is the expensive step (details + image
// processing + insert per place, server-side).
export async function addRestaurants(placeIds: string[]): Promise<AddResponse> {
  const res = await fetch('/api/restaurants/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeIds }),
  })
  if (!res.ok) return asError(res, `Failed to add: ${res.status}`)
  return res.json()
}
