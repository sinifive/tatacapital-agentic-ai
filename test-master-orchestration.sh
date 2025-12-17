#!/bin/bash

echo "======================================================"
echo "MASTER ORCHESTRATION ENGINE - TEST SUITE"
echo "======================================================"
echo ""

# Test 1: Start a new session
echo "▶️  TEST 1: Start New Session"
echo "Request: POST /api/master/start"
curl -X POST http://localhost:3001/api/master/start \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-001",
    "applicant_name": "Rajesh Kumar",
    "pan": "AAAPA5055K",
    "dob": "1990-01-15"
  }' | jq .
echo ""
echo ""

# Test 2: Get session status (initial)
echo "▶️  TEST 2: Get Session Status (START state)"
echo "Request: GET /api/master/status/SESSION-001"
curl -X GET http://localhost:3001/api/master/status/SESSION-001 | jq .
echo ""
echo ""

# Test 3: Progress to SALES stage
echo "▶️  TEST 3: Progress to SALES Stage"
echo "Request: POST /api/master/callback (SALES)"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-001",
    "stage": "SALES",
    "stageData": {
      "inquiry_type": "Personal Loan",
      "amount_needed": 500000,
      "purpose": "Home renovation"
    }
  }' | jq .
echo ""
echo ""

# Test 4: Progress to VERIFY stage
echo "▶️  TEST 4: Progress to VERIFY Stage"
echo "Request: POST /api/master/callback (VERIFY)"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-001",
    "stage": "VERIFY",
    "stageData": {
      "aadhaar": "123456789012",
      "pan": "AAAPA5055K"
    }
  }' | jq .
echo ""
echo ""

# Test 5: Progress to UNDERWRITE stage
echo "▶️  TEST 5: Progress to UNDERWRITE Stage"
echo "Request: POST /api/master/callback (UNDERWRITE)"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-001",
    "stage": "UNDERWRITE",
    "stageData": {
      "pan": "AAAPA5055K",
      "credit_score": 800,
      "requested_amount": 300000,
      "monthly_salary": 50000,
      "tenure_months": 60
    }
  }' | jq .
echo ""
echo ""

# Test 6: Progress to SANCTION stage
echo "▶️  TEST 6: Progress to SANCTION Stage"
echo "Request: POST /api/master/callback (SANCTION)"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-001",
    "stage": "SANCTION",
    "stageData": {
      "session_id": "SESSION-001",
      "user_profile": {
        "name": "Rajesh Kumar",
        "pan": "AAAPA5055K",
        "aadhaar": "123456789012",
        "dob": "1990-01-15"
      },
      "loan_terms": {
        "principal": 300000,
        "tenure_months": 60,
        "annual_roi": 7.99,
        "monthly_emi": 5700
      },
      "verification_summary": {
        "document_verification": "PASS",
        "deepfake_detection": "PASS",
        "liveness_check": "PASS",
        "credit_score": 800
      }
    }
  }' | jq .
echo ""
echo ""

# Test 7: Get final session status
echo "▶️  TEST 7: Get Final Session Status (CLOSED state)"
echo "Request: GET /api/master/status/SESSION-001"
curl -X GET http://localhost:3001/api/master/status/SESSION-001 | jq .
echo ""
echo ""

# Test 8: Get all sessions
echo "▶️  TEST 8: List All Sessions"
echo "Request: GET /api/master/sessions"
curl -X GET http://localhost:3001/api/master/sessions | jq .
echo ""
echo ""

# Test 9: Get workflow statistics
echo "▶️  TEST 9: Get Workflow Statistics"
echo "Request: GET /api/master/stats"
curl -X GET http://localhost:3001/api/master/stats | jq .
echo ""
echo ""

# Test 10: Start a second session that will fail verification
echo "▶️  TEST 10: Start Session That Fails Verification"
echo "Request: POST /api/master/start (SESSION-002)"
curl -X POST http://localhost:3001/api/master/start \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-002",
    "applicant_name": "Priya Singh",
    "pan": "BBPPB1234M",
    "dob": "1992-05-20"
  }' | jq .
echo ""
echo ""

# Test 11: Attempt verification with low credit score (will fail)
echo "▶️  TEST 11: Progress SESSION-002 Through Stages (Will Fail at Underwriting)"
echo "First: Move to SALES"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-002",
    "stage": "SALES",
    "stageData": {"inquiry_type": "Personal Loan"}
  }' | jq .
echo ""

echo "Then: Move to VERIFY"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-002",
    "stage": "VERIFY",
    "stageData": {"aadhaar": "123456789012", "pan": "BBPPB1234M"}
  }' | jq .
echo ""

echo "Then: Move to UNDERWRITE (will fail due to low credit score)"
curl -X POST http://localhost:3001/api/master/callback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-002",
    "stage": "UNDERWRITE",
    "stageData": {
      "pan": "BBPPB1234M",
      "credit_score": 650,
      "requested_amount": 500000,
      "monthly_salary": 30000,
      "tenure_months": 60
    }
  }' | jq .
echo ""
echo ""

# Test 12: Check manual review queue
echo "▶️  TEST 12: Get Manual Review Queue"
echo "Request: GET /api/master/manual-review-queue"
curl -X GET http://localhost:3001/api/master/manual-review-queue | jq .
echo ""
echo ""

# Test 13: Manual review decision (approve)
echo "▶️  TEST 13: Manual Review Decision - APPROVE"
echo "Request: POST /api/master/manual-review-decision"
curl -X POST http://localhost:3001/api/master/manual-review-decision \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION-002",
    "decision": "approve",
    "reviewedBy": "loan-officer-001",
    "notes": "Customer has good payment history"
  }' | jq .
echo ""
echo ""

# Test 14: Final stats
echo "▶️  TEST 14: Final Workflow Statistics"
echo "Request: GET /api/master/stats"
curl -X GET http://localhost:3001/api/master/stats | jq .
echo ""
echo ""

echo "======================================================"
echo "TEST SUITE COMPLETE"
echo "======================================================"
