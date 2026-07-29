import type { NextRequest } from 'next/server'
import { refreshPlace } from '@/lib/services/ingest'

// POST /api/restaurants/[id]/refresh — re-fetch from Google and update the row.
// The only path that re-spends Places quota on an existing restaurant.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const result = await refreshPlace(id)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
