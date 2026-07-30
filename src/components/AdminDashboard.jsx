import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import logoImg from '../assets/logo.png'

export default function AdminDashboard({ onSwitchToForm, onLogout }) {
  // Sidebar Tab Navigation ('dashboard' | 'requests' | 'categories' | 'reports')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Requests Data State
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  // Categories State
  const [categories, setCategories] = useState([
    { id: '1', name: 'ID card', count: 0, color: '#0038FF' },
    { id: '2', name: 'Visiting card', count: 0, color: '#4F46E5' },
    { id: '3', name: 'Creative', count: 0, color: '#FF5A6E' },
    { id: '4', name: 'PPT Creation', count: 0, color: '#8B5CF6' },
    { id: '5', name: 'Online Webinar Requirement', count: 0, color: '#10B981' },
    { id: '6', name: 'Client mail communication', count: 0, color: '#F59E0B' },
    { id: '7', name: 'KYC Document edit', count: 0, color: '#EC4899' },
    { id: '8', name: 'Other Requirement', count: 0, color: '#06B6D4' }
  ])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)

  // Selected Request Modal State (Manage & Deliver)
  const [selectedReq, setSelectedReq] = useState(null)
  const [updateStatus, setUpdateStatus] = useState('Pending')
  const [assignedTo, setAssignedTo] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [deliverableFiles, setDeliverableFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const deliverableInputRef = useRef(null)

  // Fetch Requests from Supabase (with localStorage fallback)
  const fetchRequests = async () => {
    setLoading(true)
    let fetchedData = []
    let supabaseSuccess = false

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('support_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          fetchedData = data
          supabaseSuccess = true
        } else if (error) {
          console.warn('Supabase fetch error:', error.message)
        }
      }
    } catch (err) {
      console.warn('Error fetching requests from Supabase:', err)
    }

    // Merge with local storage fallback
    try {
      const localData = JSON.parse(localStorage.getItem('aionion_support_requests') || '[]')
      if (localData.length > 0) {
        // Combine Supabase and local storage without duplicates
        const existingRefIds = new Set(fetchedData.map((item) => item.reference_id))
        const missingLocal = localData.filter((item) => !existingRefIds.has(item.reference_id))
        fetchedData = [...fetchedData, ...missingLocal]
      }
    } catch (e) {
      console.warn('LocalStorage load notice:', e)
    }

    setRequests(fetchedData)
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Filter Requests
  const filteredRequests = requests.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      (item.reference_id && item.reference_id.toLowerCase().includes(searchLower)) ||
      (item.full_name && item.full_name.toLowerCase().includes(searchLower)) ||
      (item.department && item.department.toLowerCase().includes(searchLower)) ||
      (item.request_category && item.request_category.toLowerCase().includes(searchLower))

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || item.priority_level === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Stats Counters
  const totalCount = requests.length
  const pendingCount = requests.filter((r) => r.status === 'Pending').length
  const inProgressCount = requests.filter((r) => r.status === 'In Progress').length
  const completedCount = requests.filter((r) => r.status === 'Completed').length

  // High / Normal / Low counters
  const highPriorityCount = requests.filter((r) => r.priority_level === 'High').length
  const normalPriorityCount = requests.filter((r) => r.priority_level === 'Normal').length
  const lowPriorityCount = requests.filter((r) => r.priority_level === 'Low').length

  // Open Modal for Ticket Management
  const handleOpenTicket = (req) => {
    setSelectedReq(req)
    setUpdateStatus(req.status || 'Pending')
    setAssignedTo(req.assigned_to || '')
    setCompletionNotes(req.completion_notes || '')
    setDeliverableFiles(req.deliverable_file_urls || [])
  }

  // Handle File Uploads for Deliverables
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    const newUrls = [...deliverableFiles]

    const fileToDataUrl = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => resolve('#')
        reader.readAsDataURL(file)
      })

    for (const file of Array.from(files)) {
      let publicUrl = null
      if (supabase) {
        try {
          const fileExt = file.name.split('.').pop()
          const filePath = `deliverables/${selectedReq.reference_id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(filePath, file)

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('support-attachments')
              .getPublicUrl(filePath)
            if (publicUrlData?.publicUrl) {
              publicUrl = publicUrlData.publicUrl
            }
          }
        } catch (err) {
          console.warn('Deliverable storage notice:', err)
        }
      }
      if (!publicUrl || publicUrl === '#') {
        publicUrl = await fileToDataUrl(file)
      }
      newUrls.push({ name: file.name, url: publicUrl })
    }

    setDeliverableFiles(newUrls)
    setIsUploading(false)
  }

  // Helper to convert Base64 Data URL to Blob object
  const dataURLtoBlob = (dataurl) => {
    try {
      const arr = dataurl.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    } catch (e) {
      console.warn('dataURLtoBlob conversion error:', e)
      return null
    }
  }

  // In-App File Preview Modal State
  const [previewModalFile, setPreviewModalFile] = useState(null)

  // Programmatic File Download and Preview Handlers
  const handleDownloadFile = (url, name) => {
    if (!url || url === '#') return
    let targetUrl = url
    let tempBlobUrl = null

    if (url.startsWith('data:')) {
      const blob = dataURLtoBlob(url)
      if (blob) {
        tempBlobUrl = URL.createObjectURL(blob)
        targetUrl = tempBlobUrl
      }
    }

    try {
      const link = document.createElement('a')
      link.href = targetUrl
      link.download = name || 'attachment'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.warn('Download error:', err)
      window.open(targetUrl, '_blank')
    }

    if (tempBlobUrl) {
      setTimeout(() => URL.revokeObjectURL(tempBlobUrl), 10000)
    }
  }

  const handleViewFile = (url, name) => {
    if (!url || url === '#') return
    let targetUrl = url

    if (url.startsWith('data:')) {
      const blob = dataURLtoBlob(url)
      if (blob) {
        targetUrl = URL.createObjectURL(blob)
      }
    }

    setPreviewModalFile({ url: targetUrl, name: name || 'File Preview' })
  }

  // Save Updates & Trigger Completion Email
  const handleSaveAndNotify = async (isCompleting = false) => {
    setIsSaving(true)
    const nextStatus = isCompleting ? 'Completed' : updateStatus
    const completedAt = isCompleting ? new Date().toISOString() : selectedReq.completed_at

    try {
      if (supabase) {
        await supabase
          .from('support_requests')
          .update({
            status: nextStatus,
            assigned_to: assignedTo,
            completion_notes: completionNotes,
            deliverable_file_urls: deliverableFiles,
            completed_at: completedAt
          })
          .eq('reference_id', selectedReq.reference_id)
      }
    } catch (err) {
      console.warn('Supabase update notice:', err)
    }

    setRequests((prev) =>
      prev.map((item) =>
        item.reference_id === selectedReq.reference_id
          ? {
              ...item,
              status: nextStatus,
              assigned_to: assignedTo,
              completion_notes: completionNotes,
              deliverable_file_urls: deliverableFiles,
              completed_at: completedAt
            }
          : item
      )
    )

    if (nextStatus === 'Completed' || nextStatus === 'In Progress' || isCompleting) {
      const requesterEmail = selectedReq.email
      const ccList = [
        'peopleconnect@aionioncapital.com',
        'naveenkumar.k@aionioncapital.com',
        'balakumar.elango@aionioncapital.com',
        selectedReq.approver_email
      ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i && v !== requesterEmail).join(',')

      let fileLinksText = deliverableFiles.length > 0
        ? deliverableFiles.map((f, i) => `${i + 1}. ${f.name}: ${f.url}`).join('\n')
        : 'Deliverable files delivered directly / attached.'

      const isDone = nextStatus === 'Completed'
      const statusTitle = isDone ? 'WORK COMPLETED & DELIVERED' : 'STATUS UPDATE: IN PROGRESS'

      const bodyText = `
${statusTitle}
========================================
Reference ID    : ${selectedReq.reference_id}
Requester Name  : ${selectedReq.full_name}
Department      : ${selectedReq.department}
Request Category: ${selectedReq.request_category}
Status          : ${nextStatus}
Date            : ${new Date().toLocaleDateString('en-GB')}

👤 REQUESTER DETAILS
----------------------------------------
Official Email  : ${selectedReq.email}
Contact Number  : ${selectedReq.contact_number || 'N/A'}
Branch Location : ${selectedReq.branch_location || 'N/A'}

--- NOTES & INSTRUCTIONS FROM TEAM ---
${completionNotes || (isDone ? 'Your support request has been completed.' : 'Your request is currently being processed by Corporate Communications team.')}

${isDone ? `--- COMPLETED DELIVERABLES / FILES ---\n${fileLinksText}\n` : ''}
--- APPROVER INFORMATION ---
Approver Name   : ${selectedReq.approver_name || 'N/A'}
Approver Email  : ${selectedReq.approver_email || 'N/A'}

========================================
Corporate Communications Team
Aionion Capital
`

      const sanitizeFileUrlsForEmail = (fileArray) => {
        if (!fileArray || !Array.isArray(fileArray)) return []
        return fileArray.map((f) => {
          const fileUrl = f.url || (typeof f === 'string' ? f : '#')
          if (fileUrl && fileUrl.startsWith('data:') && fileUrl.length > 1000000) {
            return { name: f.name || 'Deliverable', url: '#' }
          }
          return f
        })
      }

      try {
        // Trigger Google Workspace SMTP email dispatch via Vercel API
        await fetch('/api/submit-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'status_update',
            reference_id: selectedReq.reference_id,
            full_name: selectedReq.full_name,
            email: requesterEmail,
            approver_email: selectedReq.approver_email,
            request_category: selectedReq.request_category,
            status: nextStatus,
            completion_notes: completionNotes,
            deliverable_files: sanitizeFileUrlsForEmail(deliverableFiles)
          })
        })
      } catch (notifyErr) {
        console.warn('Status notification dispatch error:', notifyErr)
      }
    }

    setIsSaving(false)
    setSelectedReq(null)
  }

  // Export CSV Report Function
  const exportCSVReport = (reportType = 'All') => {
    let exportData = requests
    if (reportType === 'Daily') {
      const todayStr = new Date().toISOString().split('T')[0]
      exportData = requests.filter((r) => r.created_at && r.created_at.startsWith(todayStr))
    } else if (reportType === 'Pending') {
      exportData = requests.filter((r) => r.status === 'Pending')
    } else if (reportType === 'Completed') {
      exportData = requests.filter((r) => r.status === 'Completed')
    }

    const headers = [
      'Reference ID',
      'Created Date',
      'Full Name',
      'Employee Code',
      'Department',
      'Email',
      'Contact',
      'Branch',
      'Category',
      'Priority',
      'Required By',
      'Approver Name',
      'Approver Email',
      'Status'
    ]

    const csvRows = [
      headers.join(','),
      ...exportData.map((row) =>
        [
          `"${row.reference_id}"`,
          `"${new Date(row.created_at || Date.now()).toLocaleDateString()}"`,
          `"${row.full_name || ''}"`,
          `"${row.employee_code || ''}"`,
          `"${row.department || ''}"`,
          `"${row.email || ''}"`,
          `"${row.contact_number || ''}"`,
          `"${row.branch_location || ''}"`,
          `"${row.request_category || ''}"`,
          `"${row.priority_level || ''}"`,
          `"${row.required_by || ''}"`,
          `"${row.approver_name || ''}"`,
          `"${row.approver_email || ''}"`,
          `"${row.status || ''}"`
        ].join(',')
      )
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Aionion_Support_Requests_${reportType}_Report.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Add Category Handler
  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    const colors = ['#0038FF', '#FF5A6E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']
    const newCat = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      count: 0,
      color: colors[Math.floor(Math.random() * colors.length)]
    }
    setCategories((prev) => [...prev, newCat])
    setNewCategoryName('')
    setShowAddCategoryModal(false)
  }

  return (
    <div className="portal-shell">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="portal-sidebar">
        {/* Brand Logo Header */}
        <div className="sidebar-brand-box">
          <img src={logoImg} alt="Aionion Capital Logo" className="sidebar-logo-img" />
        </div>

        {/* Sidebar Nav Links */}
        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Request Management</span>
            <span className="nav-badge">{pendingCount > 0 ? pendingCount : totalCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Reports</span>
          </button>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="portal-main">
        {/* Top Navbar */}
        <header className="portal-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'requests' && 'Request Management'}
              {activeTab === 'categories' && 'Request Categories'}
              {activeTab === 'reports' && 'Reports & Analytics'}
            </h1>
            <p className="topbar-sub">Welcome back, Admin! Here's what's happening today.</p>
          </div>

          <div className="topbar-right">
            <button onClick={onSwitchToForm} className="btn-primary-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Submit Request Form
            </button>

            <div className="user-avatar-badge">
              <div className="avatar-circle">A</div>
              <div className="avatar-name">Admin</div>
            </div>
          </div>
        </header>

        {/* TAB CONTENT: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view-wrapper">
            {/* Top 4 Stats Cards */}
            <div className="overview-stats-grid">
              <div className="overview-stat-card blue">
                <div className="stat-card-icon blue">📄</div>
                <div className="stat-card-data">
                  <span className="stat-number">{totalCount}</span>
                  <span className="stat-title">Total Requests</span>
                </div>
                <button onClick={() => setActiveTab('requests')} className="stat-link-btn blue">
                  View all →
                </button>
              </div>

              <div className="overview-stat-card orange">
                <div className="stat-card-icon orange">⏳</div>
                <div className="stat-card-data">
                  <span className="stat-number">{pendingCount}</span>
                  <span className="stat-title">Pending Review</span>
                </div>
                <button onClick={() => { setStatusFilter('Pending'); setActiveTab('requests'); }} className="stat-link-btn orange">
                  View all →
                </button>
              </div>

              <div className="overview-stat-card purple">
                <div className="stat-card-icon purple">⌛</div>
                <div className="stat-card-data">
                  <span className="stat-number">{inProgressCount}</span>
                  <span className="stat-title">In Progress</span>
                </div>
                <button onClick={() => { setStatusFilter('In Progress'); setActiveTab('requests'); }} className="stat-link-btn purple">
                  View all →
                </button>
              </div>

              <div className="overview-stat-card green">
                <div className="stat-card-icon green">✅</div>
                <div className="stat-card-data">
                  <span className="stat-number">{completedCount}</span>
                  <span className="stat-title">Completed & Delivered</span>
                </div>
                <button onClick={() => { setStatusFilter('Completed'); setActiveTab('requests'); }} className="stat-link-btn green">
                  View all →
                </button>
              </div>
            </div>

            {/* Middle Section: Quick Export Reports Banner */}
            <div className="quick-export-card">
              <div className="export-text-group">
                <div className="export-icon-box">📥</div>
                <div>
                  <h3 className="export-title">Download Reports</h3>
                  <p className="export-desc">Export dashboard request records directly into Excel / CSV format.</p>
                </div>
              </div>
              <div className="export-btn-group">
                <button onClick={() => exportCSVReport('Daily')} className="btn-export blue">
                  📥 Daily Report
                </button>
                <button onClick={() => exportCSVReport('Weekly')} className="btn-export green">
                  📥 Weekly Report
                </button>
                <button onClick={() => exportCSVReport('Monthly')} className="btn-export purple">
                  📥 Monthly Report
                </button>
              </div>
            </div>

            {/* Analytics Visualizations Grid */}
            <div className="analytics-grid">
              {/* Requests Trend Line Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Requests Trend</h3>
                  <div className="chart-legend">
                    <span className="legend-item blue">Total</span>
                    <span className="legend-item orange">Pending</span>
                    <span className="legend-item green">Completed</span>
                  </div>
                </div>
                <div className="svg-chart-container">
                  <svg width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#0038FF" strokeWidth="3" points="0,90 80,65 160,80 240,50 320,60 400,45 500,40" />
                    <polyline fill="none" stroke="#F59E0B" strokeWidth="3" points="0,130 80,120 160,115 240,125 320,120 400,105 500,95" />
                    <polyline fill="none" stroke="#10B981" strokeWidth="3" points="0,145 80,135 160,140 240,135 320,130 400,120 500,125" />
                  </svg>
                  <div className="chart-dates-row">
                    <span>May 12</span>
                    <span>May 13</span>
                    <span>May 14</span>
                    <span>May 15</span>
                    <span>May 16</span>
                    <span>May 17</span>
                    <span>May 18</span>
                  </div>
                </div>
              </div>

              {/* Priority Donut Chart */}
              <div className="chart-card donut-card">
                <h3>Requests by Priority</h3>
                <div className="donut-wrapper">
                  <div className="donut-circle priority">
                    <div className="donut-inner">
                      <strong>{totalCount}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="donut-legend-list">
                    <div className="legend-row">
                      <span className="dot red"></span> High ({highPriorityCount > 0 ? highPriorityCount : 2})
                    </div>
                    <div className="legend-row">
                      <span className="dot orange"></span> Normal ({normalPriorityCount > 0 ? normalPriorityCount : 2})
                    </div>
                    <div className="legend-row">
                      <span className="dot green"></span> Low ({lowPriorityCount > 0 ? lowPriorityCount : 1})
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Donut Chart */}
              <div className="chart-card donut-card">
                <h3>Requests by Status</h3>
                <div className="donut-wrapper">
                  <div className="donut-circle status">
                    <div className="donut-inner">
                      <strong>{totalCount}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="donut-legend-list">
                    <div className="legend-row">
                      <span className="dot orange"></span> Pending ({pendingCount})
                    </div>
                    <div className="legend-row">
                      <span className="dot blue"></span> In Progress ({inProgressCount})
                    </div>
                    <div className="legend-row">
                      <span className="dot green"></span> Completed ({completedCount})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Requests Table Section */}
            <div className="recent-section-card">
              <div className="section-header-row">
                <h3>Recent Requests</h3>
                <button onClick={() => setActiveTab('requests')} className="btn-link-text">
                  View all requests →
                </button>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>REF ID</th>
                      <th>REQUESTER</th>
                      <th>CATEGORY</th>
                      <th>REQUIRED BY</th>
                      <th>PRIORITY</th>
                      <th>APPROVER</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 5).map((req) => (
                      <tr key={req.id || req.reference_id}>
                        <td>
                          <span className="ref-badge">{req.reference_id}</span>
                        </td>
                        <td>
                          <div className="user-info">
                            <strong>{req.full_name}</strong>
                            <span className="sub-text">{req.email}</span>
                          </div>
                        </td>
                        <td>{req.request_category}</td>
                        <td>{req.required_by}</td>
                        <td>
                          <span className={`priority-pill ${req.priority_level?.toLowerCase()}`}>
                            {req.priority_level}
                          </span>
                        </td>
                        <td>
                          <div className="user-info">
                            <span>{req.approver_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${req.status?.toLowerCase().replace(' ', '-')}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenTicket(req)}
                            className="btn-action"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: REQUEST MANAGEMENT */}
        {activeTab === 'requests' && (
          <div className="requests-view-wrapper">
            {/* Filter Bar */}
            <div className="filters-card">
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Ref ID (e.g. REQ-2026-8419), Name, or Category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button onClick={fetchRequests} className="btn-icon" title="Refresh Data">
                🔄
              </button>
            </div>

            {/* Requests Data Table */}
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-state">Loading support requests...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="empty-state">No matching support requests found.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket Ref</th>
                      <th>Requester</th>
                      <th>Category</th>
                      <th>Required By</th>
                      <th>Priority</th>
                      <th>Approver</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id || req.reference_id}>
                        <td>
                          <span className="ref-badge">{req.reference_id}</span>
                        </td>
                        <td>
                          <div className="user-info">
                            <strong>{req.full_name}</strong>
                            <span className="sub-text">{req.department} • {req.email}</span>
                          </div>
                        </td>
                        <td>{req.request_category}</td>
                        <td>{req.required_by}</td>
                        <td>
                          <span className={`priority-pill ${req.priority_level?.toLowerCase()}`}>
                            {req.priority_level}
                          </span>
                        </td>
                        <td>
                          <div className="user-info">
                            <span>{req.approver_name}</span>
                            <span className="sub-text">{req.approver_email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${req.status?.toLowerCase().replace(' ', '-')}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenTicket(req)}
                            className="btn-action"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="categories-view-wrapper">
            <div className="section-header-row">
              <h2>Corporate Support Categories</h2>
              <button onClick={() => setShowAddCategoryModal(true)} className="btn-primary-blue">
                + Add New Category
              </button>
            </div>

            <div className="categories-grid">
              {categories.map((cat) => (
                <div key={cat.id} className="category-card" style={{ borderTop: `4px solid ${cat.color}` }}>
                  <div className="cat-header">
                    <span className="cat-icon-circle" style={{ background: `${cat.color}15`, color: cat.color }}>📁</span>
                    <span className="cat-count-badge">{cat.count} Requests</span>
                  </div>
                  <h3 className="cat-title">{cat.name}</h3>
                  <div className="cat-actions">
                    <button onClick={() => { setSearchTerm(cat.name); setActiveTab('requests'); }} className="cat-view-btn">
                      View Requests →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Add Category */}
            {showAddCategoryModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '440px' }}>
                  <h3>Add Request Category</h3>
                  <form onSubmit={handleAddCategory} style={{ width: '100%', marginTop: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Category Name:</label>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. CSR & Sponsorship Collateral"
                        className="form-input"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="modal-actions-row" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(false)}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-success"
                        style={{ flex: 1 }}
                      >
                        Add Category
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: REPORTS & EXPORT */}
        {activeTab === 'reports' && (
          <div className="reports-view-wrapper">
            <div className="section-header-row">
              <h2>Reports & CSV Exports</h2>
              <button onClick={() => exportCSVReport('All')} className="btn-success">
                📥 Export All Data (CSV)
              </button>
            </div>

            <div className="reports-export-cards">
              <div className="report-card">
                <h3>📅 Daily Support Requests Report</h3>
                <p>Generate CSV report of all support requests submitted today.</p>
                <button onClick={() => exportCSVReport('Daily')} className="btn-secondary">
                  Download Daily CSV
                </button>
              </div>

              <div className="report-card">
                <h3>⏳ Pending Requests Report</h3>
                <p>Export all requests currently pending review by Corporate Communications.</p>
                <button onClick={() => exportCSVReport('Pending')} className="btn-secondary">
                  Download Pending CSV
                </button>
              </div>

              <div className="report-card">
                <h3>✅ Completed Deliverables Log</h3>
                <p>Export full archive log of all completed & delivered tickets.</p>
                <button onClick={() => exportCSVReport('Completed')} className="btn-secondary">
                  Download Completed CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ticket Management & Delivery Modal */}
      {selectedReq && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header-row">
              <div>
                <h2>Ticket Management: {selectedReq.reference_id}</h2>
                <span className="sub-text">
                  Submitted by {selectedReq.full_name} ({selectedReq.email})
                </span>
              </div>
              <button onClick={() => setSelectedReq(null)} className="close-btn">
                ✕
              </button>
            </div>

            <div className="modal-grid-2">
              {/* Left Column: Requester Information */}
              <div className="detail-panel">
                <h3>📋 Request Information</h3>

                <div className="detail-row">
                  <strong>Category:</strong> {selectedReq.request_category}
                </div>
                <div className="detail-row">
                  <strong>Branch / Location:</strong> {selectedReq.branch_location}
                </div>
                <div className="detail-row">
                  <strong>Required By Date:</strong> {selectedReq.required_by}
                </div>
                <div className="detail-row">
                  <strong>Priority Level:</strong> {selectedReq.priority_level}
                </div>
                <div className="detail-row">
                  <strong>Approver:</strong> {selectedReq.approver_name} ({selectedReq.approver_email})
                </div>

                <div className="detail-block">
                  <strong>Purpose & Requirements:</strong>
                  <p className="purpose-box">{selectedReq.purpose_of_request}</p>
                </div>

                {/* Uploaded Reference Files */}
                {selectedReq.reference_file_urls && selectedReq.reference_file_urls.length > 0 && (
                  <div className="detail-block" style={{ marginTop: '12px' }}>
                    <strong>Attached Reference Files ({selectedReq.reference_file_urls.length}):</strong>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px' }}>
                      {selectedReq.reference_file_urls.map((file, i) => {
                        const fileName = typeof file === 'object' ? file.name : `Reference File #${i + 1}`
                        const fileUrl = typeof file === 'object' ? file.url : file
                        return (
                          <li key={i} style={{ marginBottom: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: '600', color: '#1e293b', flex: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {fileName}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {!fileUrl || fileUrl === '#' ? (
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                  File unavailable (Old test ticket)
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleViewFile(fileUrl, fileName)}
                                    style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(fileUrl, fileName)}
                                    style={{ background: '#0038FF', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                  >
                                    📥 Download
                                  </button>
                                </>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {/* Uploaded Approval Proof Files */}
                {selectedReq.approval_file_urls && selectedReq.approval_file_urls.length > 0 && (
                  <div className="detail-block" style={{ marginTop: '12px' }}>
                    <strong>Approval Proof Screenshot / Mail:</strong>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px' }}>
                      {selectedReq.approval_file_urls.map((file, i) => {
                        const fileName = typeof file === 'object' ? file.name : `Approval Proof #${i + 1}`
                        const fileUrl = typeof file === 'object' ? file.url : file
                        return (
                          <li key={i} style={{ marginBottom: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                            <span style={{ fontWeight: '600', color: '#166534', flex: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🛡️ {fileName}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {!fileUrl || fileUrl === '#' ? (
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px' }}>
                                  File unavailable (Old test ticket)
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleViewFile(fileUrl, fileName)}
                                    style={{ background: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(fileUrl, fileName)}
                                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                  >
                                    📥 Download
                                  </button>
                                </>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Work Delivery & Completion Section */}
              <div className="delivery-panel">
                <h3>⚡ Work Delivery & Completion</h3>

                {/* Status Selector */}
                <div className="form-group">
                  <label className="form-label">Update Status:</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div className="form-group">
                  <label className="form-label">Assigned Designer / Staff:</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. Naveen Kumar"
                    className="form-input"
                  />
                </div>

                {/* Completion Notes */}
                <div className="form-group">
                  <label className="form-label">Delivery Notes / Message to Employee:</label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Describe completed work, feedback, or delivery instructions..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>

                {/* Upload Completed Deliverables */}
                <div className="form-group">
                  <label className="form-label">Upload Completed Work / Deliverables:</label>
                  <div
                    className="file-dropzone compact"
                    onClick={() => deliverableInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={deliverableInputRef}
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      multiple
                      style={{ display: 'none' }}
                    />
                    <span>{isUploading ? 'Uploading deliverable...' : '📁 Click to upload finished artwork / deliverable files'}</span>
                  </div>

                  {/* List of Deliverable files */}
                  {deliverableFiles.length > 0 && (
                    <div className="deliverable-list">
                      {deliverableFiles.map((fileItem, idx) => (
                        <div key={idx} className="deliverable-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcfce7', marginTop: '6px' }}>
                          <span style={{ fontWeight: '600', color: '#166534', fontSize: '13px', flex: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✅ {fileItem.name || `Deliverable #${idx + 1}`}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleViewFile(fileItem.url)}
                              style={{ background: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              👁️ View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(fileItem.url, fileItem.name || 'deliverable')}
                              style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              📥 Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="modal-actions-row">
                  <button
                    type="button"
                    onClick={() => handleSaveAndNotify(false)}
                    disabled={isSaving}
                    className="btn-secondary"
                  >
                    Save Status Only
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveAndNotify(true)}
                    disabled={isSaving}
                    className="btn-success"
                  >
                    ✉️ Complete & Email Deliverable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP FILE PREVIEW MODAL */}
      {previewModalFile && (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setPreviewModalFile(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '900px', width: '92%', height: '85vh', padding: '20px', display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                📄 {previewModalFile.name}
              </h3>
              <button
                onClick={() => setPreviewModalFile(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', background: '#0f172a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewModalFile.url.startsWith('data:image') || previewModalFile.url.match(/\.(png|jpe?g|gif|svg|webp)/i) ? (
                <img src={previewModalFile.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <iframe src={previewModalFile.url} title="Document Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
              <button
                onClick={() => handleDownloadFile(previewModalFile.url, previewModalFile.name)}
                style={{ background: '#0038FF', color: '#ffffff', border: 'none', padding: '9px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                📥 Download File
              </button>
              <button
                onClick={() => setPreviewModalFile(null)}
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
