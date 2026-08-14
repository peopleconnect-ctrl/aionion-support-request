import { motion } from 'motion/react'
import { sectionVariants } from '../animations/variants'

export default function AnimatedSection({ children, className = '', style = {}, delay = 0, ...props }) {
  return (
    <motion.section
      className={`form-section-card ${className}`}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      style={style}
      {...props}
    >
      {children}
    </motion.section>
  )
}
