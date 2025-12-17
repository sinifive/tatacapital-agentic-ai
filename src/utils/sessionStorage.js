// Session management utilities with localStorage

const SESSION_KEY = 'tata_capital_session'
const SESSION_EXPIRY_TIME = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Save user session to localStorage with expiry timestamp
 */
export const saveSession = (userData) => {
  const session = {
    user: userData,
    timestamp: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY_TIME,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

/**
 * Retrieve session from localStorage if valid (not expired)
 */
export const getSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) return null

    const session = JSON.parse(sessionData)
    const now = Date.now()

    // Check if session has expired
    if (now > session.expiresAt) {
      clearSession()
      return null
    }

    return session
  } catch (error) {
    console.error('Error reading session:', error)
    clearSession()
    return null
  }
}

/**
 * Check if user has a valid active session
 */
export const isSessionValid = () => {
  return getSession() !== null
}

/**
 * Clear session from localStorage
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Get remaining time in session (in minutes)
 */
export const getSessionRemainingTime = () => {
  const session = getSession()
  if (!session) return 0

  const remaining = session.expiresAt - Date.now()
  return Math.ceil(remaining / (60 * 1000)) // Convert to minutes
}

/**
 * Extend session expiry time
 */
export const extendSession = () => {
  const session = getSession()
  if (session) {
    session.expiresAt = Date.now() + SESSION_EXPIRY_TIME
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  }
  return null
}
