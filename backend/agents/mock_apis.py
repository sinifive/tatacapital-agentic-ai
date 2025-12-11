"""
Mock API services for testing without external dependencies.
"""
import random
from typing import Dict, Any

class MockOfferMart:
    """Mock Offer Mart API for loan product suggestions."""
    
    @staticmethod
    async def get_offers(loan_amount: float, tenure_months: int) -> Dict[str, Any]:
        """
        Get loan offers based on amount and tenure.
        
        Args:
            loan_amount: Requested loan amount
            tenure_months: Desired tenure in months
            
        Returns:
            Dictionary with available offers
        """
        # Mock interest rate calculation (decreases with loan amount)
        base_rate = 12.5
        amount_factor = min(loan_amount / 1000000, 0.08)  # Up to 8% discount for large loans
        interest_rate = base_rate - amount_factor
        
        # Calculate EMI
        monthly_rate = interest_rate / 100 / 12
        if monthly_rate == 0:
            emi = loan_amount / tenure_months
        else:
            emi = (loan_amount * monthly_rate * (1 + monthly_rate) ** tenure_months) / \
                  ((1 + monthly_rate) ** tenure_months - 1)
        
        return {
            "status": "success",
            "offers": [
                {
                    "product_id": "personal_loan_1",
                    "product_name": "Personal Loan - Standard",
                    "loan_amount": loan_amount,
                    "interest_rate": round(interest_rate, 2),
                    "tenure_months": tenure_months,
                    "emi": round(emi, 2),
                    "total_interest": round(emi * tenure_months - loan_amount, 2),
                    "processing_fee": round(loan_amount * 0.01, 2)
                },
                {
                    "product_id": "personal_loan_2",
                    "product_name": "Personal Loan - Premium",
                    "loan_amount": loan_amount,
                    "interest_rate": round(interest_rate - 0.5, 2),
                    "tenure_months": tenure_months,
                    "emi": round(emi * 0.98, 2),
                    "total_interest": round(emi * 0.98 * tenure_months - loan_amount, 2),
                    "processing_fee": round(loan_amount * 0.015, 2)
                }
            ]
        }

class MockCRM:
    """Mock CRM API for customer KYC verification."""
    
    # Mock customer database
    CUSTOMERS = {
        "cust_001": {"name": "Rajesh Kumar", "phone": "9876543210", "address": "Mumbai, India", "email": "rajesh@example.com"},
        "cust_002": {"name": "Priya Sharma", "phone": "9876543211", "address": "Delhi, India", "email": "priya@example.com"},
        "cust_003": {"name": "Amit Patel", "phone": "9876543212", "address": "Bangalore, India", "email": "amit@example.com"},
    }
    
    @staticmethod
    async def verify_customer(customer_id: str, phone: str = None) -> Dict[str, Any]:
        """
        Verify customer KYC in CRM.
        
        Args:
            customer_id: Customer identifier
            phone: Phone number for verification
            
        Returns:
            Customer KYC data
        """
        customer = MockCRM.CUSTOMERS.get(customer_id)
        
        if not customer:
            return {
                "status": "not_found",
                "message": "Customer not found in CRM"
            }
        
        if phone and customer['phone'] != phone:
            return {
                "status": "phone_mismatch",
                "message": "Phone number does not match CRM records"
            }
        
        return {
            "status": "verified",
            "customer_id": customer_id,
            "kyc_fields": {
                "name": customer['name'],
                "phone": customer['phone'],
                "address": customer['address'],
                "email": customer['email'],
                "kyc_verified": True,
                "kyc_date": "2025-01-15"
            }
        }

class MockCreditBureau:
    """Mock Credit Bureau API for credit score retrieval."""
    
    @staticmethod
    async def get_credit_score(customer_id: str, phone: str = None) -> Dict[str, Any]:
        """
        Get customer credit score from mock credit bureau.
        
        Args:
            customer_id: Customer identifier
            phone: Phone number for verification
            
        Returns:
            Credit score and underwriting limits
        """
        # Simulate credit scores between 600-900
        credit_score = random.randint(650, 850)
        
        # Pre-approved amount based on credit score
        if credit_score >= 800:
            pre_approved = 1000000
        elif credit_score >= 750:
            pre_approved = 750000
        elif credit_score >= 700:
            pre_approved = 500000
        elif credit_score >= 650:
            pre_approved = 300000
        else:
            pre_approved = 100000
        
        return {
            "status": "success",
            "customer_id": customer_id,
            "credit_score": credit_score,
            "credit_rating": "Good" if credit_score >= 700 else "Fair",
            "pre_approved_amount": pre_approved,
            "max_multiplier": 2.0,  # Can borrow up to 2x pre-approved
            "last_updated": "2025-12-01"
        }

class MockDocumentVerification:
    """Mock document verification service."""
    
    # Store file_id -> salary mapping for retrieval
    _salary_database: Dict[str, float] = {}
    
    @staticmethod
    def store_salary_verification(file_id: str, monthly_salary: float):
        """Store salary verification for later retrieval."""
        MockDocumentVerification._salary_database[file_id] = monthly_salary
    
    @staticmethod
    async def get_salary_by_file_id(file_id: str) -> Dict[str, Any]:
        """
        Retrieve salary verification by file_id.
        
        Args:
            file_id: File identifier from salary upload
            
        Returns:
            Salary verification result
        """
        if file_id not in MockDocumentVerification._salary_database:
            return {
                "status": "not_found",
                "error": f"Salary verification not found for file_id: {file_id}"
            }
        
        monthly_salary = MockDocumentVerification._salary_database[file_id]
        return {
            "status": "verified",
            "file_id": file_id,
            "monthly_salary": monthly_salary,
            "annual_salary": monthly_salary * 12,
            "employment_status": "salaried",
            "verification_date": "2025-12-11"
        }
    
    @staticmethod
    async def verify_salary_slip(file_path: str) -> Dict[str, Any]:
        """
        Verify salary slip document.
        
        Args:
            file_path: Path to salary slip
            
        Returns:
            Verification result with salary details
        """
        # Mock salary extraction - in reality would use OCR
        monthly_salary = random.choice([30000, 50000, 75000, 100000, 150000])
        
        return {
            "status": "verified",
            "file_path": file_path,
            "document_type": "salary_slip",
            "monthly_salary": monthly_salary,
            "annual_salary": monthly_salary * 12,
            "employment_status": "salaried",
            "verification_date": "2025-12-11"
        }

