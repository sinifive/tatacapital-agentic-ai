import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveSession } from '../utils/sessionStorage'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState('form') // form | otp | success
  const [formData, setFormData] = useState({ name: '', pan: '', phone: '' })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const modalRef = useRef(null)
  const firstInputRef = useRef(null)
  const errorAnnouncementRef = useRef(null)

  // Validation patterns
  const patterns = {
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN: 5 letters, 4 digits, 1 letter (e.g., ABCD1234E)
    phone: /^[0-9]{10}$/, // 10 digit phone number
    name: /^[a-zA-Z\s]{3,50}$/, // Letters and spaces, 3-50 chars
  }

  // Keyboard trap: focus management in modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Validate individual field
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Full name is required'
        } else if (!patterns.name.test(value)) {
          newErrors.name = 'Name must be 3-50 characters (letters and spaces only)'
        } else {
          delete newErrors.name
        }
        break

      case 'pan':
        if (!value.trim()) {
          newErrors.pan = 'PAN is required'
        } else if (!patterns.pan.test(value.toUpperCase())) {
          newErrors.pan = 'Invalid PAN format (e.g., ABCD1234E)'
        } else {
          delete newErrors.pan
        }
        break

      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required'
        } else if (!patterns.phone.test(value)) {
          newErrors.phone = 'Phone must be 10 digits'
        } else {
          delete newErrors.phone
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error for this field as user types
    if (errors[name]) {
      validateField(name, value)
    }
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validate all fields
    let isValid = true
    isValid = validateField('name', formData.name) && isValid
    isValid = validateField('pan', formData.pan) && isValid
    isValid = validateField('phone', formData.phone) && isValid

    if (!isValid) {
      // Announce errors for accessibility
      if (errorAnnouncementRef.current) {
        errorAnnouncementRef.current.textContent = 'Please fix the validation errors'
      }
      return
    }

    // Proceed to OTP step
    setIsSubmitting(true)
    setStep('otp')
    setOtp('')

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    setErrors({})

    // Mock OTP verification (any 4 digits work, or simulate specific)
    if (otp.length !== 4 || isNaN(otp)) {
      const errorMsg = 'OTP must be 4 digits'
      setErrors({ otp: errorMsg })
      if (errorAnnouncementRef.current) {
        errorAnnouncementRef.current.textContent = errorMsg
      }
      return
    }

    // Mock verification
    setIsSubmitting(true)

    setTimeout(() => {
      // 90% success rate for demo
      if (Math.random() > 0.1 || otp === '1234') {
        const userData = {
          name: formData.name.trim(),
          pan: formData.pan.toUpperCase(),
          phone: formData.phone,
          id: `user-${Date.now()}`,
        }

        // Save session with localStorage
        saveSession(userData)
        setSuccessMessage(`Welcome, ${userData.name}!`)
        setStep('success')

        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }

        // Close modal after success
        setTimeout(() => {
          resetForm()
          onClose()
        }, 1500)
      } else {
        const errorMsg = 'Invalid OTP. Try again.'
        setErrors({ otp: errorMsg })
        if (errorAnnouncementRef.current) {
          errorAnnouncementRef.current.textContent = errorMsg
        }
      }
      setIsSubmitting(false)
    }, 800)
  }

  const resetForm = () => {
    setStep('form')
    setFormData({ name: '', pan: '', phone: '' })
    setOtp('')
    setErrors({})
    setSuccessMessage('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          ref={modalRef}
        >
          {/* Error announcement for screen readers */}
          <div
            ref={errorAnnouncementRef}
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          />

          {/* Modal Card */}
          <motion.div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {step === 'form' && 'Login to Tata Capital'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'success' && 'Login Successful'}
              </h2>
              {step !== 'success' && (
                <button
                  onClick={handleClose}
                  className="text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-tata-yellow rounded p-1"
                  aria-label="Close login modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Form Step */}
            {step === 'form' && (
              <motion.form
                onSubmit={handleSubmitForm}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow transition-all ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="John Doe"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <motion.p
                      id="name-error"
                      className="text-red-500 text-xs mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* PAN */}
                <div>
                  <label htmlFor="pan" className="block text-sm font-medium text-slate-700 mb-1">
                    PAN <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pan"
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={(e) => {
                      const uppercaseValue = e.target.value.toUpperCase()
                      setFormData({ ...formData, pan: uppercaseValue })
                      if (errors.pan) {
                        validateField('pan', uppercaseValue)
                      }
                    }}
                    onBlur={(e) => validateField('pan', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow transition-all ${
                      errors.pan ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="ABCD1234E"
                    maxLength="10"
                    aria-invalid={!!errors.pan}
                    aria-describedby={errors.pan ? 'pan-error' : undefined}
                  />
                  {errors.pan && (
                    <motion.p
                      id="pan-error"
                      className="text-red-500 text-xs mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.pan}
                    </motion.p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleInputChange(e)
                      }
                    }}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="9876543210"
                    maxLength="10"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <motion.p
                      id="phone-error"
                      className="text-red-500 text-xs mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-tata-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ backgroundColor: '#0a4fa0' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Processing...' : 'Get OTP'}
                </motion.button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Demo: Use any valid format. OTP will be sent to your phone.
                </p>
              </motion.form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <motion.form
                onSubmit={handleVerifyOtp}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm text-slate-600 mb-4">
                  Enter the 4-digit OTP sent to {formData.phone}
                </p>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-1">
                    OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) {
                        setOtp(e.target.value)
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-tata-yellow transition-all ${
                      errors.otp ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="0000"
                    maxLength="4"
                    inputMode="numeric"
                    aria-invalid={!!errors.otp}
                    aria-describedby={errors.otp ? 'otp-error' : undefined}
                    autoComplete="one-time-code"
                  />
                  {errors.otp && (
                    <motion.p
                      id="otp-error"
                      className="text-red-500 text-xs mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.otp}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || otp.length < 4}
                  className="w-full bg-tata-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ backgroundColor: '#0a4fa0' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full text-tata-blue py-2 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-tata-yellow rounded"
                >
                  Back to Form
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Demo OTP: Use any 4 digits (or 1234 for guaranteed success)
                </p>
              </motion.form>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{successMessage}</h3>
                <p className="text-slate-600">Your session is now active for 1 hour.</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
