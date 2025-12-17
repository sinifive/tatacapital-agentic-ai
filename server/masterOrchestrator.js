// Master Orchestration Engine - State Machine for Loan Application Workflow
import { SessionManager } from './sessionManager.js'

// State transitions and validations
export const StateTransitions = {
  START: {
    next: 'SALES',
    description: 'Application started',
    handler: 'initiateSales',
  },
  SALES: {
    next: 'VERIFY',
    description: 'Sales inquiry completed, moving to verification',
    handler: 'initiateVerification',
  },
  VERIFY: {
    next: ['UNDERWRITE', 'CLOSED'],
    description: 'Document verification stage',
    handler: 'processVerification',
  },
  UNDERWRITE: {
    next: ['SANCTION', 'MANUAL_REVIEW'],
    description: 'Underwriting and credit assessment',
    handler: 'processUnderwriting',
  },
  SANCTION: {
    next: ['CLOSED', 'MANUAL_REVIEW'],
    description: 'Loan sanction and PDF generation',
    handler: 'processSanction',
  },
  MANUAL_REVIEW: {
    next: ['SANCTION', 'CLOSED'],
    description: 'Manual review by loan officer',
    handler: 'reviewManually',
  },
  CLOSED: {
    next: null,
    description: 'Application closed',
    handler: null,
  },
}

export class MasterOrchestrator {
  constructor() {
    this.sessions = new Map()
  }

  // Start new application session
  startSession(sessionId, applicantData) {
    try {
      // Check if session already exists
      let session = SessionManager.getSession(sessionId)
      if (!session) {
        session = SessionManager.createSession(sessionId)
      }

      const manager = new SessionManager(sessionId)

      // Try to acquire lock
      if (!manager.acquireLock()) {
        return {
          success: false,
          error: 'Session is locked. Another operation in progress.',
          sessionId,
        }
      }

      // Set initial user data
      manager.setUserData({
        ...applicantData,
        startedAt: new Date().toISOString(),
      })

      manager.addAuditEvent('session_started', {
        applicant: applicantData.applicant_name || 'Unknown',
      })

      const sessionData = manager.getSessionData()
      manager.releaseLock()

      return {
        success: true,
        sessionId,
        state: 'START',
        message: 'Application session started successfully',
        session: sessionData,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        sessionId,
      }
    }
  }

  // Get session status
  getSessionStatus(sessionId) {
    const session = SessionManager.getSession(sessionId)
    if (!session) {
      return {
        success: false,
        error: 'Session not found',
        sessionId,
      }
    }

    return {
      success: true,
      sessionId,
      state: session.state,
      locked: session.locked,
      userData: session.userData,
      verificationResult: session.verificationResult,
      underwritingResult: session.underwritingResult,
      sanctionResult: session.sanctionResult,
      manualReviewQueued: session.manualReviewQueue,
      auditLog: session.auditLog,
      timestamp: new Date().toISOString(),
    }
  }

  // Progress session to next stage with callbacks
  async progressSession(sessionId, stageData, callbacks) {
    const manager = new SessionManager(sessionId)
    const session = SessionManager.getSession(sessionId)

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
        sessionId,
      }
    }

    // Acquire lock to prevent overlapping operations
    if (!manager.acquireLock()) {
      return {
        success: false,
        error: 'Session is locked. Another operation in progress.',
        sessionId,
        state: session.state,
      }
    }

    try {
      const currentState = session.state
      let nextState

      // Determine next state based on current stage and callback result
      switch (currentState) {
        case 'START':
          nextState = 'SALES'
          manager.addAuditEvent('sales_initiated', stageData)
          break

        case 'SALES':
          nextState = 'VERIFY'
          manager.setUserData(stageData.user_profile || {})
          manager.addAuditEvent('verify_initiated', { pan: stageData.user_profile?.pan })
          break

        case 'VERIFY':
          // Call verification callback
          if (callbacks?.verificationCallback) {
            const verifyResult = await callbacks.verificationCallback(sessionId, stageData)
            manager.setVerificationResult(verifyResult)

            if (verifyResult.status === 'PASS') {
              nextState = 'UNDERWRITE'
              manager.addAuditEvent('verification_passed', {
                confidence: verifyResult.confidence,
              })
            } else {
              // Verification failed - close application
              nextState = 'CLOSED'
              manager.addAuditEvent('verification_failed', {
                reason: verifyResult.reason,
              })
              manager.releaseLock()
              return {
                success: false,
                error: 'Verification failed',
                sessionId,
                state: nextState,
                details: verifyResult,
              }
            }
          }
          break

        case 'UNDERWRITE':
          // Call underwriting callback
          if (callbacks?.underwritingCallback) {
            const underwriteResult = await callbacks.underwritingCallback(
              sessionId,
              stageData
            )
            manager.setUnderwritingResult(underwriteResult)

            if (underwriteResult.status === 'APPROVED') {
              nextState = 'SANCTION'
              manager.addAuditEvent('underwriting_approved', {
                decision: underwriteResult.decision,
              })
            } else {
              // Queue for manual review
              manager.recordFailure('UNDERWRITE')
              nextState = 'MANUAL_REVIEW'
              manager.queueForManualReview(
                `Underwriting decision: ${underwriteResult.decision}`
              )
              manager.addAuditEvent('underwriting_rejected', {
                decision: underwriteResult.decision,
                queued_for_manual_review: true,
              })
            }
          }
          break

        case 'SANCTION':
          // Call sanction callback with retry logic
          if (callbacks?.sanctionCallback) {
            let sanctionResult = null
            let sanctionSuccess = false

            for (let attempt = 1; attempt <= 2; attempt++) {
              sanctionResult = await callbacks.sanctionCallback(sessionId, stageData)

              if (sanctionResult.success) {
                manager.setSanctionResult(sanctionResult)
                nextState = 'CLOSED'
                manager.addAuditEvent('sanction_successful', {
                  attempt,
                  pdfUrl: sanctionResult.download_url,
                })
                sanctionSuccess = true
                break
              } else {
                manager.recordFailure('SANCTION')
                manager.addAuditEvent('sanction_failed', {
                  attempt,
                  error: sanctionResult.error,
                })

                if (attempt === 2) {
                  // After 2 retries, queue for manual review
                  nextState = 'MANUAL_REVIEW'
                  manager.queueForManualReview(
                    `Sanction failed after ${attempt} attempts: ${sanctionResult.error}`
                  )
                }
              }
            }

            if (!sanctionSuccess && manager.getFailureCount('SANCTION') >= 2) {
              manager.releaseLock()
              return {
                success: false,
                error: 'Sanction failed after retries, queued for manual review',
                sessionId,
                state: nextState,
                details: sanctionResult,
              }
            }
          }
          break

        case 'MANUAL_REVIEW':
          // Manual review decision
          const decision = stageData.decision // 'approve' or 'reject'
          if (decision === 'approve') {
            nextState = 'SANCTION'
            manager.addAuditEvent('manual_review_approved', {
              reviewedBy: stageData.reviewedBy,
              notes: stageData.notes,
            })
          } else {
            nextState = 'CLOSED'
            manager.addAuditEvent('manual_review_rejected', {
              reviewedBy: stageData.reviewedBy,
              reason: stageData.reason,
            })
          }
          break

        default:
          manager.releaseLock()
          return {
            success: false,
            error: `Cannot progress from state: ${currentState}`,
            sessionId,
            state: currentState,
          }
      }

      // Execute state transition
      manager.setState(nextState)
      const updatedSession = manager.getSessionData()

      manager.releaseLock()

      return {
        success: true,
        sessionId,
        previousState: currentState,
        newState: nextState,
        message: `Progressed from ${currentState} to ${nextState}`,
        session: updatedSession,
      }
    } catch (error) {
      manager.releaseLock()
      return {
        success: false,
        error: error.message,
        sessionId,
        state: session.state,
      }
    }
  }

  // Get all sessions (for dashboard/monitoring)
  getAllSessions() {
    return SessionManager.listSessions()
  }

  // Get sessions in manual review queue
  getManualReviewQueue() {
    return SessionManager.listSessions().filter((s) => s.manualReviewQueue)
  }

  // Get sessions by state
  getSessionsByState(state) {
    return SessionManager.listSessions().filter((s) => s.state === state)
  }

  // Get workflow statistics
  getWorkflowStats() {
    const allSessions = SessionManager.listSessions()
    const stats = {
      totalSessions: allSessions.length,
      byState: {},
      manualReviewCount: 0,
      failureCount: 0,
      closedCount: 0,
    }

    allSessions.forEach((session) => {
      // Count by state
      stats.byState[session.state] = (stats.byState[session.state] || 0) + 1

      // Count manual reviews
      if (session.manualReviewQueue) {
        stats.manualReviewCount++
      }

      // Count failures
      Object.values(session.failureCount).forEach((count) => {
        stats.failureCount += count
      })

      // Count closed
      if (session.state === 'CLOSED') {
        stats.closedCount++
      }
    })

    return stats
  }
}

// Create singleton instance
export const masterOrchestrator = new MasterOrchestrator()
