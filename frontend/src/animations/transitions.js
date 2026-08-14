// Motion timing constants matching corporate motion design system
export const DURATION = {
  FAST: 0.15, // 150ms for micro-interactions, focus, subtle hover
  NORMAL: 0.25, // 250ms for standard element state changes
  SECTION: 0.35, // 350ms for card/section transitions
  SUCCESS: 0.45 // 450ms for submission success sequences
}

export const EASING = {
  // Smooth corporate cubic-bezier easing
  SMOOTH: [0.25, 0.1, 0.25, 1.0],
  EASE_OUT: [0.0, 0.0, 0.2, 1.0],
  EASE_IN_OUT: [0.4, 0.0, 0.2, 1.0],
  SPRING_SUBTLE: { type: 'spring', stiffness: 450, damping: 35 },
  SPRING_SUCCESS: { type: 'spring', stiffness: 300, damping: 25 }
}

export const transitionFast = {
  duration: DURATION.FAST,
  ease: EASING.SMOOTH
}

export const transitionNormal = {
  duration: DURATION.NORMAL,
  ease: EASING.EASE_OUT
}

export const transitionSection = {
  duration: DURATION.SECTION,
  ease: EASING.SMOOTH
}

export const transitionSuccess = {
  duration: DURATION.SUCCESS,
  ease: EASING.SMOOTH
}
