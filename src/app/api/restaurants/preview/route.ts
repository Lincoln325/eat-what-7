import type { NextRequest } from 'next/server'
import { resolvePlaceId } from '@/lib/infra/places-api'
import { previewPlace } from '@/lib/services/ingest'

// POST /api/restaurants/preview  { url }
// Resolves a Google Maps URL, fetches details, builds (but does not insert)
// the record, and returns a preview + opaque payload for the confirm step.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.url || typeof body.url !== 'string') {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    const placeId = await resolvePlaceId(body.url)
    const { preview, payload } = await previewPlace(placeId)
    return Response.json({ preview, payload })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
