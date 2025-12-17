// Document verification and KYC simulation service

/**
 * OCR text extraction stub (no external dependencies)
 * In production, use tesseract.js or AWS Textract
 */
const extractOCRText = async (fileName, fileBuffer) => {
  return new Promise((resolve) => {
    // Simulate OCR processing delay
    setTimeout(() => {
      // Mock OCR results based on document type
      const mockResults = {
        aadhaar: {
          extracted: 'AADHAAR 1234 5678 9101',
          fields: {
            number: '1234567890',
            name: 'JOHN DOE',
            dob: '01/01/1990',
          },
        },
        pan: {
          extracted: 'PAN ABCD1234E',
          fields: {
            number: 'ABCD1234E',
            name: 'JOHN DOE',
            fathername: 'PARENT NAME',
          },
        },
        payslip: {
          extracted: 'MONTHLY SALARY RS 50000',
          fields: {
            salary: '50000',
            deductions: '5000',
            netPayment: '45000',
            month: 'DECEMBER 2025',
          },
        },
      }

      const docType = fileName.toLowerCase().includes('aadhaar')
        ? 'aadhaar'
        : fileName.toLowerCase().includes('pan')
        ? 'pan'
        : 'payslip'

      resolve(mockResults[docType] || mockResults.payslip)
    }, 300)
  })
}

/**
 * Validate document format using regex
 */
const validateDocumentFormat = (docType, extractedText) => {
  const patterns = {
    aadhaar: {
      pattern: /\b[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\b/,
      message: 'Valid Aadhaar format',
    },
    pan: {
      pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      message: 'Valid PAN format',
    },
    payslip: {
      pattern: /\d+/,
      message: 'Valid payslip detected',
    },
  }

  const validator = patterns[docType]
  if (!validator) return { valid: false, message: 'Unknown document type' }

  const isValid = validator.pattern.test(extractedText)
  return {
    valid: isValid,
    message: isValid ? validator.message : `Invalid ${docType} format`,
  }
}

/**
 * Generate simple image hash (perceptual hash simulation)
 * In production, use sharp or OpenCV for real image analysis
 */
const generateImageHash = (fileBuffer) => {
  // Simple hash based on file buffer
  let hash = 0
  for (let i = 0; i < fileBuffer.length; i++) {
    hash = ((hash << 5) - hash) + fileBuffer[i]
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Check image quality and run fake detection simulation
 */
const analyzeImageQuality = async (fileBuffer, fileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate image analysis
      const fileSize = fileBuffer.length
      const isReasonableSize = fileSize > 10000 && fileSize < 5000000 // Between 10KB and 5MB

      // Mock deepfake detection (90% confidence it's real for demo)
      const livenessScore = 0.85 + Math.random() * 0.1 // 0.85-0.95
      const fakeDetectionScore = 0.92 + Math.random() * 0.06 // 0.92-0.98

      resolve({
        fileSize,
        isValidSize: isReasonableSize,
        livenessScore,
        fakeDetectionScore,
        isLikelyGenuine: fakeDetectionScore > 0.8,
        hash: generateImageHash(fileBuffer),
      })
    }, 400)
  })
}

/**
 * Simulate liveness check (blink detection)
 * Returns confidence that image is a real person
 */
const checkLiveness = async (selfieBuffer) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate ML liveness detection
      const livenessScore = 0.78 + Math.random() * 0.15 // 0.78-0.93
      const hasEyeOpenness = Math.random() > 0.2 // 80% chance eyes detected
      const hasHeadMovement = Math.random() > 0.3 // 70% chance movement detected

      resolve({
        livenessScore,
        hasEyeOpenness,
        hasHeadMovement,
        isLive: livenessScore > 0.7 && hasEyeOpenness,
        status: livenessScore > 0.7 ? 'PASS' : livenessScore > 0.5 ? 'UNSURE' : 'FAIL',
      })
    }, 500)
  })
}

/**
 * Verify document details against extracted OCR
 */
const verifyDocumentDetails = (docType, extractedText, userProvidedData) => {
  const matches = {
    name: extractedText.toLowerCase().includes(userProvidedData.name?.toLowerCase() || ''),
    documentFormat: validateDocumentFormat(docType, extractedText).valid,
  }

  return {
    ...matches,
    overallMatch: Object.values(matches).filter((v) => v).length / Object.keys(matches).length,
  }
}

/**
 * Generate mock credit score based on income
 */
const calculateMockCreditScore = (monthlyIncome) => {
  const baseScore = 650
  const incomeMultiplier = Math.min(monthlyIncome / 50000, 1.5) // Cap at 1.5x
  const randomVariation = Math.random() * 100 - 50

  return Math.round(baseScore + incomeMultiplier * 100 + randomVariation)
}

/**
 * Main verification workflow
 */
export const runVerification = async (documents, userData) => {
  try {
    const results = {
      status: 'PASS',
      confidence: 0,
      details: [],
      credit_score: 0,
      timestamp: new Date().toISOString(),
    }

    let passCount = 0
    let totalCount = 0

    // Verify Aadhaar
    if (documents.aadhaar) {
      totalCount++
      const ocrResult = await extractOCRText('aadhaar', documents.aadhaar)
      const formatValid = validateDocumentFormat('aadhaar', ocrResult.extracted)
      const imageAnalysis = await analyzeImageQuality(documents.aadhaar, 'aadhaar')

      results.details.push({
        field: 'aadhaar',
        match: formatValid.valid && imageAnalysis.isLikelyGenuine,
        ocr_text: ocrResult.extracted,
        confidence: imageAnalysis.fakeDetectionScore,
        valid_format: formatValid.valid,
      })

      if (formatValid.valid && imageAnalysis.isLikelyGenuine) {
        passCount++
      }
    }

    // Verify PAN
    if (documents.pan) {
      totalCount++
      const ocrResult = await extractOCRText('pan', documents.pan)
      const formatValid = validateDocumentFormat('pan', ocrResult.fields.number)
      const imageAnalysis = await analyzeImageQuality(documents.pan, 'pan')
      const panMatch = ocrResult.fields.number === userData.pan

      results.details.push({
        field: 'pan',
        match: formatValid.valid && panMatch && imageAnalysis.isLikelyGenuine,
        ocr_text: ocrResult.extracted,
        extracted_pan: ocrResult.fields.number,
        provided_pan: userData.pan,
        confidence: imageAnalysis.fakeDetectionScore,
        valid_format: formatValid.valid,
      })

      if (formatValid.valid && panMatch && imageAnalysis.isLikelyGenuine) {
        passCount++
      }
    }

    // Verify Payslip
    if (documents.payslip) {
      totalCount++
      const ocrResult = await extractOCRText('payslip', documents.payslip)
      const imageAnalysis = await analyzeImageQuality(documents.payslip, 'payslip')

      results.details.push({
        field: 'payslip',
        match: imageAnalysis.isValidSize && imageAnalysis.isLikelyGenuine,
        ocr_text: ocrResult.extracted,
        extracted_salary: ocrResult.fields.salary,
        confidence: imageAnalysis.fakeDetectionScore,
      })

      if (imageAnalysis.isValidSize && imageAnalysis.isLikelyGenuine) {
        passCount++
      }
    }

    // Verify Selfie (Liveness)
    if (documents.selfie) {
      totalCount++
      const livenessResult = await checkLiveness(documents.selfie)

      results.details.push({
        field: 'selfie',
        match: livenessResult.isLive,
        liveness_score: livenessResult.livenessScore,
        status: livenessResult.status,
      })

      if (livenessResult.isLive) {
        passCount++
      }
    }

    // Calculate overall status and confidence
    const passRate = totalCount > 0 ? passCount / totalCount : 0

    if (passRate === 1) {
      results.status = 'PASS'
      results.confidence = 0.95
    } else if (passRate >= 0.75) {
      results.status = 'PASS'
      results.confidence = 0.85
    } else if (passRate >= 0.5) {
      results.status = 'UNSURE'
      results.confidence = 0.65
    } else {
      results.status = 'FAIL'
      results.confidence = 0.4
    }

    // Calculate credit score based on income
    const salary = parseFloat(userData.monthlySalary) || 50000
    results.credit_score = calculateMockCreditScore(salary)

    return results
  } catch (error) {
    console.error('Verification error:', error)
    return {
      status: 'FAIL',
      confidence: 0,
      details: [{ field: 'error', message: error.message }],
      credit_score: 0,
      timestamp: new Date().toISOString(),
    }
  }
}
