import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let client = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.warn('Supabase client creation note:', err)
  }
}

export const supabase = client
