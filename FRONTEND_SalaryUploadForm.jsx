import React, { useState } from 'react';
import './SalaryUploadForm.css';

function SalaryUploadForm({ onUpload, loading }) {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, PNG, and JPEG files are allowed');
        return;
      }
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <form className="salary-upload-form">
      <h3>Upload Salary Slip</h3>
      
      <div className="upload-area">
        <input
          type="file"
          id="salaryFile"
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg"
          disabled={loading}
          style={{ display: 'none' }}
        />
        <label htmlFor="salaryFile" className="upload-label">
          {loading ? (
            <span className="uploading">Uploading...</span>
          ) : fileName ? (
            <span className="file-name">✓ {fileName}</span>
          ) : (
            <>
              <span className="upload-icon">📄</span>
              <span className="upload-text">Click to upload salary slip</span>
              <span className="upload-hint">PDF, PNG, or JPEG (max 5MB)</span>
            </>
          )}
        </label>
      </div>
    </form>
  );
}

export default SalaryUploadForm;
