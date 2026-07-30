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

    // 2. Direct Web3Forms Automated Email Dispatch
    const web3Key = process.env.WEB3FORMS_ACCESS_KEY || '5eb1ae0b-b5ed-4fe3-9b22-275b57fadd01'
    let web3Result = null

    if (web3Key) {
      try {
        const messageBody = `
NEW CORPORATE SUPPORT REQUEST
========================================
Reference ID    : ${data.reference_id}
Date Submitted  : ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}

--- REQUESTER DETAILS ---
Full Name       : ${data.full_name}
Employee Code   : ${data.employee_code || 'N/A'}
Department      : ${data.department}
Official Email  : ${data.email}
Contact Number  : ${data.contact_number}
Branch Location : ${data.branch_location}

--- REQUEST INFORMATION ---
Category        : ${data.request_category}
Target Audience : ${data.target_audience || 'N/A'}
Purpose / Detail: ${data.purpose_of_request}

--- TIMELINE & PRIORITY ---
Required By     : ${data.required_by}
Priority Level  : ${data.priority_level}

--- APPROVAL DETAILS ---
Approver Name   : ${data.approver_name}
Approver Email  : ${data.approver_email}
Approver Dept   : ${data.approver_department}

========================================
Open Admin Dashboard: https://aionion-support-request.vercel.app/admin
`

        const web3Response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: web3Key,
            subject: `[${data.reference_id}] Support Request - ${data.request_category} (${data.full_name})`,
            from_name: 'Aionion Support Portal',
            to_email: 'peopleconnect@aionioncapital.com',
            replyto: data.email,
            message: messageBody
          })
        })
        web3Result = await web3Response.json()
        console.log('Web3Forms Result:', web3Result)
      } catch (err) {
        console.warn('Web3Forms dispatch error:', err)
      }
    }

    // 3. Forward payload to Google Apps Script Web App
    const DEFAULT_GAS_URL = 'https://script.google.com/a/macros/aionioncapital.com/s/AKfycbyPMtG7VrD6z_GVZzlb8xGmOxR_DkFxkWzplTGfdy6p0zNC_pyOTQCxCYZsf-uECwpxLQ/exec'
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.VITE_GOOGLE_APPS_SCRIPT_URL || DEFAULT_GAS_URL
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
      email_sent: web3Result?.success || false,
      gas_synced: !!gasResult
    })
  } catch (error) {
    console.error('Submit API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
