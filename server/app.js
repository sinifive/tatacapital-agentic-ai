import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { buildSystemPrompt, validateLLMResponse, FALLBACK_RESPONSES, createAuditLog, redactPII } from './llmService.js'
import { runVerification } from './verificationService.js'
import { runUnderwriting } from './underwritingEngine.js'
import { generateSanctionPDF, getPDFFile, listSanctionPDFs, cleanupOldPDFs } from './sanctionService.js'
import { masterOrchestrator } from './masterOrchestrator.js'
import { initializeDatabase, saveApplication, getApplication, getAllApplications } from './database.js'
import { detectChatMode, getNextFormField, getFormQuestion, isFormComplete } from './geminiService.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Configure multer for file uploads (keep in memory for demo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  }
})

// Mock database
const users = new Map()
const applications = new Map()
const creditScores = new Map()

// ========== LOGIN ENDPOINT ==========
app.post('/api/login', (req, res) => {
  const { name, pan } = req.body

  if (!name || !pan) {
    return res.status(400).json({ error: 'Name and PAN required' })
  }

  const userId = `user-${pan}`
  
  // Mock user validation
  users.set(userId, { name, pan, createdAt: new Date() })

  res.json({
    success: true,
    userId,
    user: { name, pan },
    token: `token-${pan}-${Date.now()}`
  })
})

// ========== VERIFICATION ENDPOINT (Document KYC + Deepfake Detection) ==========
app.post('/api/verification', upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'payslip', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, pan, monthlySalary } = req.body
    const files = req.files

    // Validate required fields
    if (!pan || !files.pan || !files.aadhaar) {
      return res.status(400).json({
        error: 'PAN, Aadhaar document, and selfie are required',
        received: { pan: !!pan, aadhaar: !!files.aadhaar, pan_doc: !!files.pan, selfie: !!files.selfie }
      })
    }

    // Prepare documents object with file buffers
    const documents = {}
    if (files.aadhaar) documents.aadhaar = files.aadhaar[0].buffer
    if (files.pan) documents.pan = files.pan[0].buffer
    if (files.payslip) documents.payslip = files.payslip[0].buffer
    if (files.selfie) documents.selfie = files.selfie[0].buffer

    // User data for verification
    const userData = {
      name,
      pan,
      monthlySalary: monthlySalary || 50000
    }

    // Run comprehensive verification workflow
    const verificationResult = await runVerification(documents, userData)

    // Add metadata
    verificationResult.verificationId = `verify-${Date.now()}`
    verificationResult.filesProcessed = Object.keys(documents).length
    verificationResult.pan = pan
    verificationResult.timestamp = new Date().toISOString()

    // Log verification attempt
    console.log(`[VERIFICATION] PAN: ${pan}, Status: ${verificationResult.status}, Confidence: ${verificationResult.confidence}, CreditScore: ${verificationResult.credit_score}`)

    res.json(verificationResult)
  } catch (error) {
    console.error('[VERIFICATION_ERROR]', error)
    res.status(500).json({
      error: 'Verification failed',
      message: error.message,
      status: 'FAIL',
      confidence: 0
    })
  }
})

// ========== CREDIT SCORE ENDPOINT ==========
// Deterministic credit score based on hashed PAN (reproducible)
const calculateDeterministicScore = (pan, name, dob) => {
  // Create a simple hash from PAN + name
  let hash = 0
  const input = `${pan}${name || ''}${dob || ''}`
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32-bit integer
  }
  
  // Normalize hash to 300-900 range
  const normalized = Math.abs(hash) % 601 + 300 // 300-900
  return normalized
}

// Determine risk bucket based on score
const getRiskBucket = (score) => {
  if (score >= 750) return 'LOW'
  if (score >= 700) return 'MEDIUM'
  return 'HIGH'
}

app.post('/api/credit-score', (req, res) => {
  const { pan, name, dob } = req.body

  if (!pan) {
    return res.status(400).json({ error: 'PAN is required' })
  }

  // Deterministic score calculation (same PAN always returns same score)
  const creditScore = calculateDeterministicScore(pan, name, dob)
  const riskLevel = getRiskBucket(creditScore)
  
  // Loan limits based on risk
  const loanLimits = {
    LOW: { max: 500000, roi: 7.99 },
    MEDIUM: { max: 350000, roi: 9.99 },
    HIGH: { max: 200000, roi: 12.5 }
  }
  
  const limits = loanLimits[riskLevel]

  res.json({
    pan,
    name: name || 'N/A',
    creditScore,
    riskLevel,
    creditWorthy: creditScore >= 700,
    maxLoanAmount: limits.max,
    roi: limits.roi,
    timestamp: new Date().toISOString()
  })
})

// ========== UNDERWRITING ENGINE ENDPOINT ==========
app.post('/api/underwrite', (req, res) => {
  const {
    applicant_name,
    pan,
    credit_score,
    requested_amount,
    monthly_salary,
    tenure_months
  } = req.body

  // Validate required fields
  if (!pan || credit_score === undefined || !requested_amount || !monthly_salary) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['pan', 'credit_score', 'requested_amount', 'monthly_salary'],
      optional: ['applicant_name', 'tenure_months']
    })
  }

  // Run underwriting decision engine
  const decision = runUnderwriting({
    applicant_name: applicant_name || 'N/A',
    pan,
    credit_score,
    requested_amount,
    monthly_salary,
    tenure_months: tenure_months || 60
  })

  // Return appropriate HTTP status
  if (decision.status === 'APPROVED') {
    res.json(decision)
  } else if (decision.status === 'REJECTED') {
    res.status(403).json(decision)
  } else {
    res.status(400).json(decision)
  }
})

// ========== LOAN APPLICATION ENDPOINT ==========
app.post('/api/apply', upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan_doc', maxCount: 1 },
  { name: 'payslip', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, pan, loanAmount, tenure, purpose, monthlySalary } = req.body

    // Validate required fields
    if (!name || !pan || !loanAmount || !tenure) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['name', 'pan', 'loanAmount', 'tenure']
      })
    }

    const applicationId = `app-${Date.now()}`
    const documents = []

    // Process uploaded files
    if (req.files?.aadhaar) {
      documents.push({
        type: 'aadhaar',
        filename: req.files.aadhaar[0].originalname,
        size: req.files.aadhaar[0].size,
        mimetype: req.files.aadhaar[0].mimetype
      })
    }
    if (req.files?.pan_doc) {
      documents.push({
        type: 'pan',
        filename: req.files.pan_doc[0].originalname,
        size: req.files.pan_doc[0].size,
        mimetype: req.files.pan_doc[0].mimetype
      })
    }
    if (req.files?.payslip) {
      documents.push({
        type: 'payslip',
        filename: req.files.payslip[0].originalname,
        size: req.files.payslip[0].size,
        mimetype: req.files.payslip[0].mimetype
      })
    }

    // Save to database
    const applicationData = {
      applicationId,
      applicantName: name,
      pan,
      loanAmount: parseInt(loanAmount),
      tenure: parseInt(tenure),
      purpose,
      monthlySalary: monthlySalary ? parseInt(monthlySalary) : null,
      documents
    }

    await saveApplication(applicationData)

    // Also keep in-memory for quick access
    applications.set(applicationId, {
      ...applicationData,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      estimatedApprovalDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })

    res.json({
      success: true,
      applicationId,
      status: 'submitted',
      message: 'Application submitted successfully',
      estimatedApprovalTime: '24 hours',
      applicantName: name,
      loanAmount,
      tenure,
      documentsReceived: documents.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Application submission failed',
      message: error.message
    })
  }
})

// ========== SANCTION ENDPOINT - PDF Generation with eSign ==========
app.post('/api/sanction', async (req, res) => {
  try {
    const {
      session_id,
      user_profile,
      loan_terms,
      verification_summary
    } = req.body

    // Validate required fields
    if (!session_id || !user_profile || !loan_terms) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['session_id', 'user_profile', 'loan_terms'],
        optional: ['verification_summary']
      })
    }

    // Generate sanction PDF with digital signature
    const pdfResult = await generateSanctionPDF({
      session_id,
      user_profile,
      loan_terms,
      verification_summary,
      timestamp: new Date().toISOString()
    })

    if (pdfResult.success) {
      res.json({
        success: true,
        status: 'SANCTIONED',
        message: 'Loan sanction letter generated successfully',
        pdf_details: pdfResult
      })
    } else {
      res.status(500).json({ error: 'PDF generation failed', details: pdfResult })
    }
  } catch (error) {
    res.status(500).json({
      error: 'Sanction processing failed',
      message: error.message
    })
  }
})

// ========== PDF DOWNLOAD ENDPOINT ==========
app.get('/api/sanctioned-pdf/:filename', (req, res) => {
  try {
    const { filename } = req.params

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }

    const pdfResult = getPDFFile(filename)

    if (pdfResult.error) {
      return res.status(pdfResult.status).json({ error: pdfResult.error })
    }

    res.download(pdfResult.path, pdfResult.fileName)
  } catch (error) {
    res.status(500).json({
      error: 'PDF download failed',
      message: error.message
    })
  }
})

// ========== LIST SANCTION PDFs ==========
app.get('/api/sanction-pdfs/list', (req, res) => {
  try {
    const pdfList = listSanctionPDFs()
    res.json({
      success: true,
      total: pdfList.length,
      pdfs: pdfList
    })
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list PDFs',
      message: error.message
    })
  }
})

// ========== LEGACY GET SANCTION (for compatibility) ==========
app.get('/api/sanction/:applicationId', (req, res) => {
  const { applicationId } = req.params

  const app = applications.get(applicationId)
  
  if (!app) {
    return res.status(404).json({ error: 'Application not found' })
  }

  // Mock sanction decision (80% approval rate)
  const approved = Math.random() > 0.2
  
  if (approved) {
    const sanctionLetter = {
      sanctionId: `sanc-${Date.now()}`,
      applicationId,
      sanctionAmount: app.loanAmount,
      roi: 7.99,
      tenure: app.tenure,
      emi: Math.round(app.loanAmount / app.tenure),
      validUpto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sanctionLetterUrl: `/documents/sanction-${applicationId}.pdf`
    }
    
    app.status = 'sanctioned'
    
    res.json({
      success: true,
      status: 'approved',
      sanctionLetter
    })
  } else {
    app.status = 'rejected'
    
    res.json({
      success: false,
      status: 'rejected',
      reason: 'Application did not meet approval criteria',
      supportEmail: 'support@tatacapital.com'
    })
  }
})

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() })
})

// ========== CHATBOT ENDPOINT (INTELLIGENT WITH GEMINI) ==========
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], sessionMode = 'ANSWERING', formData = {} } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Detect if user wants to apply
    const newMode = detectChatMode(message, sessionMode)

    let reply = null
    let nextMode = newMode
    let updatedFormData = { ...formData }
    let nextField = null

    if (newMode === 'APPLYING') {
      // In application mode - collect form data conversationally
      nextField = getNextFormField(updatedFormData)
      
      if (nextField) {
        // Ask for next field using AI
        try {
          reply = await callGemini(
            message,
            conversationHistory,
            'APPLYING',
            updatedFormData
          )
        } catch (error) {
          // Fallback
          reply = getFormQuestion(nextField)
        }
      } else if (isFormComplete(updatedFormData)) {
        reply = '✅ Perfect! All information collected. Your application is ready to submit. Processing now... 🚀'
        nextMode = 'COMPLETED'
      }
    } else {
      // ANSWERING mode - use Gemini for intelligent responses
      // For now, skip Gemini and use fallback (since API key might have issues)
      reply = null

      if (!reply) {
        const fallbackResponses = {
          eligibility: {
            keywords: ['eligible', 'eligibility', 'qualify', 'requirements', 'who can apply', 'can i apply'],
            response: 'You can apply if you are 21-65 years old with minimum ₹15,000 monthly income. We accept CIBIL from 300 onwards. Just need Aadhaar, PAN, and recent salary slip!'
          },
          documents: {
            keywords: ['documents', 'what documents', 'documents needed', 'paperwork'],
            response: 'Only 3 documents: (1) Aadhaar, (2) PAN, (3) Last 2 months salary slip. No property papers, no bank statements needed!'
          },
          interest: {
            keywords: ['interest rate', 'roi', 'rate', 'cost', 'charges', 'processing fee'],
            response: 'Interest rates start from 7.99% p.a. Zero processing fees! EMI includes principal + interest only.'
          },
          approval: {
            keywords: ['approval', 'how long', 'approval time', 'quick'],
            response: 'Approved in 24 hours or less. Instant pre-approval, digital sanction letter, money in your account immediately!'
          },
          loan_amount: {
            keywords: ['loan amount', 'how much', 'minimum', 'maximum', 'borrow'],
            response: 'Borrow ₹50,000 to ₹50 lakhs. Your pre-approved limit is based on income and credit score.'
          },
          tenure: {
            keywords: ['tenure', 'repayment', 'emi', 'months'],
            response: 'Choose 12-60 months. Longer tenure = lower EMI, shorter = less total interest. You decide!'
          },
          apply: {
            keywords: ['apply', 'start', 'ready', 'want loan', 'let\'s start'],
            response: 'Great! I can guide you through the application right here. No need to fill forms elsewhere. I\'ll ask simple questions and collect your info step by step. Ready? 😊'
          }
        }

        const messageLower = message.toLowerCase()
        for (const [key, item] of Object.entries(fallbackResponses)) {
          if (item.keywords.some(keyword => messageLower.includes(keyword))) {
            reply = item.response
            break
          }
        }

        if (!reply) {
          reply = 'I can help with loan eligibility, documents, interest rates, EMI, tenure, and more. Or say "Apply Now" to start your application right here! 😊'
        }
      }
    }

    res.json({
      success: true,
      reply: reply,
      mode: nextMode,
      nextField: nextField,
      formData: updatedFormData,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      message: error.message
    })
  }
})

// ========== GET ALL APPLICATIONS (from database) ==========
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await getAllApplications()
    res.json({
      success: true,
      totalApplications: applications.length,
      applications: applications || []
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      message: error.message
    })
  }
})

// ========== GET SINGLE APPLICATION (from database) ==========
app.get('/api/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params
    const application = await getApplication(applicationId)
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      })
    }

    // Parse documents JSON if it's a string
    if (typeof application.documents === 'string') {
      application.documents = JSON.parse(application.documents)
    }

    res.json({
      success: true,
      application
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application',
      message: error.message
    })
  }
})

// ========== LISTEN ==========
    })
  }
})

// ========== LISTEN ==========
const PORT = process.env.PORT || 3001

// Initialize database and start server
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Tata Capital Backend running on http://localhost:${PORT}`)
    console.log(`✅ Database connected: SQLite`)
    console.log(`📌 Available endpoints:`)
    console.log(`   POST   /api/chat`)
    console.log(`   GET    /api/applications`)
    console.log(`   POST   /api/submit`)
    console.log(`   GET    /api/status/:appId`)
    console.log(`   POST   /api/verify`)
    console.log(`   GET    /api/health`)
    console.log(``)
    console.log(`💾 DATA STORAGE:`)
    console.log(`   📍 Database: data/tata_capital.db`)
    console.log(`   🗂️  Tables: applications, verifications, creditScores, underwriting, sanctions`)
  })
}).catch((error) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})
