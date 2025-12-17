import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../data/tata_capital.db')

let db = null

// Initialize database
export const initializeDatabase = async () => {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    })

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON')

    // Create applications table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicationId TEXT UNIQUE NOT NULL,
        applicantName TEXT NOT NULL,
        pan TEXT NOT NULL,
        loanAmount INTEGER NOT NULL,
        tenure INTEGER NOT NULL,
        purpose TEXT,
        monthlySalary INTEGER,
        documents TEXT,
        status TEXT DEFAULT 'submitted',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        estimatedApprovalDate TEXT
      )
    `)

    // Create verification results table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicationId TEXT NOT NULL,
        documentVerification TEXT,
        deepfakeDetection TEXT,
        livenessCheck TEXT,
        confidence REAL,
        status TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(applicationId) REFERENCES applications(applicationId)
      )
    `)

    // Create credit scores table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS creditScores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicationId TEXT NOT NULL UNIQUE,
        pan TEXT NOT NULL,
        creditScore INTEGER,
        riskBucket TEXT,
        roi REAL,
        preApprovedLimit INTEGER,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(applicationId) REFERENCES applications(applicationId)
      )
    `)

    // Create underwriting decisions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS underwriting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicationId TEXT NOT NULL UNIQUE,
        decision TEXT,
        approvedAmount INTEGER,
        monthlyEmi REAL,
        emiToSalaryRatio REAL,
        riskBucket TEXT,
        auditLog TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(applicationId) REFERENCES applications(applicationId)
      )
    `)

    // Create sanction letters table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sanctions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicationId TEXT NOT NULL UNIQUE,
        pdfPath TEXT,
        downloadUrl TEXT,
        digitSignature TEXT,
        signedAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(applicationId) REFERENCES applications(applicationId)
      )
    `)

    console.log('✅ Database initialized successfully at', DB_PATH)
    return db
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    throw error
  }
}

// Application operations
export const saveApplication = async (applicationData) => {
  if (!db) throw new Error('Database not initialized')
  
  const {
    applicationId,
    applicantName,
    pan,
    loanAmount,
    tenure,
    purpose,
    monthlySalary,
    documents
  } = applicationData

  const now = new Date().toISOString()
  const estimatedApprovalDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await db.run(
    `INSERT INTO applications 
     (applicationId, applicantName, pan, loanAmount, tenure, purpose, monthlySalary, documents, createdAt, updatedAt, estimatedApprovalDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [applicationId, applicantName, pan, loanAmount, tenure, purpose, monthlySalary, JSON.stringify(documents), now, now, estimatedApprovalDate]
  )

  return { success: true, applicationId }
}

export const getApplication = async (applicationId) => {
  if (!db) throw new Error('Database not initialized')
  
  return await db.get(
    'SELECT * FROM applications WHERE applicationId = ?',
    [applicationId]
  )
}

export const getAllApplications = async () => {
  if (!db) throw new Error('Database not initialized')
  
  return await db.all('SELECT * FROM applications ORDER BY createdAt DESC')
}

export const updateApplicationStatus = async (applicationId, status) => {
  if (!db) throw new Error('Database not initialized')
  
  const now = new Date().toISOString()
  await db.run(
    'UPDATE applications SET status = ?, updatedAt = ? WHERE applicationId = ?',
    [status, now, applicationId]
  )
}

// Verification operations
export const saveVerificationResult = async (applicationId, verificationData) => {
  if (!db) throw new Error('Database not initialized')
  
  const now = new Date().toISOString()
  const {
    documentVerification,
    deepfakeDetection,
    livenessCheck,
    confidence
  } = verificationData

  await db.run(
    `INSERT INTO verifications 
     (applicationId, documentVerification, deepfakeDetection, livenessCheck, confidence, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [applicationId, documentVerification, deepfakeDetection, livenessCheck, confidence, 'completed', now]
  )
}

export const getVerificationResult = async (applicationId) => {
  if (!db) throw new Error('Database not initialized')
  
  return await db.get(
    'SELECT * FROM verifications WHERE applicationId = ? ORDER BY createdAt DESC LIMIT 1',
    [applicationId]
  )
}

// Credit score operations
export const saveCreditScore = async (applicationId, scoreData) => {
  if (!db) throw new Error('Database not initialized')
  
  const now = new Date().toISOString()
  const {
    pan,
    creditScore,
    riskBucket,
    roi,
    preApprovedLimit
  } = scoreData

  await db.run(
    `INSERT OR REPLACE INTO creditScores 
     (applicationId, pan, creditScore, riskBucket, roi, preApprovedLimit, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [applicationId, pan, creditScore, riskBucket, roi, preApprovedLimit, now]
  )
}

export const getCreditScore = async (applicationId) => {
  if (!db) throw new Error('Database not initialized')
  
  return await db.get(
    'SELECT * FROM creditScores WHERE applicationId = ?',
    [applicationId]
  )
}

// Underwriting operations
export const saveUnderwritingDecision = async (applicationId, decisionData) => {
  if (!db) throw new Error('Database not initialized')
  
  const now = new Date().toISOString()
  const {
    decision,
    approvedAmount,
    monthlyEmi,
    emiToSalaryRatio,
    riskBucket,
    auditLog
  } = decisionData

  await db.run(
    `INSERT OR REPLACE INTO underwriting 
     (applicationId, decision, approvedAmount, monthlyEmi, emiToSalaryRatio, riskBucket, auditLog, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [applicationId, decision, approvedAmount, monthlyEmi, emiToSalaryRatio, riskBucket, JSON.stringify(auditLog), now]
  )
}

export const getUnderwritingDecision = async (applicationId) => {
  if (!db) throw new Error('Database not initialized')
  
  return await db.get(
    'SELECT * FROM underwriting WHERE applicationId = ?',
    [applicationId]
  )
}

// Sanction operations
export const saveSanctionLetter = async (applicationId, sanctionData) => {
  if (!db) throw new Error('Database not initialized')
  
  const now = new Date().toISOString()
  const {
    pdfPath,
    downloadUrl,
    digitSignature,
    signedAt
  } = sanctionData

  await db.run(
    `INSERT OR REPLACE INTO sanctions 
     (applicationId, pdfPath, downloadUrl, digitSignature, signedAt, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [applicationId, pdfPath, downloadUrl, digitSignature, signedAt, now]
  )
}

export const getSanctionLetter = async (applicationId) => {
  if (!db) throw new Error('Database not initialized')
  
  return await db.get(
    'SELECT * FROM sanctions WHERE applicationId = ?',
    [applicationId]
  )
}

// Dashboard statistics
export const getDashboardStats = async () => {
  if (!db) throw new Error('Database not initialized')
  
  const totalApplications = await db.get(
    'SELECT COUNT(*) as count FROM applications'
  )

  const statusBreakdown = await db.all(
    'SELECT status, COUNT(*) as count FROM applications GROUP BY status'
  )

  const approvedAmount = await db.get(
    'SELECT SUM(approvedAmount) as total FROM underwriting WHERE decision = "APPROVED"'
  )

  return {
    totalApplications: totalApplications?.count || 0,
    statusBreakdown: statusBreakdown || [],
    totalApprovedAmount: approvedAmount?.total || 0
  }
}

export default db
