import { motion } from 'motion/react'

const workflowSteps = [
  {
    title: 'Submit Request',
    desc: 'Share your requirement',
    color: 'blue',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    )
  },
  {
    title: 'We Review & Plan',
    desc: 'We understand & plan',
    color: 'pink',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    )
  },
  {
    title: 'Take Action',
    desc: 'We work on it',
    color: 'blue',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    )
  },
  {
    title: 'Deliver On Time',
    desc: 'On time, every time',
    color: 'pink',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  }
]

export default function AnimatedStepIndicator({ sectionCompletion = {} }) {
  return (
    <div className="workflow-bar">
      {workflowSteps.map((step, idx) => (
        <motion.div
          key={idx}
          className="workflow-step"
          whileHover={{ y: -2, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className={`workflow-icon-circle ${step.color}`}>
            {step.icon}
          </div>
          <div className="workflow-info">
            <span className="workflow-title">{step.title}</span>
            <span className="workflow-desc">{step.desc}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
