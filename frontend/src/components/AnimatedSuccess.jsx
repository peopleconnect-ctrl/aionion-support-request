import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { modalOverlayVariants, modalContentVariants } from '../animations/variants'
import AnimatedButton from './AnimatedButton'
import infinityImg from '../assets/infinity-symbol.png'

export default function AnimatedSuccess({
  submittedRefId,
  fullName,
  onReset
}) {
  const [journeyStage, setJourneyStage] = useState(0) // 0: Entrance, 1: Infinity Pulse, 2: Status Sequence, 3: Final Reveal

  useEffect(() => {
    if (!submittedRefId) {
      setJourneyStage(0)
      return
    }

    // Sequence timing for Aionion Request Journey (Total ~2.2 seconds)
    const t1 = setTimeout(() => setJourneyStage(1), 300) // Infinity logo appear
    const t2 = setTimeout(() => setJourneyStage(2), 1100) // Infinity light pulse completes, start status list
    const t3 = setTimeout(() => setJourneyStage(3), 2000) // Final Request ID & Email info reveal

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [submittedRefId])

  if (!submittedRefId) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="modal-overlay"
        variants={modalOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(15, 23, 42, 0.75)'
        }}
      >
        <motion.div
          className="modal-content journey-modal-content"
          variants={modalContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            maxWidth: '520px',
            textAlign: 'center',
            padding: '36px 32px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Brand Header */}
          <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#64748B', marginBottom: '16px' }}>
            AIONION CAPITAL • SUPPORT JOURNEY
          </div>

          {/* Infinity Symbol Logo Container with Gradient Light Pulse */}
          <div
            className="infinity-logo-wrapper"
            style={{
              position: 'relative',
              width: '140px',
              height: '70px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.img
              src={infinityImg}
              alt="Aionion Infinity Symbol"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 2
              }}
            />

            {/* Soft Blue -> Pink Travelling Light Pulse (No logo rotation or distortion) */}
            {journeyStage >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.8, 0.4, 0.9, 0],
                  scale: [0.95, 1.08, 1.02, 1.12, 1]
                }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  background: 'radial-gradient(circle, rgba(0, 56, 255, 0.35) 0%, rgba(255, 90, 110, 0.3) 50%, rgba(255, 255, 255, 0) 70%)',
                  borderRadius: '50%',
                  filter: 'blur(12px)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>

          {/* Staggered Status Journey Timeline Items */}
          {journeyStage >= 2 && (
            <motion.div
              className="journey-status-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '20px',
                alignItems: 'center'
              }}
            >
              {[
                { title: 'Request Submitted', delay: 0 },
                { title: 'Request Recorded', delay: 0.15 },
                { title: 'Notification Sent', delay: 0.3 }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay, duration: 0.2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0F172A',
                    background: '#F1F5F9',
                    padding: '6px 16px',
                    borderRadius: '50px'
                  }}
                >
                  <span style={{ color: '#10B981', fontWeight: '900' }}>✓</span>
                  <span>{item.title}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Final Stage: REQUEST RECEIVED + Real Request ID + Email Context */}
          {journeyStage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#0F172A',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                REQUEST RECEIVED
              </h2>

              <motion.div
                className="modal-ref"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #0038FF 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '800',
                  padding: '8px 20px',
                  borderRadius: '50px',
                  boxShadow: '0 4px 14px rgba(0, 56, 255, 0.3)',
                  marginBottom: '14px',
                  letterSpacing: '1px'
                }}
              >
                {submittedRefId}
              </motion.div>

              <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Thank you, <strong>{fullName}</strong>. Your support ticket is now live in our system and team notification emails have been dispatched.
              </p>

              <div
                style={{
                  background: '#F0F4FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  margin: '0 0 20px 0',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#1E293B'
                }}
              >
                <div style={{ fontWeight: '700', marginBottom: '4px', color: '#0038FF' }}>
                  ✉️ Email Routing Dispatched:
                </div>
                <div><strong>To:</strong> <code>peopleconnect@aionioncapital.com</code></div>
                <div><strong>CC:</strong> <code>naveenkumar.k@aionioncapital.com</code></div>
              </div>

              <AnimatedButton
                type="button"
                onClick={onReset}
                className="modal-btn"
                style={{ width: '100%', padding: '14px 24px', fontSize: '14px', borderRadius: '50px' }}
              >
                Submit Another Request
              </AnimatedButton>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
