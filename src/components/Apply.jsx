import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { getSession } from '../utils/sessionStorage'
import ApplicationStatus from './ApplicationStatus'
import {
  validateFile,
  formatFileSize,
  processFileForUpload,
  getFileExtension,
} from '../utils/fileHandling'

export default function Apply({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    loanAmount: '',
    tenure: '',
    purpose: 'personal',
    monthlySalary: '',
  })

  const [uploads, setUploads] = useState({
    aadhaar: null,
    pan: null,
    payslip: null,
  })

  const [uploadErrors, setUploadErrors] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [dragActive, setDragActive] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // null | loading | success | error
  const [submitMessage, setSubmitMessage] = useState('')
  const [applicationId, setApplicationId] = useState(null)
  const [showApplicationStatus, setShowApplicationStatus] = useState(false)

  const fileInputRefs = {
    aadhaar: useRef(null),
    pan: useRef(null),
    payslip: useRef(null),
  }

  const loanPurposes = [
    { value: 'personal', label: 'Personal Use' },
    { value: 'vehicle', label: 'Vehicle Purchase' },
    { value: 'home', label: 'Home Improvement' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ]

  // Pre-fill from localStorage on mount
  useEffect(() => {
    const session = getSession()
    if (session) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name,
        pan: session.user.pan,
      }))
    }
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  // Validate form fields
  const validateFormFields = () => {
    const errors = {}

    if (!formData.loanAmount || isNaN(formData.loanAmount) || formData.loanAmount <= 0) {
      errors.loanAmount = 'Valid loan amount required'
    }
    if (!formData.tenure || isNaN(formData.tenure) || formData.tenure <= 0) {
      errors.tenure = 'Valid tenure (months) required'
    }
    if (!formData.monthlySalary || isNaN(formData.monthlySalary) || formData.monthlySalary <= 0) {
      errors.monthlySalary = 'Valid monthly salary required'
    }
    if (!uploads.aadhaar) {
      errors.uploadAadhaar = 'Aadhaar document required'
    }
    if (!uploads.pan) {
      errors.uploadPan = 'PAN document required'
    }
    if (!uploads.payslip) {
      errors.uploadPayslip = 'Payslip document required'
    }

    return errors
  }

  // Handle file drop
  const handleDrag = (e, docType) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(docType)
    } else if (e.type === 'dragleave') {
      setDragActive(null)
    }
  }

  // Handle file drop
  const handleDrop = (e, docType) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0], docType)
    }
  }

  // Handle file input change
  const handleFileChange = (e, docType) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], docType)
    }
  }

  // Process selected file
  const handleFileSelect = async (file, docType) => {
    setUploadErrors((prev) => {
      const updated = { ...prev }
      delete updated[docType]
      return updated
    })

    try {
      const result = await processFileForUpload(file)

      if (!result.success) {
        setUploadErrors((prev) => ({
          ...prev,
          [docType]: result.errors[0],
        }))
        return
      }

      // Store file with metadata
      setUploads((prev) => ({
        ...prev,
        [docType]: {
          file: result.file,
          name: file.name,
          size: result.file.size,
          type: result.file.type,
          originalSize: file.size,
          compressed: file.size !== result.file.size,
        },
      }))
    } catch (error) {
      setUploadErrors((prev) => ({
        ...prev,
        [docType]: 'Error processing file',
      }))
    }
  }

  // Remove uploaded file
  const removeFile = (docType) => {
    setUploads((prev) => ({
      ...prev,
      [docType]: null,
    }))
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateFormFields()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('loading')
    setSubmitMessage('Processing your application...')

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('pan', formData.pan)
      formDataToSend.append('loanAmount', formData.loanAmount)
      formDataToSend.append('tenure', formData.tenure)
      formDataToSend.append('purpose', formData.purpose)
      formDataToSend.append('monthlySalary', formData.monthlySalary)

      // Add files
      if (uploads.aadhaar) {
        formDataToSend.append('aadhaar', uploads.aadhaar.file, uploads.aadhaar.name)
      }
      if (uploads.pan) {
        formDataToSend.append('pan_doc', uploads.pan.file, uploads.pan.name)
      }
      if (uploads.payslip) {
        formDataToSend.append('payslip', uploads.payslip.file, uploads.payslip.name)
      }

      // Submit to backend
      const response = await axios.post('/api/apply', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setApplicationId(response.data.applicationId)
      setSubmitStatus('success')
      setSubmitMessage(`✓ Application submitted! ID: ${response.data.applicationId}`)

      // Show application status after 2 seconds
      setTimeout(() => {
        setShowApplicationStatus(true)
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(
        error.response?.data?.message || 'Failed to submit application. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show application status if submission was successful
  if (showApplicationStatus && applicationId) {
    return (
      <ApplicationStatus 
        applicationId={applicationId}
        onBack={() => {
          setShowApplicationStatus(false)
          setApplicationId(null)
          setSubmitStatus(null)
          onNavigate && onNavigate('home')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 sm:p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Loan Application</h1>
            <p className="text-slate-600">Complete the form below to apply for a personal loan</p>
          </div>

          {submitStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 ${
                submitStatus === 'success'
                  ? 'bg-green-50 text-green-800'
                  : submitStatus === 'error'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-blue-800'
              }`}
              role="status"
              aria-live="polite"
            >
              {submitMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info Section */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="pan" className="block text-sm font-medium text-slate-700 mb-1">
                    PAN
                  </label>
                  <input
                    id="pan"
                    type="text"
                    name="pan"
                    value={formData.pan}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Loan Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Loan Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="loanAmount" className="block text-sm font-medium text-slate-700 mb-1">
                    Desired Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loanAmount"
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    placeholder="2,50,000"
                    min="50000"
                    max="5000000"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow ${
                      formErrors.loanAmount ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    aria-invalid={!!formErrors.loanAmount}
                  />
                  {formErrors.loanAmount && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.loanAmount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tenure" className="block text-sm font-medium text-slate-700 mb-1">
                    Tenure (Months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tenure"
                    type="number"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleInputChange}
                    placeholder="24"
                    min="6"
                    max="60"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow ${
                      formErrors.tenure ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    aria-invalid={!!formErrors.tenure}
                  />
                  {formErrors.tenure && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.tenure}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-1">
                    Loan Purpose <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow"
                  >
                    {loanPurposes.map((purpose) => (
                      <option key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="monthlySalary" className="block text-sm font-medium text-slate-700 mb-1">
                    Monthly Net Salary (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="monthlySalary"
                    type="number"
                    name="monthlySalary"
                    value={formData.monthlySalary}
                    onChange={handleInputChange}
                    placeholder="50,000"
                    min="10000"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-yellow ${
                      formErrors.monthlySalary ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    aria-invalid={!!formErrors.monthlySalary}
                  />
                  {formErrors.monthlySalary && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.monthlySalary}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Required Documents</h2>
              <div className="space-y-4">
                {/* Aadhaar Upload */}
                <DocumentUpload
                  docType="aadhaar"
                  label="Aadhaar Card"
                  fileRef={fileInputRefs.aadhaar}
                  upload={uploads.aadhaar}
                  error={uploadErrors.aadhaar || formErrors.uploadAadhaar}
                  dragActive={dragActive === 'aadhaar'}
                  onDragEnter={(e) => handleDrag(e, 'aadhaar')}
                  onDragLeave={(e) => handleDrag(e, 'aadhaar')}
                  onDragOver={(e) => handleDrag(e, 'aadhaar')}
                  onDrop={(e) => handleDrop(e, 'aadhaar')}
                  onChange={(e) => handleFileChange(e, 'aadhaar')}
                  onRemove={() => removeFile('aadhaar')}
                />

                {/* PAN Upload */}
                <DocumentUpload
                  docType="pan"
                  label="PAN Document"
                  fileRef={fileInputRefs.pan}
                  upload={uploads.pan}
                  error={uploadErrors.pan || formErrors.uploadPan}
                  dragActive={dragActive === 'pan'}
                  onDragEnter={(e) => handleDrag(e, 'pan')}
                  onDragLeave={(e) => handleDrag(e, 'pan')}
                  onDragOver={(e) => handleDrag(e, 'pan')}
                  onDrop={(e) => handleDrop(e, 'pan')}
                  onChange={(e) => handleFileChange(e, 'pan')}
                  onRemove={() => removeFile('pan')}
                />

                {/* Payslip Upload */}
                <DocumentUpload
                  docType="payslip"
                  label="Latest Payslip"
                  fileRef={fileInputRefs.payslip}
                  upload={uploads.payslip}
                  error={uploadErrors.payslip || formErrors.uploadPayslip}
                  dragActive={dragActive === 'payslip'}
                  onDragEnter={(e) => handleDrag(e, 'payslip')}
                  onDragLeave={(e) => handleDrag(e, 'payslip')}
                  onDragOver={(e) => handleDrag(e, 'payslip')}
                  onDrop={(e) => handleDrop(e, 'payslip')}
                  onChange={(e) => handleFileChange(e, 'payslip')}
                  onRemove={() => removeFile('payslip')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || submitStatus === 'loading'}
              className="w-full bg-tata-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-tata-yellow focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={{ backgroundColor: '#0a4fa0' }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

// Document Upload Component
function DocumentUpload({
  docType,
  label,
  fileRef,
  upload,
  error,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onChange,
  onRemove,
}) {
  const getFileIcon = (type) => {
    if (type.includes('pdf')) {
      return '📄'
    }
    return '🖼️'
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      {!upload ? (
        <motion.div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-tata-yellow bg-yellow-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 hover:border-tata-blue'
          }`}
          onClick={() => fileRef.current?.click()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg
            className={`w-8 h-8 mx-auto mb-2 ${
              dragActive ? 'text-tata-yellow' : error ? 'text-red-400' : 'text-slate-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-sm font-medium text-slate-700">
            Drop files here or <span className="text-tata-blue underline">click to browse</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 5MB</p>

          <input
            ref={fileRef}
            type="file"
            onChange={onChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            aria-label={`Upload ${label}`}
          />
        </motion.div>
      ) : (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getFileIcon(upload.type)}</span>
              <div>
                <p className="font-medium text-slate-900 truncate max-w-xs">{upload.name}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {formatFileSize(upload.size)}
                  {upload.compressed && (
                    <span className="ml-2 bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">
                      Compressed {Math.round((1 - upload.size / upload.originalSize) * 100)}%
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 font-semibold"
              aria-label={`Remove ${label}`}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.p
          className="text-red-500 text-xs mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
