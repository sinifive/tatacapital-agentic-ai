#!/usr/bin/env node

/**
 * Verification API Test Script
 * Run: node test-verification.js
 * 
 * Tests the /api/verification endpoint with mock document uploads
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import FormData from 'form-data'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'http://localhost:3001/api/verification'

/**
 * Create a minimal mock file (PNG header + dummy data)
 */
function createMockFile(filename, type = 'image/png') {
  const pngHeader = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
    0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 0, 1, 0, 0, 0, 1,
    8, 2, 0, 0, 0, 144, 119, 83, 222
  ])

  const dummyData = Buffer.alloc(10000, Math.random() * 256)
  return Buffer.concat([pngHeader, dummyData])
}

/**
 * Test 1: Full Verification with All Documents
 */
async function testFullVerification() {
  console.log('\n========== TEST 1: Full Verification ==========')
  
  const formData = new FormData()
  formData.append('name', 'John Doe')
  formData.append('pan', 'ABCD1234E')
  formData.append('monthlySalary', '50000')
  formData.append('aadhaar', createMockFile('aadhaar.png'), 'aadhaar.png')
  formData.append('pan', createMockFile('pan.png'), 'pan.png')
  formData.append('payslip', createMockFile('payslip.png'), 'payslip.png')
  formData.append('selfie', createMockFile('selfie.png'), 'selfie.png')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Result:')
    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

/**
 * Test 2: Minimal Verification (PAN + Aadhaar only)
 */
async function testMinimalVerification() {
  console.log('\n========== TEST 2: Minimal Verification ==========')
  
  const formData = new FormData()
  formData.append('name', 'Jane Smith')
  formData.append('pan', 'XYZ9876A')
  formData.append('aadhaar', createMockFile('aadhaar.png'), 'aadhaar.png')
  formData.append('pan', createMockFile('pan.png'), 'pan.png')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Result:')
    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

/**
 * Test 3: With Payslip for Income Verification
 */
async function testWithPayslip() {
  console.log('\n========== TEST 3: With Payslip ==========')
  
  const formData = new FormData()
  formData.append('name', 'Rajesh Kumar')
  formData.append('pan', 'PQRS1111K')
  formData.append('monthlySalary', '75000')
  formData.append('aadhaar', createMockFile('aadhaar.png'), 'aadhaar.png')
  formData.append('pan', createMockFile('pan.png'), 'pan.png')
  formData.append('payslip', createMockFile('payslip.pdf'), 'payslip.pdf')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Result:')
    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

/**
 * Test 4: With Selfie (Liveness Check)
 */
async function testWithSelfie() {
  console.log('\n========== TEST 4: With Selfie (Liveness) ==========')
  
  const formData = new FormData()
  formData.append('name', 'Priya Sharma')
  formData.append('pan', 'LMNO5555P')
  formData.append('aadhaar', createMockFile('aadhaar.png'), 'aadhaar.png')
  formData.append('pan', createMockFile('pan.png'), 'pan.png')
  formData.append('selfie', createMockFile('selfie.png'), 'selfie.png')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Result:')
    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

/**
 * Test 5: Missing Required Fields (Error Case)
 */
async function testMissingFields() {
  console.log('\n========== TEST 5: Missing Required Fields (Error) ==========')
  
  const formData = new FormData()
  formData.append('name', 'Missing PAN')
  formData.append('aadhaar', createMockFile('aadhaar.png'), 'aadhaar.png')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Error Response:')
    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}

/**
 * Test 6: Performance - Multiple Concurrent Requests
 */
async function testConcurrency() {
  console.log('\n========== TEST 6: Concurrent Requests (3x) ==========')
  
  const requests = [
    { name: 'User A', pan: 'AAAA1111A' },
    { name: 'User B', pan: 'BBBB2222B' },
    { name: 'User C', pan: 'CCCC3333C' }
  ]

  const startTime = Date.now()

  const promises = requests.map(async (user) => {
    const formData = new FormData()
    formData.append('name', user.name)
    formData.append('pan', user.pan)
    formData.append('aadhaar', createMockFile('aadhaar.png'), 'aadhaar.png')
    formData.append('pan', createMockFile('pan.png'), 'pan.png')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  })

  const results = await Promise.all(promises)
  const duration = Date.now() - startTime

  console.log(`Completed 3 requests in ${duration}ms`)
  results.forEach((result, idx) => {
    console.log(`  Request ${idx + 1}: ${result.status || result.error} (Score: ${result.credit_score || 'N/A'})`)
  })

  return results
}

/**
 * Parse and display summary of results
 */
function summarizeResults(results) {
  console.log('\n========== SUMMARY ==========')
  console.log(`Total Tests Run: ${results.length}`)

  const passed = results.filter(r => r.status === 'PASS').length
  const unsure = results.filter(r => r.status === 'UNSURE').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const errors = results.filter(r => r.error).length

  console.log(`  ✅ PASS: ${passed}`)
  console.log(`  ⚠️  UNSURE: ${unsure}`)
  console.log(`  ❌ FAIL: ${failed}`)
  console.log(`  🔥 ERRORS: ${errors}`)

  const avgConfidence = results
    .filter(r => r.confidence)
    .reduce((sum, r) => sum + r.confidence, 0) / results.length
  console.log(`\nAverage Confidence: ${(avgConfidence * 100).toFixed(1)}%`)

  const creditScores = results.filter(r => r.credit_score).map(r => r.credit_score)
  if (creditScores.length > 0) {
    const avgScore = creditScores.reduce((a, b) => a + b) / creditScores.length
    console.log(`Average Credit Score: ${Math.round(avgScore)}`)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('===========================================')
  console.log('  Verification API Test Suite')
  console.log('  Endpoint: ' + API_URL)
  console.log('===========================================')

  const results = []

  // Run all tests
  const test1 = await testFullVerification()
  if (test1 && !test1.error) results.push(test1)

  const test2 = await testMinimalVerification()
  if (test2 && !test2.error) results.push(test2)

  const test3 = await testWithPayslip()
  if (test3 && !test3.error) results.push(test3)

  const test4 = await testWithSelfie()
  if (test4 && !test4.error) results.push(test4)

  await testMissingFields() // Error test, don't include in results

  const test6Results = await testConcurrency()
  results.push(...test6Results.filter(r => r.status))

  // Summarize
  if (results.length > 0) {
    summarizeResults(results)
  }

  console.log('\n===========================================')
  console.log('  Tests Complete')
  console.log('===========================================\n')
}

// Check dependencies
try {
  import('form-data')
  import('node-fetch')
} catch (error) {
  console.error('Missing dependencies. Install with:')
  console.error('  npm install form-data node-fetch')
  process.exit(1)
}

main().catch(console.error)
