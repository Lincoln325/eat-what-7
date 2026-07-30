import type { NextRequest } from 'next/server'
import { listRestaurants } from '@/lib/infra/restaurant-repo'

// GET /api/restaurants?cuisine=japanese,thai&offset=0&limit=20&seed=abc&lat=..&lng=..
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const cuisineParam = params.get('cuisine')
  const cuisineKeys = cuisineParam ? cuisineParam.split(',').filter(Boolean) : undefined
  const offset = Number(params.get('offset') ?? '0')
  const limit = Number(params.get('limit') ?? '20')
  const seed = params.get('seed') ?? ''
  const latParam = params.get('lat')
  const lngParam = params.get('lng')
  const userLat = latParam !== null ? Number(latParam) : undefined
  const userLng = lngParam !== null ? Number(lngParam) : undefined

  try {
    const restaurants = await listRestaurants({
      cuisineKeys,
      offset,
      limit,
      seed,
      userLat: Number.isFinite(userLat) ? userLat : undefined,
      userLng: Number.isFinite(userLng) ? userLng : undefined,
    })
    return Response.json({ restaurants })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
