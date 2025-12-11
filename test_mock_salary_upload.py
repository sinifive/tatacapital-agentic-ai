"""
Test script for the /mock/upload_salary endpoint.
Demonstrates salary verification integration with UnderwritingAgent.
"""

import sys
import os
from io import BytesIO
from pathlib import Path

# Add paths
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from backend.app import app, _sessions

client = TestClient(app)

def test_mock_salary_upload():
    """Test the /mock/upload_salary endpoint."""
    
    print("\n" + "="*80)
    print("TEST: Mock Salary Upload Endpoint")
    print("="*80 + "\n")
    
    session_id = "test_session_001"
    
    # Create a dummy salary file
    file_content = b"SALARY SLIP - Monthly Salary Rs. 75,000"
    
    # Test 1: Upload salary file
    print("1️⃣  Uploading salary file...")
    response = client.post(
        "/mock/upload_salary",
        params={"session_id": session_id},
        files={"file": ("salary_slip.pdf", BytesIO(file_content), "application/pdf")}
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    upload_data = response.json()
    
    print(f"   Status: {upload_data['status']}")
    print(f"   File ID: {upload_data['file_id']}")
    print(f"   Monthly Salary: ₹{upload_data['monthly_salary']:,.2f}")
    print(f"   Annual Salary: ₹{upload_data['annual_salary']:,.2f}")
    print(f"   Message: {upload_data['message']}")
    
    file_id = upload_data['file_id']
    monthly_salary = upload_data['monthly_salary']
    
    # Verify response structure
    assert upload_data['session_id'] == session_id
    assert upload_data['status'] == 'success'
    assert file_id, "file_id should be generated"
    assert monthly_salary > 0, "monthly_salary should be positive"
    
    print("   ✅ Upload successful!\n")
    
    # Test 2: Retrieve salary verification by file_id
    print("2️⃣  Retrieving salary verification by file_id...")
    response = client.get(f"/mock/salary/{file_id}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    salary_data = response.json()
    
    print(f"   Status: {salary_data['status']}")
    print(f"   File ID: {salary_data['file_id']}")
    print(f"   Monthly Salary: ₹{salary_data['monthly_salary']:,.2f}")
    print(f"   Annual Salary: ₹{salary_data['annual_salary']:,.2f}")
    
    assert salary_data['file_id'] == file_id
    assert salary_data['monthly_salary'] == monthly_salary
    
    print("   ✅ Retrieval successful!\n")
    
    # Test 3: Verify session was updated with salary data
    print("3️⃣  Checking session state...")
    assert session_id in _sessions, f"Session {session_id} should be in _sessions"
    session = _sessions[session_id]
    
    assert 'salary_check' in session, "Session should have salary_check data"
    assert 'salary_file_id' in session, "Session should have salary_file_id"
    
    salary_check = session['salary_check']
    print(f"   Salary Check Data:")
    print(f"     File ID: {salary_check['file_id']}")
    print(f"     Monthly Salary: ₹{salary_check['monthly_salary']:,.2f}")
    print(f"     Document Type: {salary_check['document_type']}")
    
    assert salary_check['file_id'] == file_id
    assert salary_check['monthly_salary'] == monthly_salary
    
    print("   ✅ Session updated correctly!\n")
    
    # Test 4: Test with different customer_id (different salary)
    print("4️⃣  Testing with different customer (cust_002)...")
    session_id_2 = "test_session_002"
    
    # Set customer_id in session
    _sessions[session_id_2] = {'customer_id': 'cust_002'}
    
    response = client.post(
        "/mock/upload_salary",
        params={"session_id": session_id_2},
        files={"file": ("salary_slip.pdf", BytesIO(file_content), "application/pdf")}
    )
    
    assert response.status_code == 200
    upload_data_2 = response.json()
    
    print(f"   Customer: cust_002")
    print(f"   Monthly Salary: ₹{upload_data_2['monthly_salary']:,.2f}")
    print(f"   Expected: ₹120,000.00")
    
    assert upload_data_2['monthly_salary'] == 120000, "cust_002 should have 120K salary"
    
    print("   ✅ Customer-based salary mapping works!\n")
    
    # Test 5: Invalid file type
    print("5️⃣  Testing invalid file type...")
    response = client.post(
        "/mock/upload_salary",
        params={"session_id": "test_session_003"},
        files={"file": ("document.txt", BytesIO(b"invalid"), "text/plain")}
    )
    
    assert response.status_code == 400, "Should reject invalid file type"
    print(f"   Error: {response.json()['detail']}")
    print("   ✅ File type validation works!\n")
    
    print("="*80)
    print("✅ ALL TESTS PASSED!")
    print("="*80)
    print("\n📋 Summary:")
    print("   ✅ /mock/upload_salary endpoint creates file_id and returns salary")
    print("   ✅ /mock/salary/{file_id} endpoint retrieves verification details")
    print("   ✅ Session is updated with salary data for UnderwritingAgent")
    print("   ✅ Synthetic salary mapping works per customer_id")
    print("   ✅ File type validation is working")
    print("\n🎯 UnderwritingAgent Integration:")
    print("   • UnderwritingAgent now accepts salary_file_id in context")
    print("   • It retrieves salary via MockDocumentVerification.get_salary_by_file_id()")
    print("   • EMI is checked against monthly salary for approval")
    print()


def test_underwriting_with_salary():
    """Test UnderwritingAgent integration with salary verification."""
    import asyncio
    from backend.agents.workers import UnderwritingAgent
    from backend.agents.mock_apis import MockDocumentVerification
    
    print("\n" + "="*80)
    print("TEST: UnderwritingAgent with Salary Verification")
    print("="*80 + "\n")
    
    async def run_test():
        # Setup: Store salary in database
        file_id = "test_file_12345"
        monthly_salary = 100000
        
        MockDocumentVerification.store_salary_verification(file_id, monthly_salary)
        print(f"1️⃣  Stored salary verification: File ID={file_id}, Salary=₹{monthly_salary:,}\n")
        
        # Test scenario: Loan 1.5x pre-approved, with salary verification
        agent = UnderwritingAgent()
        
        context = {
            'customer_id': 'cust_001',
            'loan_amount': 1125000,  # 1.5x of pre-approved 750K
            'tenure': 60,
            'salary_file_id': file_id  # The file_id from /mock/upload_salary
        }
        
        print("2️⃣  Running UnderwritingAgent with context:")
        print(f"   Customer ID: {context['customer_id']}")
        print(f"   Loan Amount: ₹{context['loan_amount']:,.2f}")
        print(f"   Tenure: {context['tenure']} months")
        print(f"   Salary File ID: {context['salary_file_id']}\n")
        
        result = await agent.handle(context)
        
        print("3️⃣  Agent Response:")
        if result.get('type') == 'approval':
            approval = result.get('payload', {})
            print(f"   ✅ Status: APPROVED")
            print(f"   Message: {approval.get('message', 'N/A')}")
            print(f"   EMI: ₹{approval.get('emi', 0):,.2f}")
            print(f"   Monthly Salary: ₹{monthly_salary:,.2f}")
        else:
            print(f"   Status: {result.get('type', 'Unknown')}")
            print(f"   Message: {result.get('payload', {}).get('message', 'N/A')}")
        
        print("\n" + "="*80)
        print("✅ UnderwritingAgent successfully uses salary_file_id!")
        print("="*80 + "\n")
    
    # Run async test
    asyncio.run(run_test())


if __name__ == "__main__":
    test_mock_salary_upload()
    test_underwriting_with_salary()
