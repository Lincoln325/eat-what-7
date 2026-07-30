import type { NextRequest } from 'next/server'
import { searchForAdd } from '@/lib/services/place-search'

// POST /api/restaurants/search  { query }
// query is a name or a pasted Google Maps URL. Returns up to 5 selectable
// candidates (name/type/address/photo + already-in-DB flag). Cheap: one Text
// Search call + ≤5 photo lookups. No details fetch, no image processing, no
// sharp — so this route stays light and deploys clean.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.query || typeof body.query !== 'string') {
    return Response.json({ error: 'query is required' }, { status: 400 })
  }

  try {
    const results = await searchForAdd(body.query)
    return Response.json({ results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
