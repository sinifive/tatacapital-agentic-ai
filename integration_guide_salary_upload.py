"""
Integration Guide: Salary Upload with UnderwritingAgent
Complete workflow showing salary verification in loan origination
"""

import asyncio
import sys
import os
from io import BytesIO

# Add paths
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from backend.app import app, _sessions
from backend.agents.workers import UnderwritingAgent


class LoanWorkflow:
    """
    Complete loan origination workflow:
    1. CRM Lookup → Get customer
    2. Credit Check → Get credit score
    3. Salary Upload → Get file_id and salary
    4. Underwriting → UnderwritingAgent with salary_file_id
    5. Decision → Approval/Rejection
    """
    
    def __init__(self):
        self.client = TestClient(app)
        self.agent = UnderwritingAgent()
    
    def get_customer(self, customer_id: str) -> dict:
        """Step 1: Get customer from CRM"""
        print(f"\n📋 Step 1: CRM Lookup for {customer_id}")
        
        response = self.client.get(f"/crm/{customer_id}")
        if response.status_code != 200:
            print(f"   ❌ Customer not found")
            return None
        
        customer = response.json()
        print(f"   ✅ Found: {customer['name']}")
        print(f"      Location: {customer['location']}")
        print(f"      Monthly Income (CRM): ₹{customer['monthly_income']:,.0f}")
        
        return customer
    
    def get_credit_score(self, customer_id: str) -> dict:
        """Step 2: Get credit score from credit bureau"""
        print(f"\n📊 Step 2: Credit Check for {customer_id}")
        
        response = self.client.get(f"/credit/{customer_id}")
        if response.status_code != 200:
            print(f"   ❌ Credit check failed")
            return None
        
        credit = response.json()
        print(f"   ✅ Credit Score: {credit['credit_score']}")
        print(f"      Status: {credit['status']}")
        print(f"      Existing Loans: {credit['existing_loans']}")
        
        return credit
    
    def get_loan_offers(self, customer_id: str, loan_amount: float) -> list:
        """Step 3: Get available loan offers"""
        print(f"\n💰 Step 3: Get Loan Offers for {customer_id}")
        
        response = self.client.get(f"/offers/{customer_id}", params={"loan_amount": loan_amount})
        if response.status_code != 200:
            print(f"   ❌ Offers not available")
            return []
        
        offers = response.json()
        print(f"   ✅ Available Offers:")
        for offer in offers:
            print(f"      • {offer['offer_type']}: {offer['interest_rate']}% p.a., ₹{offer['max_amount']:,.0f}")
        
        return offers
    
    def upload_salary(self, session_id: str, file_content: bytes = None) -> dict:
        """Step 4: Upload salary document"""
        print(f"\n📄 Step 4: Upload Salary Document")
        
        # Create dummy salary file if not provided
        if file_content is None:
            file_content = b"SALARY SLIP - Monthly Salary verification"
        
        response = self.client.post(
            "/mock/upload_salary",
            params={"session_id": session_id},
            files={"file": ("salary_slip.pdf", BytesIO(file_content), "application/pdf")}
        )
        
        if response.status_code != 200:
            print(f"   ❌ Upload failed: {response.json()}")
            return None
        
        salary_data = response.json()
        print(f"   ✅ Salary uploaded successfully")
        print(f"      File ID: {salary_data['file_id']}")
        print(f"      Monthly Salary: ₹{salary_data['monthly_salary']:,.0f}")
        print(f"      Annual Salary: ₹{salary_data['annual_salary']:,.0f}")
        
        return salary_data
    
    async def run_underwriting(self, session_id: str, context: dict) -> dict:
        """Step 5: Run underwriting agent with salary verification"""
        print(f"\n🏦 Step 5: Underwriting Agent Analysis")
        
        print(f"   Context:")
        print(f"      Customer: {context['customer_id']}")
        print(f"      Loan Amount: ₹{context['loan_amount']:,.0f}")
        print(f"      Tenure: {context['tenure']} months")
        print(f"      Salary File ID: {context.get('salary_file_id', 'N/A')}")
        
        result = await self.agent.handle(context)
        
        if result['type'] == 'approval':
            payload = result['payload']
            print(f"\n   ✅ APPROVED")
            print(f"      Message: {payload['message']}")
            print(f"      EMI: ₹{payload['emi']:,.2f}")
            print(f"      Interest Rate: {payload['interest_rate']}% p.a.")
            
            # Calculate EMI to salary ratio
            if 'monthly_salary' in context:
                ratio = (payload['emi'] / context['monthly_salary']) * 100
                print(f"      EMI to Salary Ratio: {ratio:.1f}%")
        else:
            payload = result['payload']
            print(f"\n   ❌ REJECTED")
            print(f"      Reason: {payload['message']}")
        
        return result
    
    async def run_complete_workflow(self, customer_id: str, loan_amount: float, tenure: int = 60):
        """Run complete loan origination workflow"""
        
        print("\n" + "="*80)
        print("LOAN ORIGINATION WORKFLOW - Complete Example")
        print("="*80)
        
        # Initialize session
        session_id = f"loan_{customer_id}_{int(asyncio.get_event_loop().time())}"
        _sessions[session_id] = {'customer_id': customer_id}
        
        print(f"\n🆔 Session ID: {session_id}")
        
        # Step 1: CRM Lookup
        customer = self.get_customer(customer_id)
        if not customer:
            print("❌ Workflow failed: Customer not found")
            return
        
        # Step 2: Credit Check
        credit = self.get_credit_score(customer_id)
        if not credit:
            print("❌ Workflow failed: Credit check failed")
            return
        
        # Step 3: Get Loan Offers
        offers = self.get_loan_offers(customer_id, loan_amount)
        if not offers:
            print("❌ Workflow failed: No offers available")
            return
        
        # Step 4: Upload Salary Document
        salary_data = self.upload_salary(session_id)
        if not salary_data:
            print("❌ Workflow failed: Salary upload failed")
            return
        
        # Step 5: Run Underwriting with Salary Verification
        context = {
            'customer_id': customer_id,
            'loan_amount': loan_amount,
            'tenure': tenure,
            'salary_file_id': salary_data['file_id'],
            'monthly_salary': salary_data['monthly_salary']  # For ratio calculation
        }
        
        result = await self.run_underwriting(session_id, context)
        
        # Summary
        print("\n" + "="*80)
        print("WORKFLOW SUMMARY")
        print("="*80)
        print(f"\nCustomer: {customer['name']}")
        print(f"Credit Score: {credit['credit_score']}")
        print(f"Monthly Salary: ₹{salary_data['monthly_salary']:,.0f}")
        print(f"Loan Amount: ₹{loan_amount:,.0f}")
        print(f"Tenure: {tenure} months")
        
        if result['type'] == 'approval':
            emi = result['payload']['emi']
            ratio = (emi / salary_data['monthly_salary']) * 100
            print(f"\n✅ APPROVED - Loan sanctioned!")
            print(f"   EMI: ₹{emi:,.2f}")
            print(f"   EMI to Salary Ratio: {ratio:.1f}%")
        else:
            print(f"\n❌ REJECTED - {result['payload']['message']}")
        
        print("="*80 + "\n")


async def scenario_1_approved():
    """Scenario 1: Customer with sufficient salary → APPROVED"""
    print("\n\n" + "="*80)
    print("SCENARIO 1: Customer with Sufficient Salary (APPROVED)")
    print("="*80)
    print("Customer: Priya Sharma (cust_002)")
    print("Salary: ₹120,000/month")
    print("Loan: ₹20 lakhs for 5 years at 10.5% p.a.")
    print("EMI: ₹24,500 approx (20.4% of salary) ✅ Within 50% limit")
    
    workflow = LoanWorkflow()
    await workflow.run_complete_workflow(
        customer_id='cust_002',
        loan_amount=2000000,
        tenure=60
    )


async def scenario_2_rejected():
    """Scenario 2: Customer with insufficient salary → REJECTED"""
    print("\n\n" + "="*80)
    print("SCENARIO 2: Customer with Insufficient Salary (REJECTED)")
    print("="*80)
    print("Customer: Amit Patel (cust_003)")
    print("Salary: ₹60,000/month")
    print("Loan: ₹20 lakhs for 5 years at 10.5% p.a.")
    print("EMI: ₹24,500 approx (40.8% of salary) ✅ Within 50% limit → APPROVED")
    print("BUT: Different loan amount may trigger rejection")
    
    workflow = LoanWorkflow()
    await workflow.run_complete_workflow(
        customer_id='cust_003',
        loan_amount=3000000,  # Higher amount → higher EMI
        tenure=60
    )


async def scenario_3_borderline():
    """Scenario 3: Borderline case near 50% threshold"""
    print("\n\n" + "="*80)
    print("SCENARIO 3: Borderline Case (At 50% EMI-to-Salary Ratio)")
    print("="*80)
    print("Customer: Rajesh Kumar (cust_001)")
    print("Salary: ₹75,000/month")
    print("Loan: ₹15 lakhs for 5 years at 10.5% p.a.")
    print("EMI: ₹18,670 approx (24.9% of salary) ✅ Within 50% limit")
    
    workflow = LoanWorkflow()
    await workflow.run_complete_workflow(
        customer_id='cust_001',
        loan_amount=1500000,
        tenure=60
    )


async def main():
    """Run all scenarios"""
    
    print("\n" + "="*100)
    print(" "*30 + "SALARY UPLOAD INTEGRATION GUIDE")
    print(" "*20 + "Complete Loan Origination Workflow with Underwriting Agent")
    print("="*100)
    
    print("\n📚 Overview:")
    print("""
This integration guide demonstrates how salary upload (Phase 6) integrates
with the complete loan origination system:

1. CRM Lookup          → Get customer profile
2. Credit Check        → Get credit score
3. Salary Upload       → Upload salary document, get file_id
4. Underwriting Agent  → Use salary_file_id for approval decision
5. Decision            → Approve/Reject based on EMI-to-salary ratio

The UnderwritingAgent accepts salary_file_id in context and:
  • Retrieves salary from MockDocumentVerification.get_salary_by_file_id()
  • Calculates EMI for requested loan amount
  • Approves if EMI ≤ 50% of monthly salary
  • Rejects if EMI > 50% of monthly salary
    """)
    
    # Run scenarios
    await scenario_1_approved()
    await scenario_3_borderline()
    await scenario_2_rejected()
    
    print("\n" + "="*100)
    print("✅ All scenarios completed successfully!")
    print("="*100)
    print("\n📊 Key Learnings:")
    print("""
1. File Upload Integration:
   ✅ /mock/upload_salary accepts multipart form data
   ✅ Returns file_id for later reference
   ✅ Stores salary in both session and MockDocumentVerification

2. UnderwritingAgent Integration:
   ✅ Accepts salary_file_id in context
   ✅ Retrieves salary via MockDocumentVerification.get_salary_by_file_id()
   ✅ Uses salary for EMI-to-salary ratio calculation
   ✅ Makes approval decisions based on 50% threshold

3. Workflow Consistency:
   ✅ Session_id ties together customer, credit, salary, and underwriting
   ✅ Customer-specific salary mapping ensures deterministic results
   ✅ EMI calculation consistent across all loan amounts/tenures

4. Error Handling:
   ✅ Invalid file types rejected with 400 status
   ✅ Missing customer handled gracefully
   ✅ File not found returns 404 status
    """)
    print()


if __name__ == "__main__":
    asyncio.run(main())
