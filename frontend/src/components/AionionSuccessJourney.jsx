import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import AnimatedButton from './AnimatedButton'
import infinitySymbolImg from '../assets/infinity-symbol.png'

export default function AionionSuccessJourney({
  requestId,
  fullName = '',
  onReset,
  onDone
}) {
  // Journey Steps:
  // Step 1: 5 sec dedicated screen with popper animation + form sucessfully completed.gif (background blended)
  // Step 2 & 3: Requester to PeopleConnect document arc handover
  // Step 4 & 5: Official Aionion infinity symbol energy flow + checklist
  // Step 6: REQUEST RECEIVED alongside real Request ID (e.g. REQ-2026-XXXX)
  const [journeyStep, setJourneyStep] = useState(1)

  useEffect(() => {
    if (!requestId) {
      setJourneyStep(1)
      return
    }

    // Timers according to 6-step breakdown
    const t1 = setTimeout(() => setJourneyStep(2), 5000)  // Step 1 (GIF + Poppers screen): 5 Seconds
    const t2 = setTimeout(() => setJourneyStep(3), 5700)  // Step 2 & 3: Handover Arc
    const t3 = setTimeout(() => setJourneyStep(4), 6600)  // Step 4: Infinity Symbol Flow
    const t4 = setTimeout(() => setJourneyStep(5), 7300)  // Step 5: Checklist Checks
    const t5 = setTimeout(() => setJourneyStep(6), 8000)  // Step 6: Final Real Request ID Reveal

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [requestId])

  if (!requestId) return null

  const handleDone = () => {
    if (onDone) onDone()
    else if (onReset) onReset()
  }

  return (
    <AnimatePresence>
      <div
        className="modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.86)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}
      >
        <motion.div
          className="modal-content journey-modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            maxWidth: '520px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            textAlign: 'center',
            padding: '24px 24px 28px 24px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
            position: 'relative'
          }}
        >
          {/* TOP 6-STEP PROGRESSION INDICATOR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <motion.div
                key={s}
                animate={{
                  width: journeyStep === s ? '20px' : '6px',
                  background: journeyStep >= s ? (s % 2 === 0 ? '#FF5A6E' : '#0038FF') : '#CBD5E1'
                }}
                transition={{ duration: 0.3 }}
                style={{ height: '6px', borderRadius: '50px' }}
              />
            ))}
          </div>

          {/* BRAND SUBTITLE BADGE */}
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: '800',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#0038FF',
              background: '#EFF6FF',
              border: '1px solid #C7D2FE',
              padding: '5px 14px',
              borderRadius: '50px',
              display: 'inline-block',
              marginBottom: '16px'
            }}
          >
            AIONION CAPITAL • REQUEST JOURNEY
          </div>

          {/* ========================================================================= */}
          {/* STEP 1 (FIRST 5 SECONDS): POPPER BURST + BLENDED GIF SCREEN */}
          {/* ========================================================================= */}
          {journeyStep === 1 && (
            <motion.div
              key="step-1-gif-screen"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', position: 'relative' }}
            >
              {/* CELEBRATORY POPPER BURST PARTICLES */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
                {Array.from({ length: 18 }).map((_, i) => {
                  const angle = (i / 18) * 360
                  const rad = (angle * Math.PI) / 180
                  const distance = 90 + (i % 4) * 25
                  const x = Math.cos(rad) * distance
                  const y = Math.sin(rad) * distance - 20
                  const colors = ['#0038FF', '#FF5A6E', '#F59E0B', '#10B981', '#8B5CF6']
                  const color = colors[i % colors.length]

                  return (
                    <motion.div
                      key={`popper-${i}`}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        x: x,
                        y: y,
                        scale: [0, 1.3, 0.8],
                        rotate: i * 45
                      }}
                      transition={{ duration: 1.4, delay: (i % 6) * 0.04, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '35%',
                        width: i % 2 === 0 ? '10px' : '6px',
                        height: i % 2 === 0 ? '10px' : '14px',
                        borderRadius: i % 3 === 0 ? '50%' : '3px',
                        background: color
                      }}
                    />
                  )
                })}
              </div>

              {/* GIF CONTAINER WITH BLENDED BACKGROUND (NO WHITE RECTANGLE BOX) */}
              <div style={{ marginBottom: '16px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <img
                  src="/form sucessfully completed.gif"
                  alt="Form Successfully Completed"
                  style={{
                    maxWidth: '220px',
                    height: 'auto',
                    mixBlendMode: 'multiply',
                    filter: 'contrast(1.05)',
                    display: 'block'
                  }}
                />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                Form Submitted Successfully! 🎉
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: '600' }}>
                Your request is prepared and ready for processing...
              </p>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEPS 2 & 3: REQUESTER TO PEOPLECONNECT DOCUMENT ARC HANDOVER */}
          {/* ========================================================================= */}
          {(journeyStep === 2 || journeyStep === 3) && (
            <motion.div
              key="steps-2-3-handover"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div
                style={{
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '380px',
                    position: 'relative',
                    padding: '0 16px'
                  }}
                >
                  {/* Left Character: BLUE Requester Avatar */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 2
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        border: '2.5px solid #0038FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0038FF',
                        boxShadow: '0 4px 14px rgba(0, 56, 255, 0.2)'
                      }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0038FF', letterSpacing: '0.5px' }}>
                      REQUESTER
                    </span>
                  </motion.div>

                  {/* Arc Trajectory Path */}
                  <svg width="200" height="50" viewBox="0 0 200 50" fill="none" style={{ position: 'absolute', left: 'calc(50% - 100px)', top: '-10px', zIndex: 1 }}>
                    <path
                      d="M 20 40 Q 100 -10 180 40"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  {/* Travelling Document Icon (Handover Motion) */}
                  <motion.div
                    initial={{ x: -120, y: 5, scale: 0.9 }}
                    animate={
                      journeyStep === 3
                        ? { x: 120, y: [5, -35, 5], scale: [0.9, 1.2, 1] }
                        : { x: -120, y: 5, scale: 0.9 }
                    }
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{
                      position: 'absolute',
                      left: 'calc(50% - 19px)',
                      zIndex: 10,
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0038FF 0%, #FF5A6E 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 18px rgba(0, 56, 255, 0.35)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </motion.div>

                  {/* Right Character: PINK PeopleConnect Avatar */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 2
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
                        border: '2.5px solid #FF5A6E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF5A6E',
                        boxShadow: '0 4px 14px rgba(255, 90, 110, 0.2)'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF5A6E', letterSpacing: '0.5px' }}>
                      PEOPLECONNECT
                    </span>
                  </motion.div>
                </div>
              </div>

              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                {journeyStep === 2 ? 'Your request is ready' : 'PeopleConnect received your request'}
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEPS 4 & 5: OFFICIAL AIONION INFINITY SYMBOL ENERGY FLOW + CHECKLIST */}
          {/* ========================================================================= */}
          {(journeyStep === 4 || journeyStep === 5) && (
            <motion.div
              key="steps-4-5-infinity"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div
                style={{
                  height: '130px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '180px',
                    height: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Converging Brand Particles (Step 4) */}
                  {journeyStep === 4 && (
                    <>
                      {[-90, -60, -30].map((xPos, idx) => (
                        <motion.div
                          key={`p-blue-${idx}`}
                          initial={{ x: xPos, opacity: 0, scale: 0.4 }}
                          animate={{ x: 0, opacity: [0, 1, 0.1], scale: [0.4, 1.3, 0.2] }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                          style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#0038FF',
                            boxShadow: '0 0 10px #0038FF'
                          }}
                        />
                      ))}
                      {[90, 60, 30].map((xPos, idx) => (
                        <motion.div
                          key={`p-pink-${idx}`}
                          initial={{ x: xPos, opacity: 0, scale: 0.4 }}
                          animate={{ x: 0, opacity: [0, 1, 0.1], scale: [0.4, 1.3, 0.2] }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                          style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#FF5A6E',
                            boxShadow: '0 0 10px #FF5A6E'
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Clean Official Aionion Infinity Brand Asset */}
                  <motion.img
                    src={infinitySymbolImg}
                    alt="Aionion Infinity Symbol"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{
                      opacity: [0.85, 1, 0.85],
                      scale: [0.96, 1.04, 0.96]
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 2.2,
                      ease: 'easeInOut'
                    }}
                    style={{
                      width: '140px',
                      height: 'auto',
                      objectFit: 'contain',
                      position: 'relative',
                      zIndex: 3,
                      filter: 'drop-shadow(0 6px 20px rgba(0, 56, 255, 0.3))'
                    }}
                  />

                  {/* Soft Light Radial Pulse Glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.95, 1.18, 0.95]
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: '-10px',
                      background: 'radial-gradient(circle, rgba(0, 56, 255, 0.35) 0%, rgba(255, 90, 110, 0.35) 50%, rgba(255, 255, 255, 0) 75%)',
                      borderRadius: '50%',
                      filter: 'blur(16px)',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
                Processing your request
              </div>

              {/* Staggered Status Checklist (Step 5 Reveal) */}
              {journeyStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  {[
                    { title: 'Request Submitted', delay: 0 },
                    { title: 'Request Recorded', delay: 0.18 },
                    { title: 'Notification Sent', delay: 0.36 }
                  ].map((item, idx) => (
                    <motion.div
                      key={`status-badge-${idx}`}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: item.delay, duration: 0.25 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        color: '#0F172A',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        padding: '6px 16px',
                        borderRadius: '50px'
                      }}
                    >
                      <span style={{ color: '#10B981', fontWeight: '900', fontSize: '13.5px' }}>✓</span>
                      <span>{item.title}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: REQUEST RECEIVED ALONGSIDE REAL REQUEST ID (e.g. REQ-2026-XXXX) */}
          {/* ========================================================================= */}
          {journeyStep === 6 && (
            <motion.div
              key="step-6-final-reveal"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#0F172A',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px'
                }}
              >
                REQUEST RECEIVED
              </h2>

              {/* REAL Request ID Badge */}
              <motion.div
                initial={{ scale: 0.88 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #0038FF 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '17px',
                  fontWeight: '800',
                  padding: '10px 28px',
                  borderRadius: '50px',
                  boxShadow: '0 8px 24px rgba(0, 56, 255, 0.35)',
                  marginBottom: '16px',
                  letterSpacing: '1px'
                }}
              >
                {requestId}
              </motion.div>

              <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.55 }}>
                Thank you{fullName ? `, ${fullName}` : ''}. Your support ticket is now live in our system and team notification emails have been dispatched.
              </p>

              {/* Email Dispatch Info Box */}
              <div
                style={{
                  background: '#F0F4FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  margin: '0 0 18px 0',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#1E293B'
                }}
              >
                <div style={{ fontWeight: '800', marginBottom: '4px', color: '#0038FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✉️</span> Email Routing Dispatched:
                </div>
                <div><strong>To:</strong> <code style={{ background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px', color: '#1E40AF' }}>peopleconnect@aionioncapital.com</code></div>
                <div style={{ marginTop: '2px' }}><strong>CC:</strong> <code style={{ background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px', color: '#1E40AF' }}>naveenkumar.k@aionioncapital.com</code></div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <AnimatedButton
                  type="button"
                  onClick={handleDone}
                  className="modal-btn"
                  style={{ flex: 1, padding: '13px 20px', fontSize: '14px', borderRadius: '50px', fontWeight: '800' }}
                >
                  Done
                </AnimatedButton>

                <AnimatedButton
                  type="button"
                  onClick={onReset}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '13px 20px', fontSize: '14px', borderRadius: '50px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: '700' }}
                >
                  Submit Another
                </AnimatedButton>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
