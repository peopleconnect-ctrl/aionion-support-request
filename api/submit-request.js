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
        data.approver_email
      ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i && v !== requesterEmail)

      let deliverableHtml = ''
      if (data.deliverable_files && data.deliverable_files.length > 0) {
        deliverableHtml = `
          <div style="margin-top: 15px; padding: 14px; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">Completed Deliverables / Files:</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              ${data.deliverable_files.map((f, i) => `<li><a href="${f.url}" target="_blank" style="color: #15803d; font-weight: bold; text-decoration: none;">${f.name || `Deliverable #${i + 1}`}</a></li>`).join('')}
            </ul>
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

    // 3. Send Real Native Emails via Google SMTP
    const teamCcList = ['naveenkumar.k@aionioncapital.com', 'balakumar.elango@aionioncapital.com', data.approver_email].filter(Boolean)

    const newRequestHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0038FF 0%, #3B82F6 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">AIONION CAPITAL</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Corporate Communication & Support Request</p>
          <div style="margin-top: 12px; display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
            Ref ID: ${data.reference_id}
          </div>
        </div>
        
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <h3 style="color: #0038FF; font-size: 14px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">
            👤 Requester Information
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 38%;">Full Name:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${data.full_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Employee Code:</td><td style="padding: 6px 0;">${data.employee_code || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Department:</td><td style="padding: 6px 0; font-weight: 600;">${data.department}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Official Email:</td><td style="padding: 6px 0;"><a href="mailto:${data.email}" style="color: #0038FF; text-decoration: none;">${data.email}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Contact Number:</td><td style="padding: 6px 0;">${data.contact_number}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Branch / Location:</td><td style="padding: 6px 0;">${data.branch_location}</td></tr>
          </table>

          <h3 style="color: #0038FF; font-size: 14px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px;">
            📋 Requirement Details
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 38%;">Request Category:</td><td style="padding: 6px 0; font-weight: bold; color: #0038FF;">${data.request_category}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Target Audience:</td><td style="padding: 6px 0;">${data.target_audience || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;">Purpose of Request:</td><td style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">${data.purpose_of_request}</td></tr>
          </table>

          <h3 style="color: #0038FF; font-size: 14px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px;">
            ⏳ Timeline & Approval
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 38%;">Required By:</td><td style="padding: 6px 0; font-weight: bold; color: #dc2626;">${data.required_by}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Priority Level:</td><td style="padding: 6px 0;"><span style="background: #fee2e2; color: #991b1b; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">${data.priority_level}</span></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Approver Name:</td><td style="padding: 6px 0;">${data.approver_name} (${data.approver_department})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Approver Email:</td><td style="padding: 6px 0;"><a href="mailto:${data.approver_email}" style="color: #0038FF; text-decoration: none;">${data.approver_email}</a></td></tr>
          </table>

          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="https://aionion-support-request.vercel.app/admin" style="background: #0038FF; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
              Open Admin Dashboard →
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Automated Notification System • Aionion Capital Corporate Communications
        </div>
      </div>
    `

    // Send Team Notification Email
    await transporter.sendMail({
      from: '"PeopleConnect - Corporate Communications" <peopleconnect@aionioncapital.com>',
      to: 'peopleconnect@aionioncapital.com',
      cc: teamCcList,
      subject: `[${data.reference_id}] New Support Request - ${data.request_category} (${data.full_name})`,
      html: newRequestHtml
    })

    // Send Confirmation Email to Requester (if different from team email)
    if (data.email && data.email !== 'peopleconnect@aionioncapital.com') {
      await transporter.sendMail({
        from: '"PeopleConnect - Corporate Communications" <peopleconnect@aionioncapital.com>',
        to: data.email,
        subject: `[ACKNOWLEDGEMENT] ${data.reference_id}: Support Request Received`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; color: #334155;">
            <h3 style="color: #0038FF; margin-top: 0;">Request Received Successfully</h3>
            <p>Dear <strong>${data.full_name}</strong>,</p>
            <p>Thank you for submitting your corporate communications support request. Our team has received your ticket (Ref ID: <strong>${data.reference_id}</strong>) and will process it on or before <strong>${data.required_by}</strong>.</p>
            <br/>
            <p style="margin-bottom: 0;">Warm regards,<br/><strong>Corporate Communications Team</strong><br/>Aionion Capital</p>
          </div>
        `
      })
    }

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
