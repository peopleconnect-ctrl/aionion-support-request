import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fieldErrorShakeVariants, errorMessageVariants } from '../animations/variants'

export default function AnimatedField({
  label,
  value,
  required = false,
  error = null,
  children,
  className = '',
  style = {}
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      className={`form-group animated-field-group ${className} ${isFocused ? 'field-focused' : ''} ${error ? 'has-error' : ''}`}
      style={{ position: 'relative', ...style }}
      variants={fieldErrorShakeVariants}
      animate={error ? 'error' : 'normal'}
    >
      {label && (
        <motion.label
          className="form-label animated-form-label"
          animate={{
            color: isFocused ? '#0038FF' : (error ? '#EF4444' : '#475569')
          }}
          transition={{ duration: 0.18 }}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: '700',
            fontSize: '13px',
            pointerEvents: 'none'
          }}
        >
          {label} {required && <span className="required-star" style={{ color: '#EF4444' }}>*</span>}
        </motion.label>
      )}

      <motion.div
        className="field-input-wrapper"
        animate={{
          borderColor: isFocused ? '#0038FF' : (error ? '#EF4444' : '#CBD5E1'),
          boxShadow: isFocused
            ? '0 0 0 3px rgba(0, 56, 255, 0.12), 0 2px 8px rgba(0, 56, 255, 0.06)'
            : 'none'
        }}
        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] }}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
        style={{ borderRadius: '12px', width: '100%' }}
      >
        {children}
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.span
            className="error-text"
            variants={errorMessageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ display: 'block', marginTop: '4px', color: '#EF4444', fontSize: '12px', fontWeight: '600' }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
