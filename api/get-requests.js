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
      .select('id, reference_id, full_name, employee_code, department, email, contact_number, branch_location, request_category, target_audience, purpose_of_request, required_by, priority_level, approver_name, approver_email, approver_department, reference_file_urls, approval_file_urls, deliverable_files, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase Server Fetch Error:', error.message)
      return res.status(200).json({ error: error.message, hint: error.hint, details: error.details })
    }

    // Sanitize heavy base64 strings from response payload to prevent payload overflow
    const cleanData = (data || []).map(row => {
      const cleanRow = { ...row }
      if (Array.isArray(cleanRow.reference_file_urls)) {
        cleanRow.reference_file_urls = cleanRow.reference_file_urls.map(f => ({
          name: f.name || 'Attachment',
          url: f.url && f.url.length > 500 ? '#' : f.url
        }))
      }
      if (Array.isArray(cleanRow.approval_file_urls)) {
        cleanRow.approval_file_urls = cleanRow.approval_file_urls.map(f => ({
          name: f.name || 'Approval Proof',
          url: f.url && f.url.length > 500 ? '#' : f.url
        }))
      }
      return cleanRow
    })

    return res.status(200).json(cleanData)
  } catch (err) {
    console.error('get-requests API error:', err)
    return res.status(500).json({ error: err.message })
  }
}
