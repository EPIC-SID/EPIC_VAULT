import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn(
    '[EPIC_VAULT] Supabase environment variables are missing or unconfigured in .env.local.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
