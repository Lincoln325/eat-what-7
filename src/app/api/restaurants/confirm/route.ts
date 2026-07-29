import type { NextRequest } from 'next/server'
import { confirmPlace } from '@/lib/services/ingest'
import type { InsertRestaurantInput } from '@/lib/infra/restaurant-repo'

// POST /api/restaurants/confirm  { payload }
// Inserts the record built during the preview step. No Google call.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const payload = body?.payload as InsertRestaurantInput | undefined
  if (!payload?.google_place_id) {
    return Response.json({ error: 'payload is required' }, { status: 400 })
  }

  try {
    const result = await confirmPlace(payload)
    return Response.json(result, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
