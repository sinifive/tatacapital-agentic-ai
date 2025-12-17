// Gemini API Integration for Intelligent Chatbot
// Uses Google's Gemini API with Tata Capital context

const GEMINI_API_KEY = "AIzaSyBpR4KlyiFtP7L_S1avdHji971sqI_EcXE"
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

// Tata Capital Knowledge Base - injected into every prompt
const TATA_CAPITAL_CONTEXT = `
You are TIA (Tata Capital AI Assistant), an intelligent chatbot for Tata Capital's loan application system.

IMPORTANT TATA CAPITAL INFORMATION:
- Interest rates: Starting from 7.99% p.a. (varies by credit score and risk profile)
- Loan amount: ₹50,000 to ₹50 lakhs
- Tenure: 12 to 60 months
- Processing fee: ZERO (no hidden charges)
- Approval time: 24 hours or less
- Documents needed: Only 3 - Aadhaar, PAN, and salary slip (last 2 months)
- Eligible: Salaried employees, self-employed, business owners, freelancers
- CIBIL: Minimum 300 (even low scores can qualify)
- KYC: AI-powered verification with deepfake detection, liveness check, document OCR
- Application: 100% online - no branch visits needed
- Disbursement: Direct to bank account within 24 hours
- EMI calculation: Based on loan amount × interest rate × tenure
- Pre-approved limit: Determined after instant credit check
- Self-employed: Needs ITR (last 2 years) + business bank statements

APPLICATION FORM FIELDS (to collect during application):
1. Full Name (required)
2. PAN (required, 10 digits)
3. Monthly Salary (required, numeric)
4. Loan Amount (required, ₹50K to ₹50L)
5. Tenure (required, 12-60 months)
6. Loan Purpose (required, select from: Personal, Education, Travel, Home Improvement, etc.)
7. Documents: Aadhaar, PAN, Salary Slip (required uploads)

CONVERSATION RULES:
- Keep responses concise and helpful (2-3 sentences max)
- For Tata Capital questions, use the context above
- For general questions, answer naturally but redirect to Tata Capital context when relevant
- When user is ready to apply, collect form fields conversationally (one at a time)
- Be friendly, encouraging, and professional
- Avoid technical jargon

CURRENT CHAT MODE: {MODE}
{FORM_DATA}
`

/**
 * Build system prompt with current context
 */
function buildSystemPrompt(mode = 'ANSWERING', formData = {}) {
  let prompt = TATA_CAPITAL_CONTEXT.replace('{MODE}', mode)
  
  if (mode === 'APPLYING' && Object.keys(formData).length > 0) {
    const collected = Object.entries(formData)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    
    prompt = prompt.replace(
      '{FORM_DATA}',
      `Already collected:\n${collected}\n\nNext, ask for the missing field.`
    )
  } else {
    prompt = prompt.replace('{FORM_DATA}', '')
  }
  
  return prompt
}

/**
 * Call Gemini API
 */
export async function callGemini(userMessage, conversationHistory = [], mode = 'ANSWERING', formData = {}) {
  try {
    // If no API key, fall back to rule-based responses
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      console.warn('⚠️  Gemini API key not set. Using fallback responses.')
      return null
    }

    console.log('🤖 Calling Gemini API with mode:', mode)

    const systemPrompt = buildSystemPrompt(mode, formData)
    
    // Format conversation history for Gemini
    const contents = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ]

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.9,
        }
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error('❌ Gemini API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      console.error('❌ No response from Gemini')
      return null
    }

    console.log('✅ Gemini response received')
    return reply
  } catch (error) {
    console.error('❌ Gemini API call failed:', error.message)
    return null
  }
}

/**
 * Detect chat mode based on user input
 */
export function detectChatMode(userMessage, currentMode) {
  const message = userMessage.toLowerCase()
  
  // Keywords for switching to application mode
  if (
    message.includes('apply') || 
    message.includes('ready') || 
    message.includes('start loan') ||
    message.includes('fill form') ||
    message.includes('want loan') ||
    message.includes('let\'s start')
  ) {
    return 'APPLYING'
  }
  
  return currentMode || 'ANSWERING'
}

/**
 * Extract form data from conversation
 * This is called periodically to parse extracted information
 */
export function parseFormDataFromContext(conversationHistory) {
  // In real scenario, you'd use Gemini to extract structured data
  // For now, return template for extraction
  return {
    name: null,
    pan: null,
    monthlySalary: null,
    loanAmount: null,
    tenure: null,
    purpose: null,
    documents: []
  }
}

/**
 * Validate if form is complete
 */
export function isFormComplete(formData) {
  return (
    formData.name &&
    formData.pan &&
    formData.monthlySalary &&
    formData.loanAmount &&
    formData.tenure &&
    formData.purpose &&
    formData.documents?.length >= 3
  )
}

/**
 * Get next form field to ask for
 */
export function getNextFormField(formData) {
  if (!formData.name) return 'name'
  if (!formData.pan) return 'pan'
  if (!formData.monthlySalary) return 'monthlySalary'
  if (!formData.loanAmount) return 'loanAmount'
  if (!formData.tenure) return 'tenure'
  if (!formData.purpose) return 'purpose'
  if (!formData.documents || formData.documents.length < 3) return 'documents'
  return null
}

/**
 * Generate next question for form collection
 */
export function getFormQuestion(fieldName) {
  const questions = {
    name: 'What is your full name?',
    pan: 'What is your PAN (10-digit number)?',
    monthlySalary: 'What is your monthly salary (in ₹)?',
    loanAmount: 'How much would you like to borrow? (₹50K to ₹50L)',
    tenure: 'How many months to repay? (12-60 months. Longer tenure = lower monthly EMI)',
    purpose: 'What\'s the loan purpose? (Personal, Education, Travel, Home Improvement, etc.)',
    documents: 'Please upload 3 documents: (1) Aadhaar scan, (2) PAN scan, (3) Latest salary slip'
  }
  return questions[fieldName] || 'Tell me more'
}
