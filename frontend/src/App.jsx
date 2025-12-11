import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ChatWindow from './components/ChatWindow'
import LoanForm from './components/LoanForm'
import SalaryUploadForm from './components/SalaryUploadForm'
import ActionButtons from './components/ActionButtons'
import DevPanel from './components/DevPanel'
import { v4 as uuidv4 } from 'uuid'

const BACKEND_URL = 'http://localhost:8000'

export default function App() {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [loanData, setLoanData] = useState(null)
  const [salaryFileId, setSalaryFileId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [underwritingProgress, setUnderwritingProgress] = useState(false)
  const [flowStage, setFlowStage] = useState('welcome') // welcome, form, upload, underwriting, complete
  const [devPanelOpen, setDevPanelOpen] = useState(false)
  const messagesEndRef = useRef(null)

  // Initialize session on app start
  useEffect(() => {
    if (!sessionId) {
      initializeSession()
    }
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeSession = async () => {
    const newSessionId = uuidv4()
    setSessionId(newSessionId)

    try {
      setLoading(true)
      // Start session with MasterAgent
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        user_message: 'START_SESSION',
        session_id: newSessionId
      })

      setSessionActive(true)
      setFlowStage('form')

      // Add welcome message from agent
      const welcomeMessage = {
        id: Date.now(),
        text: response.data.response || 'Welcome to Tata Capital! Let\'s get started with your loan application.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Session initialization error:', error)
      const errorMessage = {
        id: Date.now(),
        text: 'Error starting session. Please refresh the page.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (text) => {
    if (!text.trim() || !sessionActive) return

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }
    setMessages(prev => [...prev, userMessage])

    try {
      setLoading(true)
      
      // Send to MasterAgent
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        user_message: text,
        session_id: sessionId
      })

      // Parse agent response
      const agentResponse = response.data.response || 'I understand. How can I help you further?'
      
      // Detect flow stage from agent response
      let nextStage = flowStage
      let messageType = 'text'

      if (agentResponse.toLowerCase().includes('upload') || agentResponse.toLowerCase().includes('salary')) {
        nextStage = 'upload'
        messageType = 'upload_request'
      } else if (agentResponse.toLowerCase().includes('checking') || agentResponse.toLowerCase().includes('verifying')) {
        nextStage = 'underwriting'
        messageType = 'text'
      } else if (agentResponse.toLowerCase().includes('approved') || agentResponse.toLowerCase().includes('congratulations')) {
        nextStage = 'complete'
        messageType = 'success'
      }

      setFlowStage(nextStage)

      // Add agent response message
      const botMessage = {
        id: Date.now() + 1,
        text: agentResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: messageType
      }
      setMessages(prev => [...prev, botMessage])

      // If agent asks for upload, trigger underwriting simulation
      if (nextStage === 'upload') {
        // Brief pause before underwriting message
        setTimeout(() => {
          setUnderwritingProgress(true)
        }, 1000)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleStartLoanFlow = () => {
    if (sessionActive) {
      sendMessage('I want to apply for a loan')
    }
  }

  const handleLoanFormSubmit = (formData) => {
    setLoanData(formData)
    const message = `I want to apply for a loan of ₹${formData.loanAmount.toLocaleString()} for ${formData.purpose} over ${formData.tenure} months`
    sendMessage(message)
    setFlowStage('upload')
  }

  const handleSalaryUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      setUnderwritingProgress(true)
      
      // Add upload initiated message
      const uploadMessage = {
        id: Date.now(),
        text: '📤 Uploading salary document...',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, uploadMessage])

      // Upload file
      const response = await axios.post(
        `${BACKEND_URL}/mock/upload_salary?session_id=${sessionId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setSalaryFileId(response.data.file_id)

      // Show underwriting progress
      const progressMessage = {
        id: Date.now() + 1,
        text: '🔄 Running underwriting checks...',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, progressMessage])

      // Simulate underwriting process (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Show salary details
      const salaryMessage = {
        id: Date.now() + 2,
        text: `✅ Salary verified!\n💰 Monthly: ₹${response.data.monthly_salary?.toLocaleString()}\n📊 Annual: ₹${response.data.annual_salary?.toLocaleString()}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, salaryMessage])

      // Get sanction letter decision from agent
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const sanctionResponse = await axios.post(`${BACKEND_URL}/chat`, {
        user_message: 'PROCEED_SANCTION',
        session_id: sessionId
      })

      const sanctionMessage = {
        id: Date.now() + 3,
        text: sanctionResponse.data.response || '🎉 Congratulations! Your loan has been approved. You can now download your sanction letter.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'success'
      }
      setMessages(prev => [...prev, sanctionMessage])

      setFlowStage('complete')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = {
        id: Date.now(),
        text: '❌ Error uploading salary document. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setUnderwritingProgress(false)
    }
  }

  const handleDownloadSanction = async () => {
    if (!sessionId) {
      alert('No active session. Please start a loan flow first.')
      return
    }

    try {
      setLoading(true)
      
      const downloadMessage = {
        id: Date.now(),
        text: '📥 Downloading your sanction letter...',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, downloadMessage])

      const response = await axios.get(
        `${BACKEND_URL}/sanction/${sessionId}`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `sanction_letter_${sessionId.substring(0, 8)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      const successMessage = {
        id: Date.now() + 1,
        text: '✅ Sanction letter downloaded successfully! Your loan is approved and ready to proceed.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'success'
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = {
        id: Date.now(),
        text: '❌ Error downloading sanction letter. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustomer = (customer) => {
    // Pre-fill loan form with a suggested amount based on pre-approved limit
    const suggestedAmount = customer.pre_approved * 0.8 // 80% of pre-approved
    setLoanData({
      loanAmount: suggestedAmount,
      purpose: 'Personal Needs',
      tenure: 36
    })

    // Jump flow to form stage with customer context
    const kycMessage = {
      id: Date.now(),
      text: `✅ KYC Verified: ${customer.name} from ${customer.city}\n💳 Credit Score: ${customer.credit_score}\n💰 Pre-approved: ₹${(customer.pre_approved / 100000).toFixed(1)}L`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
    setMessages(prev => [...prev, kycMessage])

    // Add pre-filled form message
    const formMessage = {
      id: Date.now() + 1,
      text: `Great! I've pre-filled your loan form based on your profile. You can request up to ₹${(suggestedAmount / 100000).toFixed(1)}L. Feel free to adjust as needed.`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
    setMessages(prev => [...prev, formMessage])

    setFlowStage('form')
    setDevPanelOpen(false)
  }

  const handleDownloadSanction = async () => {
    if (!sessionId) {
      alert('No active session. Please start a loan flow first.')
      return
    }

    try {
      setLoading(true)
      
      const downloadMessage = {
        id: Date.now(),
        text: '📥 Downloading your sanction letter...',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, downloadMessage])

      const response = await axios.get(
        `${BACKEND_URL}/sanction/${sessionId}`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `sanction_letter_${sessionId.substring(0, 8)}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      const successMessage = {
        id: Date.now() + 1,
        text: '✅ Sanction letter downloaded successfully! Your loan is approved and ready to proceed.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'success'
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = {
        id: Date.now(),
        text: '❌ Error downloading sanction letter. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏦 Tata Capital</h1>
          <p>AI-Powered Loan Origination System</p>
        </div>
        <div className="header-right">
          {sessionId && <div className="session-badge">Session: {sessionId.substring(0, 8)}...</div>}
          {sessionActive && <div className="status-badge active">● Active</div>}
          {underwritingProgress && <div className="status-badge loading">⟳ Underwriting...</div>}
          <button 
            className="btn btn-dev"
            onClick={() => setDevPanelOpen(!devPanelOpen)}
            title="Open dev panel to select synthetic customers"
          >
            🔧 Customers
          </button>
        </div>
      </header>

      {underwritingProgress && (
        <div className="progress-bar">
          <div className="progress-fill"></div>
          <span className="progress-text">Running underwriting checks...</span>
        </div>
      )}

      <div className="app-content">
        <div className="chat-section">
          <ChatWindow messages={messages} messagesEndRef={messagesEndRef} />
          <div className="message-input">
            <input
              type="text"
              placeholder={sessionActive ? "Type your message here..." : "Initializing session..."}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading && sessionActive) {
                  sendMessage(e.target.value)
                  e.target.value = ''
                }
              }}
              disabled={loading || !sessionActive}
              className="input-field"
            />
            <button
              onClick={(e) => {
                const input = e.target.parentNode.querySelector('.input-field')
                if (input.value.trim() && !loading && sessionActive) {
                  sendMessage(input.value)
                  input.value = ''
                }
              }}
              disabled={loading || !sessionActive}
              className="btn btn-primary"
            >
              {loading ? '⟳ Sending...' : 'Send'}
            </button>
          </div>
        </div>

        <div className="forms-section">
          <div className="flow-indicator">
            <span className={`stage ${flowStage === 'form' ? 'active' : ''}`}>1. Form</span>
            <span className="divider">→</span>
            <span className={`stage ${flowStage === 'upload' ? 'active' : ''}`}>2. Upload</span>
            <span className="divider">→</span>
            <span className={`stage ${flowStage === 'complete' ? 'active' : ''}`}>3. Complete</span>
          </div>

          {sessionActive ? (
            <>
              <ActionButtons
                onStartFlow={handleStartLoanFlow}
                onDownloadSanction={handleDownloadSanction}
                loading={loading}
              />
              {(flowStage === 'form' || flowStage === 'welcome') && (
                <LoanForm onSubmit={handleLoanFormSubmit} />
              )}
              {(flowStage === 'upload' || flowStage === 'complete') && (
                <SalaryUploadForm onUpload={handleSalaryUpload} loading={loading} />
              )}
            </>
          ) : (
            <div className="initializing">
              <div className="spinner"></div>
              <p>Initializing session...</p>
            </div>
          )}
        </div>
      </div>

      <DevPanel 
        isOpen={devPanelOpen} 
        onClose={() => setDevPanelOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </div>
  )
}
