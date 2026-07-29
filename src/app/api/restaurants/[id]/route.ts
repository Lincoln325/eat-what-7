import type { NextRequest } from 'next/server'
import { getRestaurantById, deleteRestaurantById } from '@/lib/infra/restaurant-repo'
import { purgePlaceImage } from '@/lib/services/ingest'
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
    await purgePlaceImage(id)
    await deleteRestaurantById(id)
    return Response.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
