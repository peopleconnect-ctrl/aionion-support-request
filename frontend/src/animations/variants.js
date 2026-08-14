import { DURATION, EASING } from './transitions'

// Page load staggering container
export const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
}

// Header & hero load entrance
export const headerEntranceVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.NORMAL, ease: EASING.EASE_OUT }
  }
}

export const heroTextVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.SECTION, ease: EASING.SMOOTH }
  }
}

export const heroImageVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.SECTION, ease: EASING.SMOOTH }
  }
}

// Form Section entrance
export const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.SECTION, ease: EASING.SMOOTH }
  }
}

// Workflow step stagger
export const workflowListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 }
  }
}

export const workflowStepVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.NORMAL, ease: EASING.SMOOTH }
  }
}

// Field Focus & Error Shake
export const fieldErrorShakeVariants = {
  normal: { x: 0 },
  error: {
    x: [0, -5, 5, -4, 4, -2, 2, 0],
    transition: { duration: 0.35, ease: 'easeInOut' }
  }
}

export const errorMessageVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.FAST, ease: EASING.EASE_OUT }
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: { duration: DURATION.FAST }
  }
}

// Button micro-interactions
export const buttonInteractionVariants = {
  idle: { scale: 1, y: 0 },
  hover: {
    y: -2,
    scale: 1.01,
    transition: { duration: DURATION.FAST, ease: EASING.SMOOTH }
  },
  tap: {
    y: 1,
    scale: 0.98,
    transition: { duration: DURATION.FAST }
  }
}

// Card micro-interactions (Category options, selection)
export const cardHoverVariants = {
  idle: { y: 0, scale: 1, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' },
  hover: {
    y: -3,
    scale: 1.01,
    boxShadow: '0 8px 24px rgba(0, 56, 255, 0.12)',
    transition: { duration: DURATION.FAST, ease: EASING.SMOOTH }
  },
  tap: { y: 0, scale: 0.99 }
}

// File Upload item entrance/exit
export const fileItemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.NORMAL, ease: EASING.EASE_OUT }
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.96,
    transition: { duration: DURATION.FAST }
  }
}

// Modal Animation (Passcode Auth / Confirmation)
export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.NORMAL, ease: EASING.EASE_OUT }
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.FAST }
  }
}

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.SECTION, ease: EASING.SPRING_SUBTLE }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: DURATION.FAST }
  }
}

// Success Icon Checkmark Spring
export const successBadgeVariants = {
  hidden: { scale: 0.4, opacity: 0, rotate: -20 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { duration: DURATION.SUCCESS, ease: EASING.SPRING_SUCCESS }
  }
}

// Tab / Navigation Page Fade & Slide
export const pageTransitionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.SECTION, ease: EASING.SMOOTH }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: DURATION.FAST }
  }
}
