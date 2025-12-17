// Chat API wrapper - sends messages to /api/chat endpoint

/**
 * Sanitize user message to prevent prompt injection
 */
export const sanitizeMessage = (message) => {
  if (typeof message !== 'string') return ''
  return message
    .trim()
    .slice(0, 500)
    .replace(/[<>{}]/g, '')
    .replace(/\n\n+/g, '\n')
}

/**
 * Send chat message to backend
 */
export const sendChatMessage = async (message) => {
  try {
    const sanitized = sanitizeMessage(message)

    if (!sanitized) {
      throw new Error('Message cannot be empty')
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: sanitized })
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Chat API error')
    }

    return {
      success: true,
      reply: data.reply || '',
    }
  } catch (error) {
    console.error('Chat error:', error)
    return {
      success: false,
      reply: null,
      error: error.message || 'Failed to get response. Please try again.',
    }
  }
}

/**
 * Format timestamp for display
 */
export const formatChatTimestamp = (date) => {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

