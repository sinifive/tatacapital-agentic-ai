import { useEffect } from 'react'
import './ChatWindow.css'

export default function ChatWindow({ messages, messagesEndRef }) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="chat-empty">
          <div className="empty-content">
            <h2>Welcome to Tata Capital</h2>
            <p>Start your loan application journey</p>
            <ul className="tips">
              <li>📋 Fill in your loan details</li>
              <li>📄 Upload your salary slip</li>
              <li>✅ Get instant approval decision</li>
              <li>📥 Download your sanction letter</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.sender}`}>
              <div className="message-bubble">
                <p className="message-text">{msg.text}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
