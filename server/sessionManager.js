// Session State Manager with locking mechanism

const sessions = new Map()

export class SessionManager {
  constructor(sessionId) {
    this.sessionId = sessionId
    this.data = {
      sessionId,
      state: 'START',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locked: false,
      lockAcquiredAt: null,
      auditLog: [],
      failureCount: {},
      userData: {},
      verificationResult: null,
      underwritingResult: null,
      sanctionResult: null,
      manualReviewQueue: false,
      manualReviewReason: null,
    }
    sessions.set(sessionId, this.data)
  }

  static getSession(sessionId) {
    return sessions.get(sessionId)
  }

  static createSession(sessionId) {
    if (sessions.has(sessionId)) {
      return new SessionManager(sessionId)
    }
    return new SessionManager(sessionId)
  }

  static listSessions() {
    return Array.from(sessions.values())
  }

  // Acquire lock for exclusive access
  acquireLock(timeoutMs = 30000) {
    if (this.data.locked) {
      const lockAge = Date.now() - new Date(this.data.lockAcquiredAt).getTime()
      if (lockAge > timeoutMs) {
        // Force release if lock is stale
        this.releaseLock()
      } else {
        return false // Lock held
      }
    }

    this.data.locked = true
    this.data.lockAcquiredAt = new Date().toISOString()
    return true
  }

  releaseLock() {
    this.data.locked = false
    this.data.lockAcquiredAt = null
  }

  isLocked() {
    return this.data.locked
  }

  // State management
  getState() {
    return this.data.state
  }

  setState(newState) {
    this.data.state = newState
    this.data.updatedAt = new Date().toISOString()
  }

  // Valid state transitions
  canTransitionTo(nextState) {
    const transitions = {
      START: ['SALES'],
      SALES: ['VERIFY'],
      VERIFY: ['UNDERWRITE', 'CLOSED'],
      UNDERWRITE: ['SANCTION', 'MANUAL_REVIEW'],
      SANCTION: ['CLOSED', 'MANUAL_REVIEW'],
      MANUAL_REVIEW: ['SANCTION', 'CLOSED'],
      CLOSED: [],
    }

    const currentState = this.data.state
    return transitions[currentState]?.includes(nextState) || false
  }

  transitionTo(nextState) {
    if (!this.canTransitionTo(nextState)) {
      return {
        success: false,
        error: `Cannot transition from ${this.data.state} to ${nextState}`,
      }
    }

    this.setState(nextState)
    this.addAuditEvent('state_transition', {
      fromState: this.data.state,
      toState: nextState,
    })

    return { success: true, newState: nextState }
  }

  // Audit logging
  addAuditEvent(eventType, details = {}) {
    this.data.auditLog.push({
      timestamp: new Date().toISOString(),
      eventType,
      details,
      state: this.data.state,
    })
  }

  getAuditLog() {
    return this.data.auditLog
  }

  // User data management
  setUserData(data) {
    this.data.userData = { ...this.data.userData, ...data }
    this.addAuditEvent('user_data_updated', { keys: Object.keys(data) })
  }

  getUserData() {
    return this.data.userData
  }

  // Verification result
  setVerificationResult(result) {
    this.data.verificationResult = result
    this.addAuditEvent('verification_completed', {
      status: result.status,
      confidence: result.confidence,
    })
  }

  getVerificationResult() {
    return this.data.verificationResult
  }

  // Underwriting result
  setUnderwritingResult(result) {
    this.data.underwritingResult = result
    this.addAuditEvent('underwriting_completed', {
      status: result.status,
      decision: result.decision,
    })
  }

  getUnderwritingResult() {
    return this.data.underwritingResult
  }

  // Sanction result
  setSanctionResult(result) {
    this.data.sanctionResult = result
    this.addAuditEvent('sanction_completed', {
      status: result.status,
      pdfUrl: result.download_url,
    })
  }

  getSanctionResult() {
    return this.data.sanctionResult
  }

  // Failure tracking
  recordFailure(stage) {
    if (!this.data.failureCount[stage]) {
      this.data.failureCount[stage] = 0
    }
    this.data.failureCount[stage]++
    this.addAuditEvent('stage_failure', { stage, attemptCount: this.data.failureCount[stage] })
  }

  getFailureCount(stage) {
    return this.data.failureCount[stage] || 0
  }

  // Manual review
  queueForManualReview(reason) {
    this.data.manualReviewQueue = true
    this.data.manualReviewReason = reason
    this.setState('MANUAL_REVIEW')
    this.addAuditEvent('manual_review_queued', { reason })
  }

  isInManualReview() {
    return this.data.manualReviewQueue
  }

  getManualReviewReason() {
    return this.data.manualReviewReason
  }

  // Get full session state
  getSessionData() {
    return {
      ...this.data,
      locked: this.data.locked,
      failureLog: Object.entries(this.data.failureCount).map(([stage, count]) => ({
        stage,
        failureCount: count,
      })),
    }
  }
}
