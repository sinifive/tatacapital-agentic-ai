import './ActionButtons.css'

export default function ActionButtons({ onStartFlow, onDownloadSanction, loading }) {
  return (
    <div className="action-buttons">
      <button
        onClick={onStartFlow}
        disabled={loading}
        className="btn btn-primary btn-action"
      >
        <span className="btn-icon">🚀</span>
        Start Loan Flow
      </button>
      <button
        onClick={onDownloadSanction}
        disabled={loading}
        className="btn btn-success btn-action"
      >
        <span className="btn-icon">📥</span>
        Download Sanction
      </button>
    </div>
  )
}
