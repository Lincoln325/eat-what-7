import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

// Browser / server components — uses publishable key, respects RLS
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Server-only — uses secret key, bypasses RLS (for admin/ingest routes)
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseSecretKey)
}
