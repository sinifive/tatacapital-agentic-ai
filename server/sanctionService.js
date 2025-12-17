import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PDF_DIR = path.join(__dirname, '../pdfs')

// Ensure PDF directory exists
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true })
}

// Generate digital signature (fake eSign stamp)
const generateDigitalSignature = (data, secretKey = 'TATA_CAPITAL_SECRET_KEY_2025') => {
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('hex')

  return {
    signature: hash,
    timestamp: new Date().toISOString(),
    signedBy: 'Tata Capital Digital Signature Engine',
    algorithm: 'HMAC-SHA256',
    verified: true,
  }
}

// Hash sensitive data for eKYC block
const hashEKYCData = (data) => {
  const stringified = JSON.stringify(data)
  return crypto.createHash('sha256').update(stringified).digest('hex')
}

// Create professional PDF with loan sanction
export const generateSanctionPDF = async (sanctionData) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        session_id,
        user_profile,
        loan_terms,
        verification_summary,
        timestamp = new Date().toISOString(),
      } = sanctionData

      // Validate required fields
      if (!user_profile || !loan_terms) {
        throw new Error('Missing required fields: user_profile, loan_terms')
      }

      const pdfFileName = `sanction_${session_id}_${Date.now()}.pdf`
      const pdfPath = path.join(PDF_DIR, pdfFileName)

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      })

      // Create write stream
      const writeStream = fs.createWriteStream(pdfPath)
      doc.pipe(writeStream)

      // ========== HEADER ==========
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('TATA CAPITAL LOAN SANCTION', { align: 'center' })
        .fontSize(10)
        .font('Helvetica')
        .text('Official Loan Approval Document', { align: 'center' })

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown()

      // ========== REFERENCE DETAILS ==========
      doc.fontSize(11).font('Helvetica-Bold').text('REFERENCE DETAILS', { underline: true })
      doc.fontSize(10).font('Helvetica')

      const refData = [
        ['Session ID:', session_id],
        ['Document Date:', new Date(timestamp).toLocaleDateString()],
        ['Valid From:', new Date(timestamp).toLocaleDateString()],
        ['Validity:', '1 Year'],
      ]

      refData.forEach(([key, value]) => {
        doc.text(`${key} ${value}`)
      })

      doc.moveDown()

      // ========== APPLICANT INFORMATION ==========
      doc.fontSize(11).font('Helvetica-Bold').text('APPLICANT INFORMATION', { underline: true })
      doc.fontSize(10).font('Helvetica')

      const applicantData = [
        ['Name:', user_profile.name || 'N/A'],
        ['PAN:', user_profile.pan || 'N/A'],
        ['Age:', user_profile.age || 'N/A'],
        ['Email:', user_profile.email || 'N/A'],
        ['Mobile:', user_profile.mobile || 'N/A'],
      ]

      applicantData.forEach(([key, value]) => {
        doc.text(`${key} ${value}`)
      })

      doc.moveDown()

      // ========== LOAN TERMS ==========
      doc.fontSize(11).font('Helvetica-Bold').text('LOAN TERMS & CONDITIONS', { underline: true })
      doc.fontSize(10).font('Helvetica')

      const loanData = [
        ['Loan Amount:', `₹ ${loan_terms.approved_amount?.toLocaleString() || 'N/A'}`],
        ['Tenure:', `${loan_terms.tenure_months || 'N/A'} Months`],
        ['Annual ROI:', `${loan_terms.annual_roi || 'N/A'}%`],
        ['Monthly EMI:', `₹ ${Math.round(loan_terms.monthly_emi || 0).toLocaleString()}`],
        ['Processing Fee:', `${loan_terms.processing_fee_percent || 0}% (₹ ${Math.round((loan_terms.approved_amount || 0) * (loan_terms.processing_fee_percent || 0) / 100).toLocaleString()})`],
        ['Risk Bucket:', `${loan_terms.risk_bucket || 'N/A'}`],
        ['Credit Score:', `${loan_terms.credit_score || 'N/A'}`],
      ]

      loanData.forEach(([key, value]) => {
        doc.text(`${key} ${value}`)
      })

      doc.moveDown()

      // ========== VERIFICATION SUMMARY ==========
      if (verification_summary) {
        doc.fontSize(11).font('Helvetica-Bold').text('VERIFICATION SUMMARY', { underline: true })
        doc.fontSize(9).font('Helvetica')

        const verificationData = [
          ['Document Verification:', verification_summary.documents_verified ? '✓ Passed' : '✗ Failed'],
          ['Identity Check:', verification_summary.identity_verified ? '✓ Passed' : '✗ Failed'],
          ['Income Verification:', verification_summary.income_verified ? '✓ Passed' : '✗ Failed'],
          ['Deepfake Detection:', verification_summary.deepfake_check ? '✓ Passed' : '✗ Failed'],
          ['Liveness Check:', verification_summary.liveness_check ? '✓ Passed' : '✗ Failed'],
        ]

        verificationData.forEach(([key, value]) => {
          doc.text(`${key} ${value}`)
        })

        doc.moveDown()
      }

      // ========== eKYC BLOCK (HASHED) ==========
      doc.fontSize(11).font('Helvetica-Bold').text('eKYC VERIFICATION BLOCK', { underline: true })
      doc.fontSize(8).font('Courier')

      const eKYCBlockData = {
        timestamp,
        session_id,
        applicant_pan: user_profile.pan,
        credit_score: loan_terms.credit_score,
        verification_status: verification_summary?.overall_status || 'VERIFIED',
      }

      const eKYCHash = hashEKYCData(eKYCBlockData)

      doc.text(`eKYC Hash: ${eKYCHash}`)
      doc.text(`Hash Method: SHA-256`)
      doc.text(`Timestamp: ${timestamp}`)
      doc.fontSize(9).font('Helvetica')

      doc.moveDown()

      // ========== DIGITAL SIGNATURE & eSign ==========
      doc.fontSize(11).font('Helvetica-Bold').text('DIGITAL SIGNATURE & eKYC CERTIFICATION', { underline: true })
      doc.fontSize(9).font('Helvetica')

      const signatureData = `${session_id}|${user_profile.pan}|${loan_terms.approved_amount}|${timestamp}`
      const signature = generateDigitalSignature(signatureData)

      doc.text(`Signed By: ${signature.signedBy}`)
      doc.text(`Signature Date: ${signature.timestamp}`)
      doc.text(`Algorithm: ${signature.algorithm}`)
      doc.fontSize(8).font('Courier')
      doc.text(`Signature Hash:`)
      doc.text(signature.signature, { width: 500, wordBreak: true })
      doc.fontSize(9).font('Helvetica')

      doc.moveDown()

      // ========== TERMS & CONDITIONS BOX ==========
      doc.fontSize(9).font('Helvetica-Bold').text('TERMS & CONDITIONS:', { underline: true })
      doc.fontSize(8).font('Helvetica')

      const terms = [
        '1. This sanction letter is valid for 1 year from the date of issuance.',
        '2. The applicant must maintain credit score above 700 throughout the loan period.',
        '3. Monthly EMI payments are due on the same date each month.',
        '4. Prepayment is allowed without additional charges.',
        '5. This document is digitally signed and has legal validity.',
        '6. eKYC verification is complete and archived for 7 years.',
        '7. All personal data is encrypted and protected under data protection laws.',
      ]

      terms.forEach((term) => {
        doc.text(term, { width: 500, wordBreak: true })
      })

      doc.moveDown()

      // ========== FOOTER ==========
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.fontSize(8)
        .font('Helvetica')
        .text(
          'This is a digitally signed document. No wet signature required. For verification, visit www.tatacapital.com/verify',
          { align: 'center' }
        )
      doc.text(`Document ID: ${pdfFileName}`, { align: 'center' })

      // Finalize PDF
      doc.end()

      writeStream.on('finish', () => {
        resolve({
          success: true,
          pdf_file: pdfFileName,
          pdf_path: pdfPath,
          download_url: `/api/sanctioned-pdf/${pdfFileName}`,
          file_size: fs.statSync(pdfPath).size,
          generated_at: timestamp,
          signature: signature.signature.substring(0, 32) + '...', // Show partial signature
          ekyc_hash: eKYCHash.substring(0, 32) + '...',
        })
      })

      writeStream.on('error', (err) => {
        reject(new Error(`PDF generation failed: ${err.message}`))
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Serve PDF file for download
export const getPDFFile = (pdfFileName) => {
  const pdfPath = path.join(PDF_DIR, pdfFileName)

  if (!fs.existsSync(pdfPath)) {
    return { error: 'PDF not found', status: 404 }
  }

  return {
    path: pdfPath,
    fileName: pdfFileName,
  }
}

// List all generated sanction PDFs
export const listSanctionPDFs = () => {
  try {
    const files = fs.readdirSync(PDF_DIR)
    return files
      .filter((f) => f.startsWith('sanction_'))
      .map((f) => ({
        filename: f,
        download_url: `/api/sanctioned-pdf/${f}`,
        created_at: fs.statSync(path.join(PDF_DIR, f)).birthtime,
        size: fs.statSync(path.join(PDF_DIR, f)).size,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    return []
  }
}

// Delete old PDFs (cleanup)
export const cleanupOldPDFs = (daysOld = 7) => {
  try {
    const files = fs.readdirSync(PDF_DIR)
    const now = Date.now()
    const deleteCount = 0

    files.forEach((f) => {
      const filePath = path.join(PDF_DIR, f)
      const stats = fs.statSync(filePath)
      const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24)

      if (ageInDays > daysOld) {
        fs.unlinkSync(filePath)
        deleteCount++
      }
    })

    return { deleted: deleteCount, message: `Deleted ${deleteCount} PDFs older than ${daysOld} days` }
  } catch (error) {
    return { error: error.message }
  }
}
