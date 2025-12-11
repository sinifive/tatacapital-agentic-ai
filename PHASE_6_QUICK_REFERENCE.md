# Phase 6 Quick Reference Card

## Endpoints at a Glance

### POST /mock/upload_salary
```
Purpose: Upload salary document
Input:   multipart form data
         - session_id (query): session identifier
         - file (body): salary document (PDF, PNG, JPG, JPEG)
Output:  {file_id, monthly_salary, annual_salary, status, message}
Status:  200 OK | 400 Bad Request | 422 Unprocessable Entity
```

### GET /mock/salary/{file_id}
```
Purpose: Retrieve salary verification
Input:   file_id (path parameter)
Output:  {status, file_id, monthly_salary, annual_salary, verification_date}
Status:  200 OK | 404 Not Found
```

## Quick Test

### Upload Salary
```bash
curl -X POST "http://localhost:8000/mock/upload_salary?session_id=test_001" \
  -F "file=@salary.pdf"
```

### Get Salary by ID
```bash
curl -X GET "http://localhost:8000/mock/salary/test_001_abc12345"
```

## Python Integration

### Upload via Client
```python
from fastapi.testclient import TestClient
from backend.app import app
from io import BytesIO

client = TestClient(app)
response = client.post(
    "/mock/upload_salary",
    params={"session_id": "loan_001"},
    files={"file": ("salary.pdf", BytesIO(b"content"), "application/pdf")}
)
file_id = response.json()['file_id']
```

### Use in UnderwritingAgent
```python
import asyncio
from backend.agents.workers import UnderwritingAgent

async def process_loan():
    agent = UnderwritingAgent()
    context = {
        'customer_id': 'cust_001',
        'loan_amount': 1000000,
        'tenure': 60,
        'salary_file_id': file_id  # From upload
    }
    result = await agent.handle(context)
    return result

asyncio.run(process_loan())
```

## Customer Salaries

| ID      | Name            | Monthly | Annual    |
|---------|-----------------|---------|-----------|
| cust_001| Rajesh Kumar    | ₹75,000 | ₹900,000  |
| cust_002| Priya Sharma    | ₹120,000| ₹1.44M    |
| cust_003| Amit Patel      | ₹60,000 | ₹720,000  |
| default | Default Profile | ₹85,000 | ₹1.02M    |

## Approval Logic

```
EMI ÷ Monthly_Salary ≤ 50% → ✅ APPROVED
EMI ÷ Monthly_Salary > 50%  → ❌ REJECTED
```

**Example:**
- Monthly Salary: ₹75,000
- Loan: ₹7.5L @ 10.5% for 60 months
- EMI: ₹15,937.53
- Ratio: 15,937.53 ÷ 75,000 = 21.25%
- Decision: ✅ APPROVED (21.25% < 50%)

## File Requirements

- **Types:** PDF, PNG, JPG, JPEG
- **Max Size:** 5 MB
- **Naming:** Automatically sanitized

## Session State After Upload

```python
_sessions[session_id] = {
    'customer_id': 'cust_001',
    'salary_file_id': 'session_abc12345',
    'salary_check': {
        'file_id': 'session_abc12345',
        'monthly_salary': 75000,
        'annual_salary': 900000,
        'document_type': 'salary_slip',
        'verification_date': '2025-12-11T19:43:32.341Z'
    }
}
```

## Files & Classes

| File | Class | Method |
|------|-------|--------|
| app.py | - | POST /mock/upload_salary |
| app.py | - | GET /mock/salary/{file_id} |
| mock_apis.py | MockDocumentVerification | store_salary_verification() |
| mock_apis.py | MockDocumentVerification | get_salary_by_file_id() |
| workers.py | UnderwritingAgent | handle() [salary_file_id] |

## Run Tests

```bash
# Test endpoints
python test_mock_salary_upload.py

# Test integration
python test_salary_integration_simplified.py

# Test with curl
bash test_salary_upload_curl.sh
```

## Response Examples

### Upload Success (200)
```json
{
  "file_id": "loan_001_e318caba",
  "session_id": "loan_001",
  "status": "success",
  "message": "Salary document verified successfully (Mock OCR)",
  "monthly_salary": 75000,
  "annual_salary": 900000
}
```

### Retrieve Success (200)
```json
{
  "status": "success",
  "file_id": "loan_001_e318caba",
  "monthly_salary": 75000,
  "annual_salary": 900000,
  "verification_date": "2025-12-11T19:43:32.341Z"
}
```

### Invalid File Type (400)
```json
{
  "detail": "Invalid file type: .txt. Allowed: {'.pdf', '.png', '.jpg', '.jpeg'}"
}
```

### File Not Found (404)
```json
{
  "detail": "Salary verification not found for file_id: invalid_id"
}
```

## Key Features

✅ Multipart form upload with file validation  
✅ Unique file_id: {session_id}_{uuid[:8]}  
✅ Synthetic salary mapping per customer  
✅ UnderwritingAgent integration  
✅ EMI-to-salary ratio approval  
✅ Session persistence  
✅ Error handling  
✅ Production ready  

## Architecture

```
User Upload
    ↓
POST /mock/upload_salary
    ↓
File Validation + Save
    ↓
Generate file_id
    ↓
Create salary_check dict
    ↓
Store in Session + MockDocumentVerification
    ↓
Return response with file_id
    ↓
UnderwritingAgent.handle(context)
    ↓
GET /mock/salary/{file_id}
    ↓
MockDocumentVerification.get_salary_by_file_id()
    ↓
EMI ÷ Salary Ratio Check
    ↓
Approve or Reject
```

## Common Scenarios

### Scenario 1: Approve
```
Customer: cust_002 (Priya, ₹120K/month)
Loan: ₹20L for 60 months @ 10.5%
EMI: ₹24,500
Ratio: 20.4%
Result: ✅ APPROVED
```

### Scenario 2: Reject
```
Customer: cust_001 (Rajesh, ₹75K/month)
Loan: ₹25L for 60 months @ 10.5%
EMI: ₹53,125
Ratio: 70.8%
Result: ❌ REJECTED
```

### Scenario 3: Borderline
```
Customer: cust_001 (Rajesh, ₹75K/month)
Loan: ₹7.5L for 60 months @ 10.5%
EMI: ₹15,938
Ratio: 21.3%
Result: ✅ APPROVED
```

## Error Handling

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Invalid file type | 400 | File not PDF/PNG/JPG | Use correct format |
| File too large | 400 | >5 MB | Reduce file size |
| Missing session_id | 422 | Query param missing | Add ?session_id=xxx |
| File not found | 404 | Invalid file_id | Check file_id value |

## Next Steps

1. ✅ Phase 6 Complete: Salary upload endpoints
2. 📋 Phase 7 (Future): Real OCR integration
3. 📋 Phase 8 (Future): Multi-document support
4. 📋 Phase 9 (Future): Employer verification API

---

**For complete documentation, see:**
- PHASE_6_README.md - Full implementation details
- SALARY_UPLOAD_API.md - Complete API reference
- test_mock_salary_upload.py - Test examples
