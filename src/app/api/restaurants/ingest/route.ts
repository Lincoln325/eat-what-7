import type { NextRequest } from 'next/server'
import { resolvePlaceId } from '@/lib/infra/places-api'
import { ingestPlace } from '@/lib/services/ingest'

// POST /api/restaurants/ingest
// Body: { url: string }   — a Google Maps URL
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.url || typeof body.url !== 'string') {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    const placeId = await resolvePlaceId(body.url)
    const result = await ingestPlace(placeId)

    return Response.json(result, { status: result.already_existed ? 200 : 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
