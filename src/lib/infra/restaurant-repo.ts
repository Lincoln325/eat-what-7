import { supabase, createAdminClient } from '@/lib/supabase'
import type { RestaurantRow } from '@/lib/domain/place-mapping'
import { getGoogleTypesForCuisineKey } from '@/lib/domain/cuisine-mapping'

export interface RestaurantRecord {
  id: string
  name: string
}

export interface RestaurantListItem {
  id: string
  name: string
  name_zh: string | null
  primary_type: string | null
  primary_type_display_name_zh: string | null
  tags: string[]
  rating: number | null
  price_level: number | null
  primary_image_path: string | null
  image_blurhash: string | null
  google_maps_uri: string | null
}

export interface ListRestaurantsOptions {
  cuisineKeys?: string[]
  offset?: number
  limit?: number
}

// Public read: filters by cuisine using primaryType (strong signal) with a
// tags fallback, since Google sometimes returns a generic primaryType even
// when a specific type is present in tags. See domain/cuisine-mapping.ts.
export async function listRestaurants(
  options: ListRestaurantsOptions = {},
): Promise<RestaurantListItem[]> {
  const { cuisineKeys, offset = 0, limit = 20 } = options

  let query = supabase
    .from('restaurants')
    .select('id, name, name_zh, primary_type, primary_type_display_name_zh, tags, rating, price_level, primary_image_path, image_blurhash, google_maps_uri')
    .range(offset, offset + limit - 1)

  if (cuisineKeys && cuisineKeys.length > 0) {
    const googleTypes = cuisineKeys.flatMap(getGoogleTypesForCuisineKey)
    const tagsList = `{${googleTypes.join(',')}}`
    query = query.or(`primary_type.in.(${googleTypes.join(',')}),tags.ov.${tagsList}`)
  }

  const { data, error } = await query
  if (error) throw new Error(`DB query failed: ${error.message}`)
  return data ?? []
}

export async function findByPlaceId(placeId: string): Promise<RestaurantRecord | null> {
  const { data } = await createAdminClient()
    .from('restaurants')
    .select('id, name')
    .eq('google_place_id', placeId)
    .single()
  return data ?? null
}

export interface InsertRestaurantInput extends RestaurantRow {
  primary_image_path: string | null
  image_blurhash: string | null
  image_width: number | null
  image_height: number | null
  submitted_by: string | null
}

export async function insertRestaurant(
  input: InsertRestaurantInput,
): Promise<RestaurantRecord> {
  const { data, error } = await createAdminClient()
    .from('restaurants')
    .insert(input)
    .select('id, name')
    .single()

  if (error) throw new Error(`DB insert failed: ${error.message}`)
  return data
}
