import type { Restaurant, RestaurantDetail, PlacePreview } from '@/lib/types'
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

// The payload is opaque to the client — handed straight back to confirm.
export interface PreviewResponse {
  preview: PlacePreview
  payload: unknown
}

export async function previewRestaurant(url: string): Promise<PreviewResponse> {
  const res = await fetch('/api/restaurants/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) return asError(res, `Failed to preview: ${res.status}`)
  return res.json()
}

export async function confirmRestaurant(payload: unknown): Promise<{ id: string; name: string }> {
  const res = await fetch('/api/restaurants/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  })
  if (!res.ok) return asError(res, `Failed to add: ${res.status}`)
  return res.json()
}
