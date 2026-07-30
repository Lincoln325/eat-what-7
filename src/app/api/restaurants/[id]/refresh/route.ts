import type { NextRequest } from 'next/server'
import { refreshPlace } from '@/lib/services/ingest'
import { hasValidSession } from '@/lib/auth/require-session'

// POST /api/restaurants/[id]/refresh — re-fetch from Google and update the row.
// The only path that re-spends Places quota on an existing restaurant.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasValidSession())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const result = await refreshPlace(id)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
