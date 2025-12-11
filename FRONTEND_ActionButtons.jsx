import React from 'react';
import './ActionButtons.css';

function ActionButtons({ onStartFlow, onDownloadSanction, loading }) {
  return (
    <div className="action-buttons">
      <button
        className="btn btn-success"
        onClick={onStartFlow}
        disabled={loading}
      >
        {loading ? '🔄 Processing...' : '▶ Start Loan Flow'}
      </button>
      
      <button
        className="btn btn-info"
        onClick={onDownloadSanction}
        disabled={loading}
      >
        {loading ? '⏳ Please wait...' : '📥 Download Sanction'}
      </button>
    </div>
  );
}

export default ActionButtons;
