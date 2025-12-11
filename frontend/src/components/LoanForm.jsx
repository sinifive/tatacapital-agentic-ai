import { useState } from 'react'
import './LoanForm.css'

export default function LoanForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    loanAmount: '',
    tenure: '',
    loanPurpose: 'home'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'loanAmount' || name === 'tenure' ? parseFloat(value) || '' : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.loanAmount && formData.tenure) {
      onSubmit(formData)
      setFormData({
        loanAmount: '',
        tenure: '',
        loanPurpose: 'home'
      })
    }
  }

  return (
    <form className="loan-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Loan Details</h3>

      <div className="form-group">
        <label htmlFor="loanAmount">Loan Amount (₹)</label>
        <input
          id="loanAmount"
          type="number"
          name="loanAmount"
          value={formData.loanAmount}
          onChange={handleChange}
          placeholder="Enter loan amount"
          min="100000"
          step="50000"
          className="form-input"
        />
        {formData.loanAmount && (
          <span className="input-hint">₹{formData.loanAmount.toLocaleString()}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="tenure">Tenure (months)</label>
        <input
          id="tenure"
          type="number"
          name="tenure"
          value={formData.tenure}
          onChange={handleChange}
          placeholder="Enter tenure in months"
          min="6"
          max="360"
          step="6"
          className="form-input"
        />
        {formData.tenure && (
          <span className="input-hint">{(formData.tenure / 12).toFixed(1)} years</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="loanPurpose">Loan Purpose</label>
        <select
          id="loanPurpose"
          name="loanPurpose"
          value={formData.loanPurpose}
          onChange={handleChange}
          className="form-input"
        >
          <option value="home">Home Loan</option>
          <option value="personal">Personal Loan</option>
          <option value="business">Business Loan</option>
          <option value="education">Education Loan</option>
          <option value="auto">Auto Loan</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!formData.loanAmount || !formData.tenure}
        className="btn btn-primary btn-block"
      >
        Get Pre-Approval
      </button>
    </form>
  )
}
