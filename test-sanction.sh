#!/bin/bash

echo "========== SANCTION ENDPOINT TEST CASES =========="
echo ""

# Test 1: Generate Sanction PDF - Approval
echo "Test 1: GENERATE SANCTION PDF with eSign (APPROVED Case)"
curl -X POST http://localhost:3001/api/sanction \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_rajesh_20251212",
    "user_profile": {
      "name": "Rajesh Kumar",
      "pan": "AAAPA5055K",
      "age": 35,
      "email": "rajesh@example.com",
      "mobile": "9876543210"
    },
    "loan_terms": {
      "approved_amount": 300000,
      "tenure_months": 60,
      "annual_roi": 7.99,
      "monthly_emi": 6050,
      "processing_fee_percent": 1.5,
      "risk_bucket": "LOW",
      "credit_score": 800
    },
    "verification_summary": {
      "documents_verified": true,
      "identity_verified": true,
      "income_verified": true,
      "deepfake_check": true,
      "liveness_check": true,
      "overall_status": "VERIFIED"
    }
  }' | jq .
echo ""
echo ""

# Test 2: Generate Sanction PDF - Medium Risk
echo "Test 2: GENERATE SANCTION PDF - MEDIUM Risk Applicant"
curl -X POST http://localhost:3001/api/sanction \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_priya_20251212",
    "user_profile": {
      "name": "Priya Singh",
      "pan": "BBPPB1234M",
      "age": 28,
      "email": "priya@example.com",
      "mobile": "9876543211"
    },
    "loan_terms": {
      "approved_amount": 500000,
      "tenure_months": 60,
      "annual_roi": 9.99,
      "monthly_emi": 10546,
      "processing_fee_percent": 2.0,
      "risk_bucket": "MEDIUM",
      "credit_score": 720
    },
    "verification_summary": {
      "documents_verified": true,
      "identity_verified": true,
      "income_verified": true,
      "deepfake_check": true,
      "liveness_check": true,
      "overall_status": "VERIFIED"
    }
  }' | jq .
echo ""
echo ""

# Test 3: List all generated sanction PDFs
echo "Test 3: LIST ALL GENERATED SANCTION PDFs"
curl -X GET http://localhost:3001/api/sanction-pdfs/list | jq .
echo ""
echo ""

# Test 4: Download PDF (example - will work after Test 1)
echo "Test 4: DOWNLOAD SANCTION PDF"
echo "Note: Replace 'PDF_FILENAME' with actual filename from Test 1 response"
echo "Command: curl -X GET http://localhost:3001/api/sanctioned-pdf/[PDF_FILENAME] -o sanction.pdf"
echo ""
echo ""

# Test 5: Missing required fields
echo "Test 5: ERROR CASE - Missing required fields"
curl -X POST http://localhost:3001/api/sanction \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session"
  }' | jq .
echo ""
echo ""

echo "========== SANCTION TESTS COMPLETE =========="
echo ""
echo "PDF Features Implemented:"
echo "✓ Professional PDF layout with loan terms"
echo "✓ Applicant information section"
echo "✓ Verification summary"
echo "✓ eKYC block with SHA-256 hash"
echo "✓ Digital signature (HMAC-SHA256)"
echo "✓ eSign certification metadata"
echo "✓ Terms & conditions"
echo "✓ Download URL for easy retrieval"
echo ""
echo "Sample PDF Test:"
echo "After running Test 1, extract the pdf_file name and download:"
echo "curl http://localhost:3001/api/sanctioned-pdf/[filename] -o sanction_letter.pdf"
