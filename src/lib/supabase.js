import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tgzrytgoyyeztkiprrqy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseAnonKey.includes('your-anon-key')
)

if (!isSupabaseConfigured) {
  console.info('[CCR] Running in local SQLite mode. Add VITE_SUPABASE_ANON_KEY to .env to enable Supabase Cloud.')
}

export const supabase = createClient(
  supabaseUrl,
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key'
)

