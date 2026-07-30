import type { NextRequest } from 'next/server'
import { ingestPlace } from '@/lib/services/ingest'
import { hasValidSession } from '@/lib/auth/require-session'

// POST /api/restaurants/confirm  { placeIds: string[] }
// Adds the place ids the user selected from the search results. This is where
// the expensive work happens — per place: bilingual details fetch + image
// processing + insert. Imports sharp (via ingest), so it's one of the routes
// force-bundled with the linux binaries in next.config.ts.
export async function POST(request: NextRequest) {
  if (!(await hasValidSession())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const placeIds = body?.placeIds
  if (!Array.isArray(placeIds) || placeIds.length === 0) {
    return Response.json({ error: 'placeIds array is required' }, { status: 400 })
  }

  const settled = await Promise.allSettled(
    placeIds.map((id: string) => ingestPlace(id)),
  )

  const results = settled.map((r, i) => ({
    placeId: placeIds[i],
    ...(r.status === 'fulfilled'
      ? { ok: true as const, id: r.value.id, name: r.value.name, alreadyExisted: r.value.already_existed }
      : { ok: false as const, error: r.reason?.message ?? 'Unknown error' }),
  }))

  const failed = results.filter((r) => !r.ok).length
  return Response.json(
    { added: results.length - failed, failed, results },
    { status: failed === results.length ? 500 : 201 },
  )
}
