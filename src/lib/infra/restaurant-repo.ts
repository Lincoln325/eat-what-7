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
  region: string | null
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
    .select('id, name, name_zh, primary_type, primary_type_display_name_zh, tags, rating, price_level, primary_image_path, image_blurhash, google_maps_uri, region')
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

// Which of these place ids already exist — one query, used to flag duplicates
// in the add-search results so the client can disable already-saved places.
export async function findManyByPlaceIds(
  placeIds: string[],
): Promise<Array<{ id: string; google_place_id: string }>> {
  if (placeIds.length === 0) return []
  const { data } = await createAdminClient()
    .from('restaurants')
    .select('id, google_place_id')
    .in('google_place_id', placeIds)
  return data ?? []
}

const DETAIL_COLUMNS =
  'id, name, name_zh, primary_type_display_name_zh, tags, rating, total_ratings, price_level, primary_image_path, image_blurhash, address, phone, website, google_maps_uri, google_place_id, raw_place_data, updated_at'

export interface RestaurantDetailRow {
  id: string
  name: string
  name_zh: string | null
  primary_type_display_name_zh: string | null
  tags: string[]
  rating: number | null
  total_ratings: number | null
  price_level: number | null
  primary_image_path: string | null
  image_blurhash: string | null
  address: string | null
  phone: string | null
  website: string | null
  google_maps_uri: string | null
  google_place_id: string
  raw_place_data: unknown
  updated_at: string | null
}

// Public read of a single restaurant's full detail. Uses the RLS-respecting
// client — detail is public, same as the list.
export async function getRestaurantById(
  id: string,
): Promise<RestaurantDetailRow | null> {
  const { data } = await supabase
    .from('restaurants')
    .select(DETAIL_COLUMNS)
    .eq('id', id)
    .single()
  return (data as RestaurantDetailRow | null) ?? null
}

// Admin-only: fetch the place id needed to delete the storage image.
export async function getPlaceIdById(id: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from('restaurants')
    .select('google_place_id')
    .eq('id', id)
    .single()
  return data?.google_place_id ?? null
}

// Admin-only: re-write the mutable fields after a Google refresh.
export async function updateRestaurantById(
  id: string,
  input: Partial<InsertRestaurantInput>,
): Promise<RestaurantRecord> {
  const { data, error } = await createAdminClient()
    .from('restaurants')
    .update(input)
    .eq('id', id)
    .select('id, name')
    .single()

  if (error) throw new Error(`DB update failed: ${error.message}`)
  return data
}

// Admin-only: remove the row. Storage image is deleted separately by the caller.
export async function deleteRestaurantById(id: string): Promise<void> {
  const { error } = await createAdminClient()
    .from('restaurants')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`DB delete failed: ${error.message}`)
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
