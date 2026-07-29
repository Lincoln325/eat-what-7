import { createAdminClient } from '@/lib/supabase'

export async function uploadRestaurantImage(
  placeId: string,
  buffer: Buffer,
): Promise<string> {
  const supabase = createAdminClient()
  const path = `${placeId}/primary.webp`

  const { error } = await supabase.storage
    .from('restaurants')
    .upload(path, buffer, { contentType: 'image/webp', upsert: true })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return path
}

export async function deleteRestaurantImage(placeId: string): Promise<void> {
  const supabase = createAdminClient()
  // The bucket stores one primary image per place under {placeId}/primary.webp
  const { error } = await supabase.storage
    .from('restaurants')
    .remove([`${placeId}/primary.webp`])
  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}
