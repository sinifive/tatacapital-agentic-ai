import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatWidget({ onApplyClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionMode, setSessionMode] = useState('ANSWERING') // ANSWERING or APPLYING
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hi! 👋 I\'m TIA, your Tata Capital AI assistant. Ask me anything about loans - eligibility, documents, interest rates, EMI calculations... Or, say "Apply Now" and I\'ll guide you through your application right here! What can I help with?',
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: null,
    pan: null,
    monthlySalary: null,
    loanAmount: null,
    tenure: null,
    purpose: null,
    documents: []
  })
  const [conversationHistory, setConversationHistory] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setConversationHistory((prev) => [...prev, { role: 'user', content: inputValue.trim() }])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: conversationHistory,
          sessionMode: sessionMode,
          formData: formData
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update session mode based on response
        if (data.mode === 'APPLYING' && sessionMode !== 'APPLYING') {
          setSessionMode('APPLYING')
        } else if (data.mode === 'COMPLETED') {
          setSessionMode('COMPLETED')
        }

        // Update form data if in applying mode
        if (data.formData) {
          setFormData(data.formData)
        }

        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setConversationHistory((prev) => [...prev, { role: 'assistant', content: data.reply }])

        // If form is complete, show success message and offer to submit
        if (data.mode === 'COMPLETED') {
          setTimeout(() => {
            const successMsg = {
              id: Date.now() + 2,
              role: 'assistant',
              content: '✅ Your loan application is complete! Click "Submit Application" below to proceed with verification.',
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, successMsg])
          }, 1000)
        }
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I couldn\'t process that. Please try again!',
          timestamp: new Date(),
          isError: true,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Connection issue. Please try again!',
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    'What documents do I need?',
    'How long is approval?',
    'What\'s the interest rate?',
    'Am I eligible?'
  ]

  const handleSuggestedQuestion = (question) => {
    setInputValue(question)
    setTimeout(() => {
      setInputValue('')
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setConversationHistory((prev) => [...prev, { role: 'user', content: question }])
      setIsLoading(true)

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          conversationHistory: conversationHistory,
          sessionMode: sessionMode,
          formData: formData
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: data.reply,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setConversationHistory((prev) => [...prev, { role: 'assistant', content: data.reply }])
          }
        })
        .catch(() => {
          const errorMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: 'Connection issue. Please try again!',
            timestamp: new Date(),
            isError: true,
          }
          setMessages((prev) => [...prev, errorMessage])
        })
        .finally(() => setIsLoading(false))
    }, 0)
  }

  const handleSubmitApplication = async () => {
    // Send form data to backend to create application
    const msg = {
      id: Date.now(),
      role: 'assistant',
      content: '🔄 Processing your application... This may take a moment.',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
    
    // Store form data and close chat - user will be redirected to application status
    localStorage.setItem('chatCollectedFormData', JSON.stringify(formData))
    
    setTimeout(() => {
      setIsOpen(false)
      onApplyClick()
    }, 2000)
  }

  return (
    <div className="fixed right-6 bottom-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col h-[550px] w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                  TIA
                </div>
                <div>
                  <h3 className="font-semibold text-sm">TIA - AI Assistant</h3>
                  <p className="text-xs text-blue-100">
                    {sessionMode === 'APPLYING' ? '📝 Application Mode' : 'Ready to Help'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-500 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                        : msg.isError
                        ? 'bg-red-100 text-red-800 rounded-bl-none border border-red-300'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3 rounded-bl-none shadow-sm">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (only in ANSWERING mode) */}
            {sessionMode === 'ANSWERING' && messages.length === 1 && !isLoading && (
              <motion.div
                className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-semibold text-slate-600 mb-2">Quick Questions</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs bg-white text-blue-600 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {sessionMode === 'COMPLETED' ? (
              <motion.div
                className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.button
                  onClick={handleSubmitApplication}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg font-bold text-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✅ Submit Application
                </motion.button>
              </motion.div>
            ) : sessionMode === 'APPLYING' ? (
              <motion.div
                className="px-4 py-3 border-t border-slate-200 bg-yellow-50 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-xs text-yellow-800 font-semibold">
                  📝 Just answer my questions to complete your application!
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.button
                  onClick={() => {
                    setInputValue('Apply now')
                    setTimeout(() => handleSendMessage(), 0)
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-bold text-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Now ✨
                </motion.button>
              </motion.div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={sessionMode === 'APPLYING' ? 'Answer here...' : 'Ask a question...'}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                  aria-label="Chat message input"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center font-bold text-2xl hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open chat"
          >
            <motion.span 
              animate={{ 
                y: [0, -6, 0],
                rotate: [0, 5, -5, 0]
              }} 
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                type: 'spring'
              }}
            >
              💬
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

