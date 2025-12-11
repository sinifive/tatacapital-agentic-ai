# Mock Salary Upload Endpoint Documentation

## Overview

The `/mock/upload_salary` endpoint enables salary document uploads for loan underwriting. It integrates with `UnderwritingAgent` to verify applicant income and make approval decisions based on EMI-to-salary ratios.

## Endpoints

### POST /mock/upload_salary

**Purpose:** Accept salary document upload and return generated file_id for agent processing.

**Request:**
```
Method: POST
URL: /mock/upload_salary?session_id={session_id}
Content-Type: multipart/form-data

Parameters:
  - session_id (query): Unique session identifier [Required]
  - file (body): Salary document file [Required]
```

**File Validation:**
- **Allowed Types:** PDF, PNG, JPG, JPEG
- **Max Size:** 5 MB
- **Storage:** `/uploads/salary_{session_id}_{file_id}_{original_name}`

**Response:**
```json
{
  "file_id": "test_session_001_e318caba",
  "session_id": "test_session_001",
  "status": "success",
  "message": "Salary document verified successfully (Mock OCR)",
  "monthly_salary": 75000,
  "annual_salary": 900000
}
```

**Status Codes:**
- `200 OK` - File uploaded and verified successfully
- `400 Bad Request` - Invalid file type or exceeds size limit
- `422 Unprocessable Entity` - Missing required parameters

### GET /mock/salary/{file_id}

**Purpose:** Retrieve salary verification details by file_id.

**Request:**
```
Method: GET
URL: /mock/salary/{file_id}
```

**Response:**
```json
{
  "status": "success",
  "file_id": "test_session_001_e318caba",
  "monthly_salary": 75000,
  "annual_salary": 900000,
  "verification_date": "2025-12-11T19:43:32.341Z"
}
```

**Status Codes:**
- `200 OK` - Salary verification found
- `404 Not Found` - file_id not found in database

## Synthetic Salary Mapping

The endpoint uses deterministic salary mapping based on customer_id:

| Customer ID | Monthly Salary | Annual Salary | Customer Name    |
|-------------|----------------|---------------|------------------|
| cust_001    | ₹75,000        | ₹900,000      | Rajesh Kumar     |
| cust_002    | ₹120,000       | ₹1,440,000    | Priya Sharma     |
| cust_003    | ₹60,000        | ₹720,000      | Amit Patel       |
| (default)   | ₹85,000        | ₹1,020,000    | Default Profile  |

## Integration with UnderwritingAgent

### Flow Diagram
```
1. User uploads salary file
   ↓
2. /mock/upload_salary generates file_id
   ↓
3. file_id stored in session.salary_file_id
   ↓
4. UnderwritingAgent.handle(context) called with salary_file_id
   ↓
5. Agent retrieves salary via MockDocumentVerification.get_salary_by_file_id()
   ↓
6. EMI ratio calculated: EMI ÷ Monthly Salary × 100%
   ↓
7. Approval decision: ≤50% → Approve, >50% → Reject
```

### Context Parameters

**Required Parameters:**
```python
context = {
    'customer_id': 'cust_001',           # Must match database customer
    'loan_amount': 1000000,              # Loan in rupees
    'tenure': 60,                        # Months
    'salary_file_id': 'file_id_12345'    # From /mock/upload_salary
}
```

**Optional Parameters:**
```python
context = {
    'salary_check': {...}               # Direct salary dict (overrides file_id)
}
```

### Code Example

```python
import asyncio
from backend.agents.workers import UnderwritingAgent

async def check_loan_with_salary():
    # Step 1: Upload salary document (via REST API)
    # POST /mock/upload_salary?session_id=loan_session_001
    # Returns: {"file_id": "loan_session_001_abc12345", "monthly_salary": 75000}
    
    file_id = "loan_session_001_abc12345"
    
    # Step 2: Create underwriting agent
    agent = UnderwritingAgent()
    
    # Step 3: Prepare context with salary_file_id
    context = {
        'customer_id': 'cust_001',
        'loan_amount': 1125000,  # ₹11.25 lakh
        'tenure': 60,            # 5 years
        'salary_file_id': file_id
    }
    
    # Step 4: Run underwriting with salary verification
    result = await agent.handle(context)
    
    # Step 5: Process result
    if result['type'] == 'approval':
        approval = result['payload']
        print(f"✅ Approved: EMI = ₹{approval['emi']}")
    else:
        print(f"❌ Rejected: {result['payload']['message']}")

# Run the async function
asyncio.run(check_loan_with_salary())
```

## Session State

After uploading a salary file, the session is updated with:

```python
_sessions[session_id] = {
    'customer_id': 'cust_001',
    'salary_file_id': 'test_session_001_e318caba',
    'salary_check': {
        'file_id': 'test_session_001_e318caba',
        'monthly_salary': 75000,
        'annual_salary': 900000,
        'document_type': 'salary_slip',
        'verification_date': '2025-12-11T19:43:32.341Z'
    }
}
```

This data persists for the agent to access during underwriting.

## EMI Calculation & Approval Logic

### Calculation
```
Monthly Interest Rate = Annual Interest Rate ÷ 12 ÷ 100
EMI = (Principal × Monthly Rate × (1 + Monthly Rate)^Months) / 
      ((1 + Monthly Rate)^Months - 1)
```

### Approval Criteria
```
Approval if: EMI ÷ Monthly Salary ≤ 0.50 (50%)
Rejection if: EMI ÷ Monthly Salary > 0.50 (50%)
```

### Example
```
Customer: cust_001
Monthly Salary: ₹75,000
Loan Amount: ₹1,125,000
Tenure: 60 months (5 years)
Interest Rate: 10.5% p.a.

EMI Calculation:
  Monthly Rate = 10.5 ÷ 12 ÷ 100 = 0.00875
  EMI = ₹23,893.58

Ratio Check:
  Ratio = ₹23,893.58 ÷ ₹75,000 = 31.86%
  31.86% ≤ 50% → ✅ APPROVED
```

## cURL Examples

### Upload Salary Document
```bash
# Create test file
echo "SALARY SLIP - Monthly Salary Rs. 75,000" > salary.txt

# Upload with file extension as PDF (for testing)
curl -X POST "http://localhost:8000/mock/upload_salary?session_id=test_001" \
  -F "file=@salary.txt;filename=salary.pdf" \
  -H "Content-Type: multipart/form-data"
```

**Response:**
```json
{
  "file_id": "test_001_abc12345",
  "session_id": "test_001",
  "status": "success",
  "message": "Salary document verified successfully (Mock OCR)",
  "monthly_salary": 85000,
  "annual_salary": 1020000
}
```

### Retrieve Salary by File ID
```bash
curl -X GET "http://localhost:8000/mock/salary/test_001_abc12345"
```

**Response:**
```json
{
  "status": "success",
  "file_id": "test_001_abc12345",
  "monthly_salary": 85000,
  "annual_salary": 1020000,
  "verification_date": "2025-12-11T19:43:32.341Z"
}
```

## Python Integration Example

### Using TestClient (Testing)
```python
from fastapi.testclient import TestClient
from backend.app import app
from io import BytesIO

client = TestClient(app)

# Upload salary
response = client.post(
    "/mock/upload_salary",
    params={"session_id": "loan_123"},
    files={"file": ("salary.pdf", BytesIO(b"PDF Content"), "application/pdf")}
)

file_id = response.json()['file_id']
print(f"File ID: {file_id}")

# Retrieve salary
response = client.get(f"/mock/salary/{file_id}")
salary_data = response.json()
print(f"Monthly Salary: ₹{salary_data['monthly_salary']:,.2f}")
```

### Using httpx (Async Client)
```python
import httpx
import asyncio

async def upload_and_verify():
    async with httpx.AsyncClient() as client:
        # Upload salary
        with open("salary.pdf", "rb") as f:
            response = await client.post(
                "http://localhost:8000/mock/upload_salary?session_id=loan_123",
                files={"file": ("salary.pdf", f, "application/pdf")}
            )
        
        file_id = response.json()['file_id']
        
        # Retrieve salary
        response = await client.get(f"http://localhost:8000/mock/salary/{file_id}")
        salary_data = response.json()
        print(f"Monthly Salary: ₹{salary_data['monthly_salary']:,.2f}")

asyncio.run(upload_and_verify())
```

## Error Handling

### Invalid File Type
```json
{
  "detail": "Invalid file type: .txt. Allowed: {'.jpeg', '.pdf', '.png', '.jpg'}"
}
```

**Status Code:** 400

### File Not Found (by file_id)
```json
{
  "detail": "Salary verification not found for file_id: invalid_id"
}
```

**Status Code:** 404

### Missing Session
If `session_id` is not found, a new session is automatically created:
```python
_sessions[session_id] = {
    'customer_id': 'default',
    'salary_check': {...}
}
```

## Implementation Details

### File Storage
- **Location:** `uploads/` directory
- **Naming:** `salary_{session_id}_{file_id}_{original_name}`
- **Cleanup:** Files persist for session lifetime

### File ID Format
```
{session_id}_{uuid_hex[:8]}

Example: test_session_001_e318caba
```

### Session Persistence
- Stored in `_sessions` dictionary in memory
- Persists across multiple requests in same session
- Data available to UnderwritingAgent for decision-making

### MockDocumentVerification Class
```python
class MockDocumentVerification:
    _salary_database = {}  # Stores file_id → salary mappings
    
    @staticmethod
    def store_salary_verification(file_id: str, monthly_salary: float):
        """Store salary verification data"""
        _salary_database[file_id] = {
            'status': 'verified',
            'file_id': file_id,
            'monthly_salary': monthly_salary,
            'annual_salary': monthly_salary * 12,
            'verification_date': datetime.now().isoformat()
        }
    
    @staticmethod
    async def get_salary_by_file_id(file_id: str):
        """Retrieve salary by file_id"""
        return _salary_database.get(file_id, {
            'status': 'not_found',
            'error': f'File ID {file_id} not found'
        })
```

## Testing

### Run Full Test Suite
```bash
python test_mock_salary_upload.py
```

### Test Output
```
================================================================================
TEST: Mock Salary Upload Endpoint
================================================================================

1️⃣  Uploading salary file...
   Status: success
   File ID: test_session_001_e318caba
   Monthly Salary: ₹75,000.00
   Annual Salary: ₹900,000.00
   ✅ Upload successful!

2️⃣  Retrieving salary verification by file_id...
   Status: success
   ✅ Retrieval successful!

3️⃣  Checking session state...
   ✅ Session updated correctly!

4️⃣  Testing with different customer (cust_002)...
   ✅ Customer-based salary mapping works!

5️⃣  Testing invalid file type...
   ✅ File type validation works!
```

## Complete End-to-End Workflow

```python
import asyncio
from fastapi.testclient import TestClient
from backend.app import app, _sessions
from backend.agents.workers import UnderwritingAgent
from io import BytesIO

async def complete_loan_workflow():
    client = TestClient(app)
    
    # Step 1: Initialize session with customer
    session_id = "workflow_001"
    _sessions[session_id] = {'customer_id': 'cust_002'}  # Priya Sharma, ₹120K
    
    # Step 2: Upload salary document
    print("📄 Uploading salary document...")
    response = client.post(
        "/mock/upload_salary",
        params={"session_id": session_id},
        files={"file": ("salary.pdf", BytesIO(b"Salary slip content"), "application/pdf")}
    )
    file_id = response.json()['file_id']
    monthly_salary = response.json()['monthly_salary']
    print(f"   ✅ File ID: {file_id}, Monthly Salary: ₹{monthly_salary:,.0f}\n")
    
    # Step 3: Run underwriting with salary verification
    print("🏦 Running underwriting agent...")
    agent = UnderwritingAgent()
    context = {
        'customer_id': 'cust_002',
        'loan_amount': 2000000,  # ₹20 lakh
        'tenure': 60,
        'salary_file_id': file_id
    }
    
    result = await agent.handle(context)
    
    if result['type'] == 'approval':
        print(f"   ✅ APPROVED!")
        print(f"   EMI: ₹{result['payload']['emi']:,.2f}")
        print(f"   Monthly Salary: ₹{monthly_salary:,.2f}")
        print(f"   Ratio: {(result['payload']['emi'] / monthly_salary * 100):.1f}%\n")
    else:
        print(f"   ❌ REJECTED")
        print(f"   Reason: {result['payload']['message']}\n")

asyncio.run(complete_loan_workflow())
```

## Future Enhancements

1. **Real OCR Integration:** Replace mock OCR with actual document parsing
2. **Multiple Documents:** Support salary slips + employment letters
3. **Historical Salary:** Track salary trends over time
4. **Document Verification:** Add digital signature verification
5. **Automated Queries:** Send queries to employer for verification
6. **Document Expiry:** Set salary verification expiry dates

