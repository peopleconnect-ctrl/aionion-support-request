import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function PinterestFileDropzone({
  onFilesSelected,
  files = [],
  onRemoveFile,
  accept = '.pdf,.jpg,.jpeg,.png',
  placeholderText = 'Drag & drop files here or click to upload',
  subtext = 'PDF, JPG, PNG (Max. 10MB)',
  colorTheme = 'blue'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState('idle') // 'idle' | 'flying' | 'uploading' | 'completed'
  const [progress, setProgress] = useState(0)
  const [activeFileName, setActiveFileName] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    const file = selectedFiles[0]
    setActiveFileName(file.name)

    // Phase 1: Flying Arrow (300ms)
    setUploadState('flying')
    setProgress(10)

    setTimeout(() => {
      // Phase 2: Progress Fill (700ms)
      setUploadState('uploading')
      let current = 15
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 20) + 15
        if (current >= 100) {
          current = 100
          clearInterval(interval)

          // Phase 3: Completion Morph
          setTimeout(() => {
            setUploadState('completed')
            onFilesSelected(selectedFiles)
            setTimeout(() => {
              setUploadState('idle')
              setProgress(0)
            }, 1400)
          }, 200)
        }
        setProgress(current)
      }, 90)
    }, 300)
  }

  const primaryColor = colorTheme === 'pink' ? '#FF5A6E' : '#0038FF'
  const lightBg = colorTheme === 'pink' ? '#FFF1F2' : '#EFF6FF'
  const accentBorder = colorTheme === 'pink' ? '#FECDD3' : '#C7D2FE'

  return (
    <div className="pinterest-upload-wrapper" style={{ width: '100%' }}>
      {/* Dropzone Container */}
      <motion.div
        className={`file-dropzone pinterest-dropzone ${isDragging ? 'dragging' : ''}`}
        onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
          }
        }}
        whileHover={{ scale: uploadState === 'idle' ? 1.008 : 1 }}
        whileTap={{ scale: uploadState === 'idle' ? 0.992 : 1 }}
        style={{
          position: 'relative',
          padding: '24px 20px',
          borderRadius: '16px',
          border: '2px dashed #CBD5E1',
          background: isDragging ? lightBg : '#FFFFFF',
          textAlign: 'center',
          cursor: uploadState === 'idle' ? 'pointer' : 'default',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          multiple
          accept={accept}
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {/* IDLE STATE: Dashed Box with Flying Cloud Arrow */}
          {uploadState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              {/* Flying Arrow Icon (Detaches & Flies Up on Click/Drop) */}
              <motion.div
                className="upload-cloud-icon"
                animate={{
                  y: isDragging ? [-4, 4, -4] : [0, -4, 0]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: lightBg,
                  color: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 16l-4-4-4 4" />
                  <path d="M12 12v9" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </motion.div>
              <div className="upload-text" style={{ fontSize: '13.5px', color: '#0F172A' }}>
                <strong>{placeholderText.split(' or ')[0]}</strong> or {placeholderText.split(' or ')[1] || 'click to upload'}
              </div>
              <span className="upload-subtext" style={{ fontSize: '12px', color: '#94A3B8' }}>
                {subtext}
              </span>
            </motion.div>
          )}

          {/* FLYING ARROW ANIMATION STATE (Daily UI 031 Signature Move) */}
          {uploadState === 'flying' && (
            <motion.div
              key="flying"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <motion.div
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ y: -45, opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.35, ease: 'easeIn' }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: primaryColor,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 20px ${primaryColor}40`
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </motion.div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: primaryColor }}>
                Preparing Upload...
              </span>
            </motion.div>
          )}

          {/* UPLOADING PROGRESS STATE (Daily UI 031 Bar Morph) */}
          {uploadState === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', maxWidth: '340px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                  Uploading: {activeFileName}
                </span>
                <span style={{ color: primaryColor }}>{progress}%</span>
              </div>

              {/* Progress Bar Container */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: '#E2E8F0',
                  borderRadius: '50px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${primaryColor} 0%, #10B981 100%)`,
                    borderRadius: '50px'
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}

          {/* COMPLETED SUCCESS STATE (Daily UI 031 Card Checkmark Morph) */}
          {uploadState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: [0.94, 1.04, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                ✓
              </motion.div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                  Upload Completed!
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>
                  {activeFileName} attached securely
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ATTACHED FILE LIST CARDS (With Image Previews & Spring Cards) */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="file-list" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', perspective: '1000px' }}>
            {files.map((file, idx) => (
              <motion.div
                key={file.name + idx}
                className="file-item animated-file-card"
                initial={{ opacity: 0, y: 16, rotateX: 15, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                whileHover={{ y: -3, rotateX: -2, boxShadow: `0 8px 24px ${primaryColor}20`, borderColor: primaryColor }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                layout
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt="File Preview"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #E2E8F0',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: lightBg,
                        border: `1px solid ${accentBorder}`,
                        color: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '11px',
                        flexShrink: 0
                      }}
                    >
                      FILE
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </span>
                    <span className="file-size" style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="status-ping-dot" style={{ width: '6px', height: '6px' }} />
                      {(file.size / 1024).toFixed(1)} KB • Attached &amp; Encrypted
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile(idx)
                  }}
                  className="file-remove-btn"
                  title="Remove file"
                  whileHover={{ rotate: 90, scale: 1.15, backgroundColor: '#FEE2E2', color: '#EF4444' }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#F1F5F9',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
