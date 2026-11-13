import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * The browser only ever receives the project URL and the public anon key.
 * Access is enforced by row-level security, Auth and the admin allowlist.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

export const isSupabaseConfigured = supabase !== null

export const PORTFOLIO_BUCKET = 'portfolio-media'
