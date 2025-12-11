import React, { useState, useEffect } from 'react'

const DevPanel = ({ isOpen, onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
    }
  }, [isOpen])

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch from mock_services (prototypes) or backend
      const response = await fetch('http://localhost:8000/mock/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (err) {
      setError(err.message)
      console.error('DevPanel fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="dev-panel-overlay" onClick={onClose}>
      <div className="dev-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dev-panel-header">
          <h3>🔧 DEV: Synthetic Customers</h3>
          <button className="dev-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="dev-panel-body">
          {loading && <div className="dev-loading">Loading customers...</div>}
          {error && <div className="dev-error">Error: {error}</div>}

          {!loading && !error && customers.length === 0 && (
            <div className="dev-empty">No customers found</div>
          )}

          {!loading && customers.length > 0 && (
            <div className="dev-customers-grid">
              {customers.map((customer) => (
                <div key={customer.customer_id} className="dev-customer-card">
                  <div className="dev-customer-info">
                    <div className="dev-customer-name">{customer.name}</div>
                    <div className="dev-customer-city">{customer.city}</div>
                    <div className="dev-customer-meta">
                      <span className="dev-credit-score">
                        💳 {customer.credit_score}
                      </span>
                      <span className="dev-pre-approved">
                        💰 ₹{(customer.pre_approved / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                  <button
                    className="dev-select-btn"
                    onClick={() => onSelectCustomer(customer)}
                  >
                    Select & Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dev-panel-footer">
          <small>💡 Select a customer to pre-fill KYC and jump flow to loan form</small>
        </div>
      </div>
    </div>
  )
}

export default DevPanel
