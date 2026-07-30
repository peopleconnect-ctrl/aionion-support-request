import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = req.body

    // 1. Insert into Supabase (if credentials configured)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { error: dbError } = await supabase.from('support_requests').insert([data])
        if (dbError) {
          console.warn('Supabase DB Notice:', dbError.message)
        }
      } catch (err) {
        console.warn('Supabase Client Error:', err)
      }
    }

    // 2. Forward payload to Google Apps Script Web App (if configured)
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.VITE_GOOGLE_APPS_SCRIPT_URL
    let gasResult = null

    if (gasUrl) {
      try {
        const gasResponse = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(data),
          redirect: 'follow'
        })
        gasResult = await gasResponse.text()
        console.log('GAS Forward Result:', gasResult)
      } catch (err) {
        console.warn('Google Apps Script forward error:', err)
      }
    }

    return res.status(200).json({
      success: true,
      reference_id: data.reference_id,
      gas_synced: !!gasResult
    })
  } catch (error) {
    console.error('Submit API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
