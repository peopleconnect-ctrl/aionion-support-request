import { motion } from 'motion/react'
import { buttonInteractionVariants } from '../animations/variants'
import { DURATION, EASING } from '../animations/transitions'

export default function AnimatedButton({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  isLoading = false,
  style = {},
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
      variants={buttonInteractionVariants}
      initial="idle"
      whileHover={disabled ? 'idle' : 'hover'}
      whileTap={disabled ? 'idle' : 'tap'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...props}
    >
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        animate={{ opacity: isLoading ? 0.7 : 1 }}
        transition={{ duration: DURATION.FAST, ease: EASING.SMOOTH }}
      >
        {isLoading && (
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
          </motion.svg>
        )}
        {children}
      </motion.div>
    </motion.button>
  )
}
