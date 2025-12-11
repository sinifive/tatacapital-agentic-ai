import { useRef, useState } from 'react'
import './SalaryUploadForm.css'

export default function SalaryUploadForm({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or image file (PNG, JPG)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    onUpload(file)
    setUploadProgress(0)
  }

  return (
    <div className="salary-form">
      <h3 className="form-title">Upload Salary Slip</h3>

      <div
        className={`upload-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={loading}
        />

        <div className="upload-content">
          <div className="upload-icon">📄</div>
          <p className="upload-text">
            {loading ? 'Uploading...' : 'Drag & drop your salary slip here'}
          </p>
          <p className="upload-hint">or click to browse (PDF, PNG, JPG - Max 5MB)</p>
        </div>
      </div>

      {loading && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <p className="upload-note">
        ✅ Your file is secure and used only for verification
      </p>
    </div>
  )
}
