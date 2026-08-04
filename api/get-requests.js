import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jyiadawynwjcluvrgoqi.supabase.co'
    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json([])
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase Server Fetch Error:', error.message)
      return res.status(200).json([])
    }

    return res.status(200).json(data || [])
  } catch (err) {
    console.error('get-requests API error:', err)
    return res.status(500).json({ error: err.message })
  }
}
