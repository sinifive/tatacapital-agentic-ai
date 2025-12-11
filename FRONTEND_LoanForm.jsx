import React, { useState } from 'react';
import './LoanForm.css';

function LoanForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    loanAmount: 500000,
    tenure: 60,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="loan-form" onSubmit={handleSubmit}>
      <h3>Loan Details</h3>
      
      <div className="form-group">
        <label htmlFor="loanAmount">Loan Amount (₹)</label>
        <input
          type="number"
          id="loanAmount"
          name="loanAmount"
          value={formData.loanAmount}
          onChange={handleChange}
          min="100000"
          step="100000"
          required
        />
        <span className="form-hint">
          {(formData.loanAmount / 100000).toFixed(1)} lakhs
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="tenure">Tenure (months)</label>
        <select
          id="tenure"
          name="tenure"
          value={formData.tenure}
          onChange={handleChange}
          required
        >
          <option value={12}>12 months (1 year)</option>
          <option value={24}>24 months (2 years)</option>
          <option value={36}>36 months (3 years)</option>
          <option value={48}>48 months (4 years)</option>
          <option value={60}>60 months (5 years)</option>
          <option value={84}>84 months (7 years)</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        Check Loan Eligibility
      </button>
    </form>
  );
}

export default LoanForm;
