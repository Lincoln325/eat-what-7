import type { NextRequest } from 'next/server'
import { ingestPlace } from '@/lib/services/ingest'

const BATCH_API_KEY = process.env.BATCH_API_KEY!

// POST /api/restaurants/batch
// Header: Authorization: Bearer <BATCH_API_KEY>
// Body: { place_ids: string[] }
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth || auth !== `Bearer ${BATCH_API_KEY}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!Array.isArray(body?.place_ids) || body.place_ids.length === 0) {
    return Response.json({ error: 'place_ids array is required' }, { status: 400 })
  }

  const results = await Promise.allSettled(
    body.place_ids.map((id: string) => ingestPlace(id))
  )

  const summary = results.map((r, i) => ({
    place_id: body.place_ids[i],
    ...(r.status === 'fulfilled'
      ? { ok: true, ...r.value }
      : { ok: false, error: r.reason?.message ?? 'Unknown error' }),
  }))

  const failed = summary.filter((r) => !r.ok).length
  return Response.json(
    { total: summary.length, failed, results: summary },
    { status: failed === summary.length ? 500 : 200 },
  )
}
