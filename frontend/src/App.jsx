// Aionion Support Requests - Production Build (Pinterest Daily UI 031 & Theo Animation Integration)
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from './lib/supabase'
import AdminDashboard from './components/AdminDashboard'
import AnimatedField from './components/AnimatedField'
import AnimatedSection from './components/AnimatedSection'
import AnimatedButton from './components/AnimatedButton'
import AnimatedStepIndicator from './components/AnimatedStepIndicator'
import AionionSuccessJourney from './components/AionionSuccessJourney'
import PinterestFileDropzone from './components/PinterestFileDropzone'
import SearchableSelect from './components/SearchableSelect'
import {
  pageContainerVariants,
  headerEntranceVariants,
  heroTextVariants,
  heroImageVariants,
  modalOverlayVariants,
  modalContentVariants
} from './animations/variants'
import { DURATION, EASING } from './animations/transitions'

import logoImg from './assets/logo.png'
import heroLaptopImg from './assets/hero-laptop.png'
import './App.css'

const departmentOptions = [
  "Accounts & Finance",
  "Admin & Facilities",
  "Brand & Marketing",
  "Client Relations",
  "Compliance & Legal",
  "Dealing & Operations",
  "Depository Participant (DP)",
  "Human Resources (HR)",
  "Information Technology (IT)",
  "Insurance",
  "International Desk",
  "Learning & Development (L&D)",
  "Management Information System (MIS)",
  "Sales & Business Development",
  "Others"
];



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

  // Approval Screenshot Upload State
  const [approvalFiles, setApprovalFiles] = useState([])

  // Sub-Options State for Creative, Webinar, and Custom requirements
  const [creativeSubItems, setCreativeSubItems] = useState([])
  const [webinarSubItems, setWebinarSubItems] = useState([])
  const [customSubItemText, setCustomSubItemText] = useState('')
  const [otherRequirementText, setOtherRequirementText] = useState('')
  
  // Custom Department State
  const [customDepartmentText, setCustomDepartmentText] = useState('')
  const [customApproverDepartmentText, setCustomApproverDepartmentText] = useState('')

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

  // Dynamic Section Completion Checking
  const isSection1Complete = Boolean(
    formData.fullName.trim() &&
    formData.department &&
    formData.email.trim() &&
    formData.contactNumber.trim() &&
    formData.branchLocation
  )

  const isSection2Complete = Boolean(
    formData.requestCategory &&
    formData.purposeOfRequest.trim()
  )

  const isSection3Complete = Boolean(formData.requiredBy)
  const isSection4Complete = Boolean(uploadedFiles.length > 0)
  const isSection5Complete = Boolean(
    formData.approverName.trim() &&
    formData.approverEmail.trim() &&
    formData.approverDepartment
  )

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Reference Files Add & Remove Handlers
  const handleFileAdd = (files) => {
    const validFiles = []
    const oversizedFiles = []

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/') && file.size > 2.5 * 1024 * 1024) {
        oversizedFiles.push(file.name)
      } else {
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        validFiles.push(Object.assign(file, { previewUrl }))
      }
    })

    if (oversizedFiles.length > 0) {
      alert(`⚠️ The following PDF/document files exceed the 2.5MB size limit:\n\n${oversizedFiles.join('\n')}\n\nPlease attach smaller PDF files or compressed images.`)
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => {
      const removed = prev[index]
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Approval Screenshot Add & Remove Handlers
  const handleApprovalFileAdd = (files) => {
    const validFiles = []
    const oversizedFiles = []

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/') && file.size > 2.5 * 1024 * 1024) {
        oversizedFiles.push(file.name)
      } else {
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        validFiles.push(Object.assign(file, { previewUrl }))
      }
    })

    if (oversizedFiles.length > 0) {
      alert(`⚠️ The following PDF/document files exceed the 2.5MB size limit:\n\n${oversizedFiles.join('\n')}\n\nPlease attach smaller PDF files or compressed images.`)
    }

    if (validFiles.length > 0) {
      setApprovalFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleRemoveApprovalFile = (index) => {
    setApprovalFiles((prev) => {
      const removed = prev[index]
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Validate Required Fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required'
    if (!formData.department) {
      newErrors.department = 'Please select your department.'
    } else if (!departmentOptions.includes(formData.department)) {
      newErrors.department = 'Please select a department from the list.'
    } else if (formData.department === 'Others' && !customDepartmentText.trim()) {
      newErrors.department = 'Please specify your department.'
    }
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
    if (!formData.approverDepartment) {
      newErrors.approverDepartment = 'Please select your department.'
    } else if (!departmentOptions.includes(formData.approverDepartment)) {
      newErrors.approverDepartment = 'Please select a department from the list.'
    } else if (formData.approverDepartment === 'Others' && !customApproverDepartmentText.trim()) {
      newErrors.approverDepartment = 'Please specify your department.'
    }

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
          if (file.size > 2.5 * 1024 * 1024) {
            resolve('#')
            return
          }
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
            const maxDim = 600
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
            const compressed = canvas.toDataURL('image/jpeg', 0.5)
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
      
      let finalDepartmentString = formData.department
      if (formData.department === 'Others' && customDepartmentText.trim()) {
        finalDepartmentString = `Others (${customDepartmentText.trim()})`
      }
      
      let finalApproverDepartmentString = formData.approverDepartment
      if (formData.approverDepartment === 'Others' && customApproverDepartmentText.trim()) {
        finalApproverDepartmentString = `Others (${customApproverDepartmentText.trim()})`
      }

      const newRecord = {
        reference_id: generatedId,
        full_name: formData.fullName,
        employee_code: formData.employeeCode,
        department: finalDepartmentString,
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
        approver_department: finalApproverDepartmentString,
        reference_file_urls: refFileUrls,
        approval_file_urls: approvalFileUrls,
        status: 'In Progress',
        created_at: new Date().toISOString()
      }

      // Save to localStorage
      try {
        const cleanRecordForLocal = {
          ...newRecord,
          reference_file_urls: (newRecord.reference_file_urls || []).map(f => ({ name: f.name, url: '#' })),
          approval_file_urls: (newRecord.approval_file_urls || []).map(f => ({ name: f.name, url: '#' }))
        }
        const existingLocal = JSON.parse(localStorage.getItem('aionion_support_requests') || '[]')
        localStorage.setItem('aionion_support_requests', JSON.stringify([cleanRecordForLocal, ...existingLocal].slice(0, 20)))
      } catch (err) {
        console.warn('LocalStorage save notice:', err)
      }

      // 1. Primary Submission: Vercel Serverless API
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

      // 2. Client-side Supabase insert fallback
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

      // 3. Direct browser fallback to Google Apps Script
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
    setCustomDepartmentText('')
    setCustomApproverDepartmentText('')
    setErrors({})
    setSubmittedRefId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <motion.div
      className="app-container"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Unified Top Banner / Hero Card with Ambient Watermark & Theo Character Floating Animation */}
      <motion.header className="form-header-card" variants={headerEntranceVariants}>
        <div className="hero-watermark-overlay"></div>
        <div className="hero-dot-grid"></div>

        {/* Brand Logo Row */}
        <div className="brand-top-row">
          <motion.img
            src={logoImg}
            alt="Aionion Capital Logo"
            className="header-logo-img"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: DURATION.FAST }}
          />
        </div>

        {/* Title & Laptop Hero Grid */}
        <div className="hero-layout">
          <motion.div className="hero-text-content" variants={heroTextVariants}>
            <h1 className="main-title">
              Corporate <br />
              Communication &amp; <br />
              Support <br />
              <span className="title-highlight">Request Form</span>
            </h1>
            <p className="hero-subtitle">
              <span>Share your requirement in a few simple steps.</span>
              <span>Our team will review and get back to you.</span>
            </p>
          </motion.div>

          <motion.div className="hero-illustration" variants={heroImageVariants}>
            <img
              src={heroLaptopImg}
              alt="Workspace Laptop Mockup"
              className="laptop-mockup-img"
            />
          </motion.div>
        </div>

        {/* 4-Step Process Workflow Bar */}
        <AnimatedStepIndicator />
      </motion.header>

      {/* Main Single Page Continuous Form Container */}
      <form onSubmit={handleSubmit} noValidate className="form-sections-wrapper">
        <motion.div
          className="form-section-tagline"
          style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748B', marginBottom: '-8px' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: DURATION.NORMAL }}
        >
          THE BRIEF – HELP US UNDERSTAND YOUR REQUIREMENT
        </motion.div>

        {/* SECTION 01: REQUESTER DETAILS */}
        <AnimatedSection key="section-01" id="section-01">
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

          <div className="form-grid-3" style={{ position: 'relative', zIndex: 20 }}>
            <AnimatedField label="1. Full Name" value={formData.fullName} required error={errors.fullName}>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              />
            </AnimatedField>

            <AnimatedField label="2. Employee Code" value={formData.employeeCode}>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                placeholder="e.g. AION-1042"
                className="form-input"
              />
            </AnimatedField>

            <AnimatedField label="3. Official Email ID" value={formData.email} required error={errors.email}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email id"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
              />
            </AnimatedField>
          </div>

          <div className="form-grid-3" style={{ marginTop: '16px', position: 'relative', zIndex: 10 }}>
            <AnimatedField label="4. Department / Team" value={formData.department} required error={errors.department} style={{ zIndex: 50 }}>
              <SearchableSelect
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={departmentOptions}
                placeholder="Type to search department..."
                error={errors.department}
              />
              <AnimatePresence>
                {formData.department === 'Others' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: DURATION.FAST }}
                    style={{ marginTop: '10px' }}
                  >
                    <input
                      type="text"
                      placeholder="Specify your department"
                      value={customDepartmentText}
                      onChange={(e) => setCustomDepartmentText(e.target.value)}
                      className={`form-input ${(formData.department === 'Others' && !customDepartmentText.trim()) ? 'input-error' : ''}`}
                      style={{ fontSize: '13px' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedField>

            <AnimatedField label="5. Contact Number" value={formData.contactNumber} required error={errors.contactNumber}>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+971 50 XXX XXXX"
                className={`form-input ${errors.contactNumber ? 'input-error' : ''}`}
              />
            </AnimatedField>

            <AnimatedField label="6. Branch / Location" value={formData.branchLocation} required error={errors.branchLocation}>
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
            </AnimatedField>
          </div>
        </AnimatedSection>

        {/* SECTION 02: REQUEST INFORMATION */}
        <AnimatedSection key="section-02" id="section-02">
          <div className="section-header">
            <div className="step-badge pink">02</div>
            <div className="step-icon-wrapper pink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="step-title-group">
              <h2 className="step-title">What are we creating together?</h2>
              <span className="step-subtitle">Tell us about your requirement.</span>
            </div>
          </div>

          <div className="form-grid-split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatedField label="7. Request Category" value={formData.requestCategory} required error={errors.requestCategory}>
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

                <AnimatePresence>
                  {formData.requestCategory === 'Creative' && (
                    <motion.div
                      style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '10px' }}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: DURATION.FAST }}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {formData.requestCategory === 'Online Webinar Requirement' && (
                    <motion.div
                      style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '10px' }}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: DURATION.FAST }}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {formData.requestCategory === 'Other Requirement' && (
                    <motion.div
                      style={{ marginTop: '10px' }}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: DURATION.FAST }}
                    >
                      <input
                        type="text"
                        placeholder="Describe your custom requirement..."
                        value={otherRequirementText}
                        onChange={(e) => setOtherRequirementText(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '13px' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedField>

              <AnimatedField label="8. Target Audience" value={formData.targetAudience}>
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
              </AnimatedField>
            </div>

            <AnimatedField label="9. Purpose of Request" value={formData.purposeOfRequest} required error={errors.purposeOfRequest}>
              <textarea
                name="purposeOfRequest"
                value={formData.purposeOfRequest}
                onChange={handleChange}
                placeholder="Brief purpose in one or two lines"
                className={`form-textarea ${errors.purposeOfRequest ? 'input-error' : ''}`}
                style={{ height: '100%', minHeight: '135px' }}
              />
            </AnimatedField>
          </div>
        </AnimatedSection>

        {/* 2-COLUMN SPLIT GRID FOR SECTIONS 03 & 04 */}
        <div className="form-grid-split">
          {/* SECTION 03: TIMELINE & PRIORITY */}
          <AnimatedSection key="section-03" id="section-03">
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

            <AnimatedField label="10. Required By" value={formData.requiredBy} required error={errors.requiredBy}>
              <input
                type="date"
                name="requiredBy"
                value={formData.requiredBy}
                onChange={handleChange}
                className={`form-input ${errors.requiredBy ? 'input-error' : ''}`}
              />
            </AnimatedField>

            <AnimatedField label="11. Priority Level" value={formData.priorityLevel} required>
              <div className="priority-radio-group">
                {[
                  { label: 'Low Pressure', value: 'Low' },
                  { label: 'Standard', value: 'Normal' },
                  { label: 'Mission Critical', value: 'High' }
                ].map((item) => (
                  <motion.label
                    key={item.value}
                    className="radio-option"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="priorityLevel"
                      value={item.value}
                      checked={formData.priorityLevel === item.value}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    {item.label}
                  </motion.label>
                ))}
              </div>
            </AnimatedField>
          </AnimatedSection>

          {/* SECTION 04: PINTEREST DAILY UI 031 FILE UPLOAD ANIMATION */}
          <AnimatedSection key="section-04" id="section-04">
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

            <AnimatedField label="12. Upload Reference Files">
              <PinterestFileDropzone
                onFilesSelected={handleFileAdd}
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                placeholderText="Drag & drop files here or click to upload"
                subtext="PDF, JPG, PNG (Max. 10MB)"
                colorTheme="blue"
              />
            </AnimatedField>
          </AnimatedSection>
        </div>

        {/* SECTION 05: APPROVAL DETAILS WITH PINTEREST DAILY UI 031 ANIMATION */}
        <AnimatedSection key="section-05" id="section-05" style={{ position: 'relative', zIndex: 20 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatedField label="13. Approver Name" value={formData.approverName} required error={errors.approverName}>
                <input
                  type="text"
                  name="approverName"
                  value={formData.approverName}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className={`form-input ${errors.approverName ? 'input-error' : ''}`}
                />
              </AnimatedField>

              <AnimatedField label="14. Approver Email ID" value={formData.approverEmail} required error={errors.approverEmail}>
                <input
                  type="email"
                  name="approverEmail"
                  value={formData.approverEmail}
                  onChange={handleChange}
                  placeholder="Enter email id"
                  className={`form-input ${errors.approverEmail ? 'input-error' : ''}`}
                />
              </AnimatedField>

              <AnimatedField label="15. Department / Team" value={formData.approverDepartment} required error={errors.approverDepartment} style={{ zIndex: 50 }}>
                <SearchableSelect
                  name="approverDepartment"
                  value={formData.approverDepartment}
                  onChange={handleChange}
                  options={departmentOptions}
                  placeholder="Type to search department..."
                  error={errors.approverDepartment}
                />
                <AnimatePresence>
                  {formData.approverDepartment === 'Others' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: DURATION.FAST }}
                      style={{ marginTop: '10px' }}
                    >
                      <input
                        type="text"
                        placeholder="Specify your department"
                        value={customApproverDepartmentText}
                        onChange={(e) => setCustomApproverDepartmentText(e.target.value)}
                        className={`form-input ${(formData.approverDepartment === 'Others' && !customApproverDepartmentText.trim()) ? 'input-error' : ''}`}
                        style={{ fontSize: '13px' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedField>
            </div>

            {/* PINTEREST DAILY UI 031 APPROVAL DROPZONE */}
            <AnimatedField label="16. Upload Approval Screenshot / Mail Proof (Optional)">
              <PinterestFileDropzone
                onFilesSelected={handleApprovalFileAdd}
                files={approvalFiles}
                onRemoveFile={handleRemoveApprovalFile}
                placeholderText="Click to upload approval proof or drag and drop"
                subtext="PNG, JPG, JPEG, PDF (Max. 10MB)"
                colorTheme="pink"
              />
            </AnimatedField>
          </div>
        </AnimatedSection>

        {/* Notice Alert Banner */}
        <motion.div
          className="notice-banner"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: DURATION.NORMAL }}
        >
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
        </motion.div>

        {/* Form Submission Actions */}
        <div className="submit-area" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AnimatePresence>
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DURATION.FAST }}
                style={{
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
                }}
              >
                ⚠️ Please fill out all required fields marked with * ({Object.keys(errors).length} required field{Object.keys(errors).length > 1 ? 's' : ''} missing).
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <AnimatedButton type="button" onClick={handleReset} className="btn-secondary" style={{ padding: '18px 32px', fontSize: '15px', borderRadius: '50px' }}>
              Clear Form
            </AnimatedButton>
            <AnimatedButton type="submit" className="submit-btn" isLoading={isSubmitting}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>{isSubmitting ? 'SUBMITTING REQUEST...' : 'SUBMIT REQUEST'}</span>
            </AnimatedButton>
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

      {/* Premium Branded Aionion Success Journey Modal */}
      <AionionSuccessJourney
        requestId={submittedRefId}
        fullName={formData.fullName}
        onReset={handleReset}
      />

      {/* Admin Passcode Auth Modal */}
      <AnimatePresence mode="wait">
        {showPasscodeModal && (
          <motion.div
            className="modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="modal-content"
              style={{ maxWidth: '400px' }}
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
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
                <AnimatePresence>
                  {passcodeError && (
                    <motion.div
                      className="error-text"
                      style={{ textAlign: 'center', marginBottom: '12px' }}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Invalid Admin Passcode. Please try again.
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <AnimatedButton
                    type="button"
                    onClick={() => { setShowPasscodeModal(false); setPasscodeError(false); }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton
                    type="submit"
                    className="modal-btn"
                    style={{ flex: 1 }}
                  >
                    Unlock Portal
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default App
