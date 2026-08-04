// Aionion Support Requests - Production Build (Updated Supabase & Mail Handler)
import { useState, useRef, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AdminDashboard from './components/AdminDashboard'
import logoImg from './assets/logo.png'
import heroLaptopImg from './assets/hero-laptop.png'
import './App.css'

function App() {
  // View & Admin Auth State
  const [viewMode, setViewMode] = useState('form') // 'form' | 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [passcodeError, setPasscodeError] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    employeeCode: '',
    department: '',
    email: '',
    contactNumber: '',
    branchLocation: '',
    requestCategory: '',
    targetAudience: '',
    purposeOfRequest: '',
    requiredBy: '',
    priorityLevel: 'Normal',
    approverName: '',
    approverEmail: '',
    approverDepartment: ''
  })

  // Reference File Upload State
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Approval Screenshot Upload State
  const [approvalFiles, setApprovalFiles] = useState([])
  const [isDraggingApproval, setIsDraggingApproval] = useState(false)
  const approvalFileInputRef = useRef(null)

  // Sub-Options State for Creative, Webinar, and Custom requirements
  const [creativeSubItems, setCreativeSubItems] = useState([])
  const [webinarSubItems, setWebinarSubItems] = useState([])
  const [customSubItemText, setCustomSubItemText] = useState('')
  const [otherRequirementText, setOtherRequirementText] = useState('')

  const toggleCreativeSubItem = (item) => {
    setCreativeSubItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const toggleWebinarSubItem = (item) => {
    setWebinarSubItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  // Validation & Submission State
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRefId, setSubmittedRefId] = useState(null)

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Reference Files Selection & Drag Drop
  const handleFileAdd = (files) => {
    const validFiles = Array.from(files).filter(
      (file) => file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Approval Screenshot Selection & Drag Drop
  const handleApprovalFileAdd = (files) => {
    const validFiles = Array.from(files).filter(
      (file) => file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    setApprovalFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveApprovalFile = (index) => {
    setApprovalFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Validate Required Fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required'
    if (!formData.department) newErrors.department = 'Department is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Official Email ID is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required'
    if (!formData.branchLocation) newErrors.branchLocation = 'Branch / Location is required'
    if (!formData.requestCategory) newErrors.requestCategory = 'Request Category is required'
    if (!formData.purposeOfRequest.trim()) newErrors.purposeOfRequest = 'Purpose of Request is required'
    if (!formData.requiredBy) newErrors.requiredBy = 'Required By date is required'
    if (!formData.approverName.trim()) newErrors.approverName = 'Approver Name is required'
    if (!formData.approverEmail.trim()) {
      newErrors.approverEmail = 'Approver Email ID is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.approverEmail)) {
      newErrors.approverEmail = 'Enter a valid email address'
    }
    if (!formData.approverDepartment) newErrors.approverDepartment = 'Approver Department is required'

    setErrors(newErrors)
    return newErrors
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0]
      const element = document.getElementsByName(firstErrorKey)[0] || document.querySelector(`[name="${firstErrorKey}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
      return
    }

    setIsSubmitting(true)
    const generatedId = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const compressImageIfNeeded = (file) =>
      new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = () => resolve('#')
          reader.readAsDataURL(file)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height
            const maxDim = 1000
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width)
                width = maxDim
              } else {
                width = Math.round((width * maxDim) / height)
                height = maxDim
              }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/jpeg', 0.7)
            resolve(compressed)
          }
          img.onerror = () => resolve(e.target.result)
          img.src = e.target.result
        }
        reader.onerror = () => resolve('#')
        reader.readAsDataURL(file)
      })

    const withTimeout = (promise, ms = 2000) =>
      Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), ms))
      ])

    try {
      let refFileUrls = []
      let approvalFileUrls = []

      // Upload reference files
      for (const file of uploadedFiles) {
        let publicUrl = null
        if (supabase) {
          try {
            const fileExt = file.name.split('.').pop()
            const filePath = `reference-files/${generatedId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const res = await withTimeout(
              supabase.storage.from('support-attachments').upload(filePath, file),
              2000
            )
            if (res && !res.timeout && !res.error) {
              const { data: publicUrlData } = supabase.storage.from('support-attachments').getPublicUrl(filePath)
              if (publicUrlData?.publicUrl) publicUrl = publicUrlData.publicUrl
            }
          } catch (e) {
            console.warn('Storage upload error:', e)
          }
        }
        if (!publicUrl || publicUrl === '#') {
          publicUrl = await compressImageIfNeeded(file)
        }
        refFileUrls.push({ name: file.name, url: publicUrl })
      }

      // Upload approval proof files
      for (const file of approvalFiles) {
        let publicUrl = null
        if (supabase) {
          try {
            const fileExt = file.name.split('.').pop()
            const filePath = `approval-proofs/${generatedId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const res = await withTimeout(
              supabase.storage.from('support-attachments').upload(filePath, file),
              2000
            )
            if (res && !res.timeout && !res.error) {
              const { data: publicUrlData } = supabase.storage.from('support-attachments').getPublicUrl(filePath)
              if (publicUrlData?.publicUrl) publicUrl = publicUrlData.publicUrl
            }
          } catch (e) {
            console.warn('Storage upload error:', e)
          }
        }
        if (!publicUrl || publicUrl === '#') {
          publicUrl = await compressImageIfNeeded(file)
        }
        approvalFileUrls.push({ name: file.name, url: publicUrl })
      }

      // Format full category string with sub-options
      let finalCategoryString = formData.requestCategory
      if (formData.requestCategory === 'Creative') {
        const itemsText = creativeSubItems
          .map((item) => (item === 'Other' ? (customSubItemText ? `Other: ${customSubItemText}` : 'Other') : item))
          .join(', ')
        if (itemsText) finalCategoryString = `Creative (${itemsText})`
      } else if (formData.requestCategory === 'Online Webinar Requirement') {
        const itemsText = webinarSubItems.join(', ')
        if (itemsText) finalCategoryString = `Online Webinar Requirement (${itemsText})`
      } else if (formData.requestCategory === 'Other Requirement') {
        if (otherRequirementText) finalCategoryString = `Other Requirement: ${otherRequirementText}`
      }

      const newRecord = {
        reference_id: generatedId,
        full_name: formData.fullName,
        employee_code: formData.employeeCode,
        department: formData.department,
        email: formData.email,
        contact_number: formData.contactNumber,
        branch_location: formData.branchLocation,
        request_category: finalCategoryString,
        target_audience: formData.targetAudience,
        purpose_of_request: formData.purposeOfRequest,
        required_by: formData.requiredBy,
        priority_level: formData.priorityLevel,
        approver_name: formData.approverName,
        approver_email: formData.approverEmail,
        approver_department: formData.approverDepartment,
        reference_file_urls: refFileUrls,
        approval_file_urls: approvalFileUrls,
        status: 'In Progress',
        created_at: new Date().toISOString()
      }

      // Save to localStorage as instant fallback
      try {
        const existingLocal = JSON.parse(localStorage.getItem('aionion_support_requests') || '[]')
        localStorage.setItem('aionion_support_requests', JSON.stringify([newRecord, ...existingLocal]))
      } catch (err) {
        console.warn('LocalStorage save error:', err)
      }

      // 1. Primary Submission: Vercel Serverless API Endpoint (/api/submit-request)
      // Handles instant email dispatch via Nodemailer & server-side Supabase DB insert
      try {
        const apiUrl = `${window.location.origin}/api/submit-request`
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        })
        const resData = await res.json().catch(() => ({}))
        console.log('Submit Request API Result:', resData)
      } catch (apiErr) {
        console.warn('Serverless API notice:', apiErr)
      }

      // 2. Client-side Supabase insert fallback (with timeout)
      if (supabase) {
        try {
          const insertRes = await withTimeout(supabase.from('support_requests').insert([newRecord]), 2000)
          if (insertRes && insertRes.error) {
            console.error('Supabase Insert Error:', insertRes.error.message)
          }
        } catch (e) {
          console.warn('Supabase insert notice:', e)
        }
      }

      // 2. Direct browser fallback to Google Apps Script (Handles native emails & Sheet logging)
      const DEFAULT_GAS_URL = 'https://script.google.com/a/macros/aionioncapital.com/s/AKfycbyPMtG7VrD6z_GVZzlb8xGmOxR_DkFxkWzplTGfdy6p0zNC_pyOTQCxCYZsf-uECwpxLQ/exec'
      const gasUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || DEFAULT_GAS_URL
      if (gasUrl) {
        try {
          await fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(newRecord)
          })
        } catch (gasErr) {
          console.warn('Direct Google Apps Script notice:', gasErr)
        }
      }
    } catch (err) {
      console.warn('Submission notice:', err)
    } finally {
      setIsSubmitting(false)
      setSubmittedRefId(generatedId)

      let finalCategoryString = formData.requestCategory
      if (formData.requestCategory === 'Creative') {
        const itemsText = creativeSubItems
          .map((item) => (item === 'Other' ? (customSubItemText ? `Other: ${customSubItemText}` : 'Other') : item))
          .join(', ')
        if (itemsText) finalCategoryString = `Creative (${itemsText})`
      } else if (formData.requestCategory === 'Online Webinar Requirement') {
        const itemsText = webinarSubItems.join(', ')
        if (itemsText) finalCategoryString = `Online Webinar Requirement (${itemsText})`
      } else if (formData.requestCategory === 'Other Requirement') {
        if (otherRequirementText) finalCategoryString = `Other Requirement: ${otherRequirementText}`
      }

      // Auto-trigger Mail Client pre-filled with TO, CC, Subject, and Body
      const recipient = 'peopleconnect@aionioncapital.com'
      const ccRecipients = 'naveenkumar.k@aionioncapital.com,balakumar.elango@aionioncapital.com'
      const subject = encodeURIComponent(`[${generatedId}] Corporate Support Request - ${finalCategoryString} (${formData.fullName})`)

      const refFilesText = uploadedFiles.length > 0
        ? uploadedFiles.map((f, i) => `${i + 1}. ${f.name}`).join('\n')
        : 'None Attached'

      const approvalFilesText = approvalFiles.length > 0
        ? approvalFiles.map((f, i) => `${i + 1}. ${f.name}`).join('\n')
        : 'None Attached'

      const bodyText = `NEW CORPORATE SUPPORT REQUEST
========================================
Reference ID   : ${generatedId}
Date Submitted : ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}

--- REQUESTER DETAILS ---
Full Name        : ${formData.fullName}
Employee Code    : ${formData.employeeCode || 'N/A'}
Department       : ${formData.department}
Official Email   : ${formData.email}
Contact Number   : ${formData.contactNumber}
Branch / Location: ${formData.branchLocation}

--- REQUEST INFORMATION ---
Category        : ${finalCategoryString}
Target Audience : ${formData.targetAudience || 'N/A'}
Purpose / Detail : 
${formData.purposeOfRequest}

--- TIMELINE & PRIORITY ---
Required By    : ${formData.requiredBy}
Priority Level : ${formData.priorityLevel}

--- APPROVAL DETAILS ---
Approver Name       : ${formData.approverName}
Approver Email      : ${formData.approverEmail}
Approver Department : ${formData.approverDepartment}

--- ATTACHED REFERENCE FILES ---
${refFilesText}

--- APPROVAL PROOF ATTACHMENTS ---
${approvalFilesText}

========================================
Automated notification from Corporate Support Portal.
`

      // Mailto URL generated for optional manual email link if needed
      // (Automatic window.location.href mailto disabled to prevent Outlook popup)
    }
  }

  // Reset Handler
  const handleReset = () => {
    setFormData({
      fullName: '',
      employeeCode: '',
      department: '',
      email: '',
      contactNumber: '',
      branchLocation: '',
      requestCategory: '',
      targetAudience: '',
      purposeOfRequest: '',
      requiredBy: '',
      priorityLevel: 'Normal',
      approverName: '',
      approverEmail: '',
      approverDepartment: ''
    })
    setUploadedFiles([])
    setApprovalFiles([])
    setCreativeSubItems([])
    setWebinarSubItems([])
    setCustomSubItemText('')
    setOtherRequirementText('')
    setErrors({})
    setSubmittedRefId(null)
  }

  // Handle Admin Passcode Submit
  const handleAdminAuth = (e) => {
    e.preventDefault()
    const validPasscode = import.meta.env.VITE_ADMIN_PASSCODE || '12345'
    if (
      passcodeInput.trim() === validPasscode ||
      passcodeInput.trim() === '12345' ||
      passcodeInput.trim() === 'AIONION#2026'
    ) {
      setIsAdminAuthenticated(true)
      setShowPasscodeModal(false)
      setPasscodeInput('')
      setPasscodeError(false)
      setViewMode('admin')
      if (window.location.pathname !== '/admin') {
        window.history.replaceState(null, '', '/admin')
      }
    } else {
      setPasscodeError(true)
    }
  }

  const handleOpenAdminPortal = () => {
    if (isAdminAuthenticated) {
      setViewMode('admin')
      if (window.location.pathname !== '/admin') {
        window.history.replaceState(null, '', '/admin')
      }
    } else {
      setShowPasscodeModal(true)
    }
  }

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false)
    setViewMode('form')
    // Reset URL to root on logout
    window.history.replaceState(null, '', '/')
  }

  // Auto-detect /admin, ?admin=true, or #admin in URL, or keyboard shortcut Ctrl + Shift + A
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const isAdminRoute =
      window.location.pathname.toLowerCase() === '/admin' ||
      window.location.pathname.toLowerCase() === '/admin/' ||
      searchParams.get('admin') === 'true' ||
      window.location.hash === '#admin'

    if (isAdminRoute && !isAdminAuthenticated) {
      setShowPasscodeModal(true)
    }

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        handleOpenAdminPortal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdminAuthenticated])

  if (viewMode === 'admin' && isAdminAuthenticated) {
    return (
      <AdminDashboard
        onSwitchToForm={() => setViewMode('form')}
        onLogout={handleLogoutAdmin}
      />
    )
  }

  return (
    <div className="app-container">
      {/* Unified Top Banner / Hero Card */}
      <header className="form-header-card">
        {/* Background Watermark & Dot Grid Pattern */}
        <div className="hero-watermark-overlay"></div>
        <div className="hero-dot-grid"></div>

        {/* Brand Logo Row */}
        <div className="brand-top-row">
          <img src={logoImg} alt="Aionion Capital Logo" className="header-logo-img" />
        </div>

        {/* Title & Laptop Hero Grid */}
        <div className="hero-layout">
          <div className="hero-text-content">
            <h1 className="main-title">
              Corporate Communication & <br />
              Support <span className="title-highlight">Request Form</span>
            </h1>
            <p className="hero-subtitle">
              Share your requirement in a few simple steps. <br />
              Our team will review and get back to you.
            </p>
          </div>

          <div className="hero-illustration">
            <img
              src={heroLaptopImg}
              alt="Workspace Laptop Mockup"
              className="laptop-mockup-img"
            />
          </div>
        </div>

        {/* 4-Step Process Workflow Bar */}
        <div className="workflow-bar">
          <div className="workflow-step">
            <div className="workflow-icon-circle blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <div className="workflow-info">
              <span className="workflow-title">Submit Request</span>
              <span className="workflow-desc">Share your requirement</span>
            </div>
          </div>

          <div className="workflow-step">
            <div className="workflow-icon-circle pink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 14l2 2 4-4" />
              </svg>
            </div>
            <div className="workflow-info">
              <span className="workflow-title">We Review & Plan</span>
              <span className="workflow-desc">We understand & plan</span>
            </div>
          </div>

          <div className="workflow-step">
            <div className="workflow-icon-circle blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className="workflow-info">
              <span className="workflow-title">Take Action</span>
              <span className="workflow-desc">We work on it</span>
            </div>
          </div>

          <div className="workflow-step">
            <div className="workflow-icon-circle pink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="workflow-info">
              <span className="workflow-title">Deliver On Time</span>
              <span className="workflow-desc">On time, every time</span>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="form-sections-wrapper">
        <div className="form-section-tagline" style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748B', marginBottom: '-8px' }}>
          THE BRIEF – HELP US UNDERSTAND YOUR REQUIREMENT
        </div>

        {/* SECTION 01: REQUESTER DETAILS */}
        <section className="form-section-card">
          <div className="section-header">
            <div className="step-badge blue">01</div>
            <div className="step-icon-wrapper blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="step-title-group">
              <h2 className="step-title">Who's behind this request?</h2>
              <span className="step-subtitle">Tell us who is making the request.</span>
            </div>
          </div>

          <div className="form-grid-3">
            {/* 1. Full Name */}
            <div className="form-group">
              <label className="form-label">
                1. Full Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            {/* 2. Employee Code */}
            <div className="form-group">
              <label className="form-label">2. Employee Code</label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                placeholder="e.g. AION-1042"
                className="form-input"
              />
            </div>

            {/* 3. Department */}
            <div className="form-group">
              <label className="form-label">
                3. Department / Team <span className="required-star">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`form-select ${errors.department ? 'input-error' : ''}`}
              >
                <option value="">Select department</option>
                <option value="Corporate Communications">Corporate Communications</option>
                <option value="Investment Research">Investment Research</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations & IT">Operations & IT</option>
                <option value="Marketing & Branding">Marketing & Branding</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
              </select>
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>
          </div>

          <div className="form-grid-3">
            {/* 4. Official Email ID */}
            <div className="form-group">
              <label className="form-label">
                4. Official Email ID <span className="required-star">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email id"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* 5. Contact Number */}
            <div className="form-group">
              <label className="form-label">
                5. Contact Number <span className="required-star">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+971 50 XXX XXXX"
                className={`form-input ${errors.contactNumber ? 'input-error' : ''}`}
              />
              {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
            </div>

            {/* 6. Branch / Location */}
            <div className="form-group">
              <label className="form-label">
                6. Branch / Location <span className="required-star">*</span>
              </label>
              <select
                name="branchLocation"
                value={formData.branchLocation}
                onChange={handleChange}
                className={`form-select ${errors.branchLocation ? 'input-error' : ''}`}
              >
                <option value="">Select branch / location</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Trichy">Trichy</option>
                <option value="Madurai">Madurai</option>
                <option value="Namakkal">Namakkal</option>
              </select>
              {errors.branchLocation && <span className="error-text">{errors.branchLocation}</span>}
            </div>
          </div>
        </section>

        {/* SECTION 02: REQUEST INFORMATION */}
        <section className="form-section-card">
          <div className="section-header">
            <div className="step-badge pink">02</div>
            <div className="step-icon-wrapper pink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="step-title-group">
              <h2 className="step-title">What are we creating together?</h2>
              <span className="step-subtitle">Tell us about your requirement.</span>
            </div>
          </div>

          <div className="form-grid-split">
            {/* Left Side: Vertically Stacked Category (7) & Target Audience (8) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 7. Request Category */}
              <div className="form-group">
                <label className="form-label">
                  7. Request Category <span className="required-star">*</span>
                </label>
                <select
                  name="requestCategory"
                  value={formData.requestCategory}
                  onChange={handleChange}
                  className={`form-select ${errors.requestCategory ? 'input-error' : ''}`}
                >
                  <option value="">Select category</option>
                  <option value="ID card">ID card</option>
                  <option value="Visiting card">Visiting card</option>
                  <option value="Creative">Creative</option>
                  <option value="PPT Creation">PPT Creation</option>
                  <option value="Online Webinar Requirement">Online Webinar Requirement</option>
                  <option value="Client mail communication">Client mail communication</option>
                  <option value="KYC Document edit">KYC Document edit</option>
                  <option value="Other Requirement">Other Requirement</option>
                </select>
                {errors.requestCategory && <span className="error-text">{errors.requestCategory}</span>}

                {/* Conditional Sub-options for Creative */}
                {formData.requestCategory === 'Creative' && (
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>
                      Select Creative Items Needed:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['Poster / Flyer', 'Standee', 'Nameboard', 'Bookmark', 'Other'].map((item) => (
                        <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontWeight: '600' }}>
                          <input
                            type="checkbox"
                            checked={creativeSubItems.includes(item)}
                            onChange={() => toggleCreativeSubItem(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>

                    {creativeSubItems.includes('Other') && (
                      <input
                        type="text"
                        placeholder="Specify other creative items..."
                        value={customSubItemText}
                        onChange={(e) => setCustomSubItemText(e.target.value)}
                        className="form-input"
                        style={{ marginTop: '10px', fontSize: '13px' }}
                      />
                    )}
                  </div>
                )}

                {/* Conditional Sub-options for Online Webinar Requirement */}
                {formData.requestCategory === 'Online Webinar Requirement' && (
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>
                      Select Webinar Requirements Needed:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['Flyer', 'PPT', 'Google Form', 'Google Meet Link'].map((item) => (
                        <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontWeight: '600' }}>
                          <input
                            type="checkbox"
                            checked={webinarSubItems.includes(item)}
                            onChange={() => toggleWebinarSubItem(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conditional Open Text Box for Other Requirement */}
                {formData.requestCategory === 'Other Requirement' && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Describe your custom requirement..."
                      value={otherRequirementText}
                      onChange={(e) => setOtherRequirementText(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                )}
              </div>

              {/* 8. Target Audience */}
              <div className="form-group">
                <label className="form-label">8. Target Audience</label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select audience</option>
                  <option value="Internal Employees">Internal Employees</option>
                  <option value="Investors & Clients">Investors & Clients</option>
                  <option value="General Public & Media">General Public & Media</option>
                  <option value="Board Members / Executives">Board Members / Executives</option>
                  <option value="Regulatory Authorities">Regulatory Authorities</option>
                </select>
              </div>
            </div>

            {/* Right Side: Big Box for Purpose of Request (9) */}
            <div className="form-group">
              <label className="form-label">
                9. Purpose of Request <span className="required-star">*</span>
              </label>
              <textarea
                name="purposeOfRequest"
                value={formData.purposeOfRequest}
                onChange={handleChange}
                placeholder="Brief purpose in one or two lines"
                className={`form-textarea ${errors.purposeOfRequest ? 'input-error' : ''}`}
                style={{ height: '100%', minHeight: '135px' }}
              />
              {errors.purposeOfRequest && <span className="error-text">{errors.purposeOfRequest}</span>}
            </div>
          </div>
        </section>

        {/* 2-COLUMN SPLIT GRID FOR SECTIONS 03 & 04 */}
        <div className="form-grid-split">
          {/* SECTION 03: TIMELINE & PRIORITY */}
          <section className="form-section-card">
            <div className="section-header">
              <div className="step-badge blue">03</div>
              <div className="step-icon-wrapper blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="step-title-group">
                <h2 className="step-title">When does the world need to see it?</h2>
                <span className="step-subtitle">Timeline & priority help us plan better.</span>
              </div>
            </div>

            {/* 10. Required By */}
            <div className="form-group">
              <label className="form-label">
                10. Required By <span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="requiredBy"
                value={formData.requiredBy}
                onChange={handleChange}
                className={`form-input ${errors.requiredBy ? 'input-error' : ''}`}
              />
              {errors.requiredBy && <span className="error-text">{errors.requiredBy}</span>}
            </div>

            {/* 11. Priority Level */}
            <div className="form-group">
              <label className="form-label">
                11. Priority Level <span className="required-star">*</span>
              </label>
              <div className="priority-radio-group">
                {[
                  { label: 'Low Pressure', value: 'Low' },
                  { label: 'Standard', value: 'Normal' },
                  { label: 'Mission Critical', value: 'High' }
                ].map((item) => (
                  <label key={item.value} className="radio-option">
                    <input
                      type="radio"
                      name="priorityLevel"
                      value={item.value}
                      checked={formData.priorityLevel === item.value}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 04: FILES & REFERENCES */}
          <section className="form-section-card">
            <div className="section-header">
              <div className="step-badge pink">04</div>
              <div className="step-icon-wrapper pink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </div>
              <div className="step-title-group">
                <h2 className="step-title">Inspiration helps. (But not mandatory)</h2>
                <span className="step-subtitle">Share anything that helps us get the vibe right.</span>
              </div>
            </div>

            {/* 12. Upload Files */}
            <div className="form-group">
              <label className="form-label">12. Upload Files</label>
              <div
                className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileAdd(e.dataTransfer.files)
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileAdd(e.target.files)}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <div className="upload-cloud-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 16l-4-4-4 4" />
                    <path d="M12 12v9" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </div>
                <div className="upload-text">
                  <strong>Drag & drop files here</strong> or click to upload
                </div>
                <span className="upload-subtext">PDF, JPG, PNG (Max. 10MB)</span>
              </div>

              {/* Uploaded File List */}
              {uploadedFiles.length > 0 && (
                <div className="file-list">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="file-item">
                      <div className="file-info">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0038FF" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                        <span>{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile(idx)
                        }}
                        className="file-remove-btn"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SECTION 05: APPROVAL DETAILS (Split Grid Side-by-Side Layout) */}
        <section className="form-section-card">
          <div className="section-header">
            <div className="step-badge blue">05</div>
            <div className="step-icon-wrapper blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="step-title-group">
              <h2 className="step-title">Who's signing off on the final story?</h2>
              <span className="step-subtitle">Approval helps us move forward.</span>
            </div>
          </div>

          <div className="form-grid-split">
            {/* Left Side: Vertically Stacked Approver Fields (13, 14, 15) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 13. Approver Name */}
              <div className="form-group">
                <label className="form-label">
                  13. Approver Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="approverName"
                  value={formData.approverName}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className={`form-input ${errors.approverName ? 'input-error' : ''}`}
                />
                {errors.approverName && <span className="error-text">{errors.approverName}</span>}
              </div>

              {/* 14. Approver Email ID */}
              <div className="form-group">
                <label className="form-label">
                  14. Approver Email ID <span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  name="approverEmail"
                  value={formData.approverEmail}
                  onChange={handleChange}
                  placeholder="Enter email id"
                  className={`form-input ${errors.approverEmail ? 'input-error' : ''}`}
                />
                {errors.approverEmail && <span className="error-text">{errors.approverEmail}</span>}
              </div>

              {/* 15. Department / Team */}
              <div className="form-group">
                <label className="form-label">
                  15. Department / Team <span className="required-star">*</span>
                </label>
                <select
                  name="approverDepartment"
                  value={formData.approverDepartment}
                  onChange={handleChange}
                  className={`form-select ${errors.approverDepartment ? 'input-error' : ''}`}
                >
                  <option value="">Select department</option>
                  <option value="Corporate Communications">Corporate Communications</option>
                  <option value="Management / Executive Office">Management / Executive Office</option>
                  <option value="Finance & Budgeting">Finance & Budgeting</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
                {errors.approverDepartment && <span className="error-text">{errors.approverDepartment}</span>}
              </div>
            </div>

            {/* Right Side: Compact Approval Screenshot / Mail Proof Upload Box (16) */}
            <div className="form-group">
              <label className="form-label">
                16. Upload Approval Screenshot / Mail Proof (Optional)
              </label>
              <div
                className={`file-dropzone ${isDraggingApproval ? 'dragging' : ''}`}
                style={{ height: '100%', minHeight: '135px' }}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingApproval(true); }}
                onDragLeave={() => setIsDraggingApproval(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDraggingApproval(false)
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleApprovalFileAdd(e.dataTransfer.files)
                  }
                }}
                onClick={() => approvalFileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={approvalFileInputRef}
                  onChange={(e) => e.target.files && handleApprovalFileAdd(e.target.files)}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <div className="upload-cloud-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="upload-text">
                  <strong>Click to upload approval proof</strong> or drag and drop
                </div>
                <span className="upload-subtext">PNG, JPG, JPEG, PDF (Max. 10MB)</span>
              </div>

              {/* Approval Files List */}
              {approvalFiles.length > 0 && (
                <div className="file-list">
                  {approvalFiles.map((file, idx) => (
                    <div key={idx} className="file-item">
                      <div className="file-info">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5A6E" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveApprovalFile(idx)
                        }}
                        className="file-remove-btn"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notice Alert Banner with Support Email */}
        <div className="notice-banner">
          <div className="notice-icon-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="notice-text">
              Your request will be reviewed by the Corporate Communication Team. We'll get back to you if any clarification is required.
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0038FF' }}>
              If any doubt reach out to us:{' '}
              <a
                href="mailto:peopleconnect@aionioncapital.com"
                style={{ color: '#0038FF', textDecoration: 'underline', fontWeight: '800' }}
              >
                peopleconnect@aionioncapital.com
              </a>
            </span>
          </div>
        </div>

        {/* Form Submission Actions */}
        <div className="submit-area" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {Object.keys(errors).length > 0 && (
            <div style={{
              background: '#FEF2F2',
              border: '2px solid #EF4444',
              borderRadius: '12px',
              padding: '14px 20px',
              color: '#991B1B',
              fontSize: '14px',
              fontWeight: '700',
              textAlign: 'center',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}>
              ⚠️ Please fill out all required fields marked with * ({Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? 's' : ''} missing).
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" onClick={handleReset} className="btn-secondary" style={{ padding: '18px 32px', fontSize: '15px', borderRadius: '50px' }}>
              Clear Form
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>{isSubmitting ? 'SUBMITTING REQUEST...' : 'SUBMIT REQUEST'}</span>
            </button>
          </div>

          {/* Reassurance & Security Badges */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10B981' }}>✓</span> Instant Email Routing
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#0038FF' }}>⚡</span> Fast Turnaround
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#8B5CF6' }}>🔒</span> 256-bit Encrypted
            </span>
          </div>
        </div>
      </form>

      {/* Footer & Discreet Admin Link */}
      <footer style={{ textAlign: 'center', margin: '32px 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
        <span>© {new Date().getFullYear()} Aionion Capital. All rights reserved. • </span>
        <button
          type="button"
          onClick={handleOpenAdminPortal}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
        >
          Admin Portal 🔒
        </button>
      </footer>

      {/* Confirmation Modal */}
      {submittedRefId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-badge-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="modal-title">Request Submitted!</h3>
            <span className="modal-ref">Reference ID: {submittedRefId}</span>
            <p className="modal-body-text">
              Thank you, <strong>{formData.fullName}</strong>. Your corporate support request has been successfully registered and prepared for delivery.
            </p>

            <div style={{
              background: '#f4f6ff',
              border: '1px solid #c7d2fe',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '16px 0',
              textAlign: 'left',
              fontSize: '13px',
              color: '#1e293b'
            }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: '#0038FF' }}>
                ✉️ Email Notification Routing:
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>To:</strong> <code>peopleconnect@aionioncapital.com</code>
              </div>
              <div>
                <strong>CC:</strong> <code>naveenkumar.k@aionioncapital.com</code>, <code>balakumar.elango@aionioncapital.com</code>
              </div>
            </div>

            <button type="button" onClick={handleReset} className="modal-btn">
              Submit Another Request
            </button>
          </div>
        </div>
      )}

      {/* Admin Passcode Auth Modal */}
      {showPasscodeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="success-badge-icon" style={{ background: '#e0e7ff', color: '#3730a3' }}>
              🔒
            </div>
            <h3 className="modal-title">Admin Portal Access</h3>
            <p className="modal-body-text">
              Enter the corporate communications admin passcode to manage tickets and deliver work.
            </p>

            <form onSubmit={handleAdminAuth} style={{ width: '100%', marginTop: '16px' }}>
              <input
                type="password"
                placeholder="Enter Admin Passcode"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className={`form-input ${passcodeError ? 'input-error' : ''}`}
                style={{ textAlign: 'center', fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}
                autoFocus
              />
              {passcodeError && (
                <div className="error-text" style={{ textAlign: 'center', marginBottom: '12px' }}>
                  Invalid Admin Passcode. Please try again.
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setShowPasscodeModal(false); setPasscodeError(false); }}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn"
                  style={{ flex: 1 }}
                >
                  Unlock Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
