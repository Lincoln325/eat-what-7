import type { NextRequest } from 'next/server'
import {
  getRestaurantById,
  deleteRestaurantById,
  getPlaceIdById,
} from '@/lib/infra/restaurant-repo'
import { deleteRestaurantImage } from '@/lib/infra/storage'
import { mapToRestaurantDetail } from '@/lib/domain/restaurant-detail'
import type { RestaurantDetailSource } from '@/lib/domain/restaurant-detail'
import { RESTAURANT_IMAGE_BASE_URL } from '@/lib/storage-url'

// GET /api/restaurants/[id] — full detail from cached data (no Google call)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const row = await getRestaurantById(id)
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 })

    const detail = mapToRestaurantDetail(
      row as unknown as RestaurantDetailSource,
      RESTAURANT_IMAGE_BASE_URL,
    )
    return Response.json({ restaurant: detail })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/restaurants/[id] — remove row + storage image (admin client)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    // Inline the storage cleanup here rather than importing from the ingest
    // service — ingest pulls in sharp (native libvips), which must not be
    // loaded by this read/delete-only route.
    const placeId = await getPlaceIdById(id)
    if (placeId) {
      try {
        await deleteRestaurantImage(placeId)
      } catch {
        // Missing image is fine — deleting the row is what matters.
      }
    }
    await deleteRestaurantById(id)
    return Response.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
