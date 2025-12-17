#!/bin/bash

echo "========== UNDERWRITING ENGINE TEST CASES =========="
echo ""

# Test 1: Approval - Within pre-approved limit (LOW risk)
echo "Test 1: APPROVED - Within pre-approved limit (credit_score: 800, amount: 300000)"
curl -X POST http://localhost:3001/api/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Rajesh Kumar",
    "pan": "AAAPA5055K",
    "credit_score": 800,
    "requested_amount": 300000,
    "monthly_salary": 50000,
    "tenure_months": 60
  }' | jq .
echo ""
echo ""

# Test 2: Approval - Salary check passed (MEDIUM risk)
echo "Test 2: APPROVED - Salary check passed (credit_score: 720, amount: 600000)"
curl -X POST http://localhost:3001/api/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Priya Singh",
    "pan": "BBPPB1234M",
    "credit_score": 720,
    "requested_amount": 600000,
    "monthly_salary": 80000,
    "tenure_months": 60
  }' | jq .
echo ""
echo ""

# Test 3: Rejection - Credit score too low
echo "Test 3: REJECTED - Credit score too low (credit_score: 650)"
curl -X POST http://localhost:3001/api/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Amit Patel",
    "pan": "CCQCC9999Z",
    "credit_score": 650,
    "requested_amount": 300000,
    "monthly_salary": 40000,
    "tenure_months": 60
  }' | jq .
echo ""
echo ""

# Test 4: Rejection - EMI too high (exceeds 50% salary)
echo "Test 4: REJECTED - EMI too high (credit_score: 710, amount: 500000, salary: 30000)"
curl -X POST http://localhost:3001/api/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Neha Sharma",
    "pan": "DDEDD5555X",
    "credit_score": 710,
    "requested_amount": 500000,
    "monthly_salary": 30000,
    "tenure_months": 60
  }' | jq .
echo ""
echo ""

# Test 5: Rejection - Amount exceeds 2x pre-approved limit
echo "Test 5: REJECTED - Amount too high (exceeds 2x pre-limit) (credit_score: 750, amount: 900000)"
curl -X POST http://localhost:3001/api/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Vikram Desai",
    "pan": "EEFFG7777W",
    "credit_score": 750,
    "requested_amount": 900000,
    "monthly_salary": 100000,
    "tenure_months": 60
  }' | jq .
echo ""
echo ""

# Test 6: High risk bucket (score 680-700)
echo "Test 6: APPROVED - HIGH risk bucket (credit_score: 700, amount: 150000)"
curl -X POST http://localhost:3001/api/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "Suresh Kumar",
    "pan": "FFHHH3333V",
    "credit_score": 700,
    "requested_amount": 150000,
    "monthly_salary": 35000,
    "tenure_months": 60
  }' | jq .
echo ""
echo ""

echo "========== TEST COMPLETE =========="
