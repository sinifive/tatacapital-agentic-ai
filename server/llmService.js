// LLM Service wrapper with strict prompt templates and validation

/**
 * Response types allowed from LLM
 */
const ALLOWED_RESPONSE_TYPES = {
  GREET: 'greeting',
  ASK_DOCS: 'ask_for_documents',
  OFFER_TERMS: 'offer_loan_terms',
  REQUEST_UPLOAD: 'request_document_upload',
  APPLY_NOW: 'encourage_application',
}

/**
 * Build strict system prompt for LLM
 */
const buildSystemPrompt = () => {
  return `You are TIA, Tata Capital's AI loan assistant. You MUST respond ONLY as JSON with this exact schema:
{
  "type": "${Object.values(ALLOWED_RESPONSE_TYPES).join('|')}",
  "message": "string (max 100 chars)",
  "confidence": 0.0-1.0,
  "action": "apply_now" | null
}

STRICT RULES:
1. Only respond in valid JSON, nothing else
2. "type" must be one of: ${Object.values(ALLOWED_RESPONSE_TYPES).join(', ')}
3. "message" must be professional and max 100 characters
4. Use "action": "apply_now" ONLY if user shows intent to apply
5. NEVER discuss topics outside loans/Tata Capital
6. NEVER return sensitive user data in message

If user asks something outside scope, use type: "greeting" with redirect message.
Temperature: 0.0 (deterministic)
Max tokens: 150`
}

/**
 * Schema for validating LLM response
 */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    type: {
      enum: Object.values(ALLOWED_RESPONSE_TYPES),
    },
    message: {
      type: 'string',
      maxLength: 100,
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    action: {
      enum: ['apply_now', null],
    },
  },
  required: ['type', 'message', 'confidence'],
}

/**
 * Redact PII from text for logging
 */
const redactPII = (text) => {
  if (!text) return ''

  return text
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, '[PAN]') // PAN
    .replace(/\b[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\b/g, '[CARD]') // Card number
    .replace(/\b[0-9]{10}\b/g, '[PHONE]') // Phone
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email
    .replace(/\b[0-9]{12}\b/g, '[AADHAAR]') // Aadhaar
}

/**
 * Validate LLM response against schema
 */
const validateLLMResponse = (response) => {
  try {
    const parsed = typeof response === 'string' ? JSON.parse(response) : response

    // Check required fields
    if (!parsed.type || !parsed.message || parsed.confidence === undefined) {
      return { valid: false, error: 'Missing required fields' }
    }

    // Validate type
    if (!Object.values(ALLOWED_RESPONSE_TYPES).includes(parsed.type)) {
      return { valid: false, error: `Invalid type: ${parsed.type}` }
    }

    // Validate message length
    if (parsed.message.length > 100) {
      return { valid: false, error: 'Message exceeds 100 chars' }
    }

    // Validate confidence
    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      return { valid: false, error: 'Invalid confidence value' }
    }

    // Validate action if present
    if (parsed.action && !['apply_now', null].includes(parsed.action)) {
      return { valid: false, error: 'Invalid action' }
    }

    return { valid: true, data: parsed }
  } catch (error) {
    return { valid: false, error: `Parse error: ${error.message}` }
  }
}

/**
 * Safe fallback responses
 */
const FALLBACK_RESPONSES = {
  parse_error: {
    type: 'greeting',
    message: 'I had trouble understanding. Can you rephrase your question?',
    confidence: 0.5,
    action: null,
  },
  invalid_schema: {
    type: 'greeting',
    message: 'Let me help you with your loan inquiry. What would you like to know?',
    confidence: 0.5,
    action: null,
  },
  api_error: {
    type: 'greeting',
    message: 'I\'m temporarily unavailable. Please try again in a moment.',
    confidence: 0.3,
    action: null,
  },
  out_of_scope: {
    type: 'greeting',
    message: 'I can only help with loan-related questions. Want to apply now?',
    confidence: 0.7,
    action: null,
  },
}

/**
 * Create audit log entry (with PII redaction)
 */
const createAuditLog = (sessionId, userMessage, llmResponse, isValid) => {
  return {
    timestamp: new Date().toISOString(),
    sessionId,
    userMessageRedacted: redactPII(userMessage),
    llmResponseType: llmResponse?.type || 'error',
    isValid,
    confidence: llmResponse?.confidence || null,
  }
}

export {
  buildSystemPrompt,
  ALLOWED_RESPONSE_TYPES,
  RESPONSE_SCHEMA,
  validateLLMResponse,
  FALLBACK_RESPONSES,
  redactPII,
  createAuditLog,
}
