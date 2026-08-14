import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { DURATION, EASING } from '../animations/transitions'
import { fieldErrorShakeVariants, errorMessageVariants } from '../animations/variants'

export default function AnimatedDropdown({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  required = false,
  error = null,
  className = '',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef(null)

  const hasValue = value !== undefined && value !== null && String(value).trim() !== ''
  const isFloating = isFocused || isOpen || hasValue

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({ target: { name, value: optionValue } })
    }
    setIsOpen(false)
    setIsFocused(false)
  }

  const selectedOptionLabel = options.find((opt) => opt.value === value)?.label || value || ''

  return (
    <motion.div
      ref={dropdownRef}
      className={`form-group custom-animated-dropdown ${className} ${error ? 'has-error' : ''}`}
      style={{ position: 'relative', width: '100%', zIndex: isOpen ? 999 : 1, ...style }}
      variants={fieldErrorShakeVariants}
      animate={error ? 'error' : 'normal'}
    >
      {/* Floating Label */}
      {label && (
        <motion.label
          className="form-label animated-form-label"
          animate={{
            y: isFloating ? -22 : 0,
            scale: isFloating ? 0.88 : 1,
            color: isFocused || isOpen ? '#0038FF' : (error ? '#EF4444' : '#475569')
          }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
          style={{
            position: isFloating ? 'absolute' : 'relative',
            top: isFloating ? '-2px' : '0px',
            left: isFloating ? '10px' : '0px',
            transformOrigin: 'left top',
            pointerEvents: 'none',
            zIndex: 10,
            background: isFloating ? '#FFFFFF' : 'transparent',
            padding: isFloating ? '0 6px' : '0',
            borderRadius: '4px',
            fontWeight: '700',
            fontSize: '13px'
          }}
        >
          {label} {required && <span className="required-star">*</span>}
        </motion.label>
      )}

      {/* Trigger Button */}
      <motion.button
        type="button"
        name={name}
        onClick={() => {
          setIsOpen((prev) => !prev)
          setIsFocused(true)
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !isOpen && setIsFocused(false)}
        className={`form-select custom-select-trigger ${error ? 'input-error' : ''}`}
        animate={{
          borderColor: isOpen || isFocused ? '#0038FF' : (error ? '#EF4444' : '#CBD5E1'),
          boxShadow: isOpen || isFocused
            ? '0 0 0 3px rgba(0, 56, 255, 0.12), 0 4px 12px rgba(0, 56, 255, 0.08)'
            : 'none'
        }}
        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderRadius: '12px',
          background: '#FFFFFF',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '14px',
          color: hasValue ? '#0F172A' : '#94A3B8',
          fontWeight: hasValue ? '600' : '400',
          position: 'relative',
          zIndex: 5
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOptionLabel || placeholder}
        </span>

        {/* Animated Rotating Arrow Icon */}
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isOpen || isFocused ? '#0038FF' : '#64748B'}
          strokeWidth="2.5"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASING.SMOOTH }}
          style={{ flexShrink: 0, marginLeft: '8px' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.button>

      {/* Animated Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-dropdown-menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              boxShadow: '0 16px 36px rgba(15, 23, 42, 0.2)',
              padding: '6px',
              zIndex: 9999,
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <motion.div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  whileHover={{ backgroundColor: '#F0F4FF', x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#0038FF' : '#1E293B',
                    background: isSelected ? '#EFF6FF' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '2px 0'
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0038FF"
                      strokeWidth="3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.span
            className="error-text"
            variants={errorMessageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ display: 'block', marginTop: '4px' }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
