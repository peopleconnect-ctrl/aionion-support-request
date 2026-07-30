import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const appPassword = process.env.GMAIL_APP_PASSWORD || 'fvszdczjvpchersd'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'peopleconnect@aionioncapital.com',
    pass: appPassword
  }
})

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

    // Ensure status defaults to 'In Progress' if not specified
    if (!data.status) {
      data.status = 'In Progress'
    }

    // -------------------------------------------------------------
    // ACTION A: STATUS UPDATE EMAIL DISPATCH (In Progress / Completed)
    // -------------------------------------------------------------
    if (data.action === 'status_update') {
      const isDone = data.status === 'Completed'
      const subjectTag = isDone ? '[WORK COMPLETED]' : '[STATUS UPDATE: IN PROGRESS]'
      const requesterEmail = data.email
      const ccList = [
        'peopleconnect@aionioncapital.com',
        'naveenkumar.k@aionioncapital.com',
        'balakumar.elango@aionioncapital.com',
        'anuradha.k@aionioncapital.com',
        data.approver_email
      ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i && v !== requesterEmail)

      let deliverableHtml = ''
      if (data.deliverable_files && data.deliverable_files.length > 0) {
        deliverableHtml = `
          <div style="margin-top: 18px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
            <h4 style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: bold;">📥 Download Completed Deliverables / Files:</h4>
            ${data.deliverable_files.map((f, i) => `
              <div style="padding: 10px 14px; background: #ffffff; border: 1px solid #dcfce7; border-radius: 6px; margin-bottom: 8px; font-size: 13px;">
                <div style="font-weight: bold; color: #14532d; margin-bottom: 6px;">📄 ${f.name || `Deliverable #${i + 1}`}</div>
                <a href="${f.url}" download="${f.name || 'deliverable'}" target="_blank" style="background: #16a34a; color: #ffffff; padding: 7px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-block;">
                  📥 Click to Download File
                </a>
              </div>
            `).join('')}
          </div>
        `
      }

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff;">
          <div style="background: ${isDone ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'linear-gradient(135deg, #0038FF 0%, #3B82F6 100%)'}; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;">${isDone ? 'WORK COMPLETED & DELIVERED' : 'STATUS UPDATE: IN PROGRESS'}</h2>
            <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Ref ID: ${data.reference_id}</p>
          </div>
          
          <div style="padding: 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
            <p>Dear <strong>${data.full_name || 'Requester'}</strong>,</p>
            <p>Your support request for <strong>${data.request_category}</strong> has been updated to status: <strong style="color: ${isDone ? '#16a34a' : '#0038FF'}; font-size: 15px;">${data.status}</strong>.</p>
            
            <div style="background: #f8fafc; padding: 14px; border-left: 4px solid #0038FF; border-radius: 6px; margin: 18px 0;">
              <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 14px;">Notes from Corporate Communications Team:</h4>
              <p style="margin: 0; font-size: 14px; color: #334155;">${data.completion_notes || (isDone ? 'Your request has been successfully completed.' : 'Your request is currently being processed by our team.')}</p>
            </div>

            ${deliverableHtml}

            <br/>
            <p style="margin-bottom: 0;">Warm regards,<br/><strong>Corporate Communications Team</strong><br/>Aionion Capital</p>
          </div>

          <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            Automated Notification • Aionion Capital Support Portal
          </div>
        </div>
      `

      await transporter.sendMail({
        from: '"PeopleConnect - Corporate Communications" <peopleconnect@aionioncapital.com>',
        to: requesterEmail,
        cc: ccList,
        subject: `${subjectTag} ${data.reference_id}: ${data.request_category} (${data.full_name})`,
        html: htmlBody
      })

      return res.status(200).json({ success: true, action: 'status_update' })
    }

    // -------------------------------------------------------------
    // ACTION B: NEW SUPPORT REQUEST SUBMISSION
    // -------------------------------------------------------------
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

    // 2. Forward payload to Google Apps Script Web App (Sheet Logging)
    const DEFAULT_GAS_URL = 'https://script.google.com/a/macros/aionioncapital.com/s/AKfycbyPMtG7VrD6z_GVZzlb8xGmOxR_DkFxkWzplTGfdy6p0zNC_pyOTQCxCYZsf-uECwpxLQ/exec'
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.VITE_GOOGLE_APPS_SCRIPT_URL || DEFAULT_GAS_URL

    if (gasUrl) {
      try {
        fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(data),
          redirect: 'follow'
        }).catch(err => console.warn('GAS Notice:', err))
      } catch (err) {
        console.warn('Google Apps Script forward notice:', err)
      }
    }

    // 3. Render Downloadable Attached Files for New Request
    const allRequesterFiles = [
      ...(data.reference_file_urls || []),
      ...(data.approval_file_urls || [])
    ]

    let requesterFilesHtml = ''
    if (allRequesterFiles.length > 0) {
      requesterFilesHtml = `
        <h3 style="color: #0038FF; font-size: 14px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px;">
          📎 Requester Attached Files / Artwork References
        </h3>
        <div style="margin-bottom: 20px;">
          ${allRequesterFiles.map((f, i) => `
            <div style="padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; font-size: 13px;">
              <div style="font-weight: bold; color: #334155; margin-bottom: 6px;">📄 ${f.name || `Attachment #${i + 1}`}</div>
              <a href="${f.url}" download="${f.name || 'attachment'}" target="_blank" style="background: #0038FF; color: #ffffff; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-block;">
                📥 Download Attachment
              </a>
            </div>
          `).join('')}
        </div>
      `
    }

    // 4. Send Professional Acknowledgement Email via Google SMTP
    const requesterEmail = data.email || 'peopleconnect@aionioncapital.com'
      const ccList = [
        'peopleconnect@aionioncapital.com',
        'naveenkumar.k@aionioncapital.com',
        'balakumar.elango@aionioncapital.com',
        'anuradha.k@aionioncapital.com',
        data.approver_email
      ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i && v !== requesterEmail)

    const ackHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0038FF 0%, #3B82F6 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">AIONION CAPITAL</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Corporate Communication & Support Portal</p>
          <div style="margin-top: 12px; display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
            Ref ID: ${data.reference_id} • Status: In Progress
          </div>
        </div>
        
        <div style="padding: 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
          <p style="font-size: 15px;">Dear <strong>${data.full_name}</strong>,</p>
          <p>Thank you for reaching out to the <strong>Corporate Communications & Support Team</strong>.</p>
          <p>We have successfully received your support request for <strong>${data.request_category}</strong> (Reference ID: <strong>${data.reference_id}</strong>), and work has officially commenced. Our team is currently processing your requirement and will share deliverables / progress updates on or before <strong>${data.required_by}</strong>.</p>

          <h3 style="color: #0038FF; font-size: 14px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px;">
            📋 Summary of Your Request
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 38%;">Request Category:</td><td style="padding: 6px 0; font-weight: bold; color: #0038FF;">${data.request_category}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Target Audience:</td><td style="padding: 6px 0;">${data.target_audience || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Required By Date:</td><td style="padding: 6px 0; font-weight: bold; color: #dc2626;">${data.required_by}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Priority Level:</td><td style="padding: 6px 0;"><span style="background: #fee2e2; color: #991b1b; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">${data.priority_level}</span></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Approver Name:</td><td style="padding: 6px 0;">${data.approver_name} (${data.approver_department})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;">Purpose of Request:</td><td style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">${data.purpose_of_request}</td></tr>
          </table>

          ${requesterFilesHtml}

          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="https://aionion-support-request.vercel.app/admin" style="background: #0038FF; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
              View Request in Admin Dashboard →
            </a>
          </div>

          <br/>
          <p style="margin-bottom: 0;">Warm regards,<br/><strong>Corporate Communications Team</strong><br/>Aionion Capital</p>
        </div>

        <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Automated Notification • Aionion Capital Support Portal
        </div>
      </div>
    `

    await transporter.sendMail({
      from: '"PeopleConnect - Corporate Communications" <peopleconnect@aionioncapital.com>',
      to: requesterEmail,
      cc: ccList,
      subject: `[IN PROGRESS] ${data.reference_id}: Support Request Received - ${data.request_category} (${data.full_name})`,
      html: ackHtml
    })

    return res.status(200).json({
      success: true,
      reference_id: data.reference_id,
      smtp_sent: true
    })
  } catch (error) {
    console.error('Submit API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
