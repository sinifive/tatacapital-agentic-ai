"""
Integration Guide: Mock Services with Main Backend

This module shows how to integrate the Mock Services API with the main
Tata Capital backend application.
"""

import requests
from typing import Dict, Any, Optional, List


class MockServicesClient:
    """Client for interacting with Mock Services API."""
    
    def __init__(self, base_url: str = "http://localhost:9000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def get_customer_kyc(self, customer_id: str) -> Dict[str, Any]:
        """Get customer KYC information from mock CRM."""
        response = self.session.get(f"{self.base_url}/crm/{customer_id}")
        response.raise_for_status()
        return response.json()
    
    def get_credit_information(self, customer_id: str) -> Dict[str, Any]:
        """Get customer credit score and pre-approved limit."""
        response = self.session.get(f"{self.base_url}/credit/{customer_id}")
        response.raise_for_status()
        return response.json()
    
    def get_eligible_offers(
        self,
        customer_id: str,
        loan_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """Get eligible loan products for customer."""
        params = {}
        if loan_amount:
            params['loan_amount'] = loan_amount
        
        response = self.session.get(
            f"{self.base_url}/offers/{customer_id}",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def calculate_emi(
        self,
        amount: float,
        annual_rate: float,
        months: int
    ) -> Dict[str, Any]:
        """Calculate EMI for a loan."""
        params = {
            'amount': amount,
            'annual_rate': annual_rate,
            'months': months
        }
        
        response = self.session.get(
            f"{self.base_url}/calculate-emi",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_all_customers(self) -> List[Dict[str, Any]]:
        """Get list of all available test customers."""
        response = self.session.get(f"{self.base_url}/customers")
        response.raise_for_status()
        data = response.json()
        return data.get('customers', [])
    
    def health_check(self) -> bool:
        """Check if mock services are running."""
        try:
            response = self.session.get(f"{self.base_url}/health")
            return response.status_code == 200
        except:
            return False


# ============================================================================
# INTEGRATION EXAMPLES
# ============================================================================

def example_1_complete_customer_profile():
    """
    Example 1: Fetch complete customer profile combining all services.
    """
    print("\n" + "="*80)
    print("EXAMPLE 1: Complete Customer Profile")
    print("="*80)
    
    client = MockServicesClient()
    customer_id = "cust_001"
    
    # Get all information
    kyc = client.get_customer_kyc(customer_id)
    credit = client.get_credit_information(customer_id)
    offers = client.get_eligible_offers(customer_id)
    
    # Combine into unified profile
    profile = {
        "customer_id": customer_id,
        "personal_info": {
            "name": kyc['data']['name'],
            "phone": kyc['data']['phone'],
            "email": kyc['data']['email'],
            "city": kyc['data']['city'],
            "employment": {
                "type": kyc['data']['employment_type'],
                "employer": kyc['data']['employer'],
                "annual_income": kyc['data']['annual_income']
            }
        },
        "financial_profile": {
            "credit_score": credit['data']['credit_score'],
            "credit_rating": credit['data']['credit_rating'],
            "pre_approved_limit": credit['data']['pre_approved_limit'],
            "max_multiplier": credit['data']['max_multiplier']
        },
        "kyc_status": {
            "verified": kyc['data']['kyc_verified'],
            "status": kyc['data']['kyc_status'],
            "kyc_date": kyc['data']['kyc_date']
        },
        "eligible_products": {
            "count": offers['product_count'],
            "products": [p['product_name'] for p in offers['eligible_products']]
        }
    }
    
    print(f"\nCustomer: {profile['personal_info']['name']}")
    print(f"City: {profile['personal_info']['city']}")
    print(f"Employer: {profile['personal_info']['employment']['employer']}")
    print(f"\nCredit Score: {profile['financial_profile']['credit_score']}")
    print(f"Credit Rating: {profile['financial_profile']['credit_rating']}")
    print(f"Pre-Approved Limit: ₹{profile['financial_profile']['pre_approved_limit']:,}")
    print(f"\nKYC Status: {profile['kyc_status']['status'].upper()}")
    print(f"\nEligible Loan Products ({profile['eligible_products']['count']}):")
    for product in profile['eligible_products']['products']:
        print(f"  • {product}")
    
    return profile


def example_2_loan_eligibility_check():
    """
    Example 2: Check eligibility for a specific loan amount.
    """
    print("\n" + "="*80)
    print("EXAMPLE 2: Loan Eligibility Check")
    print("="*80)
    
    client = MockServicesClient()
    customer_id = "cust_002"
    requested_amount = 750000
    
    # Check eligibility
    kyc = client.get_customer_kyc(customer_id)
    credit = client.get_credit_information(customer_id)
    offers = client.get_eligible_offers(customer_id, requested_amount)
    
    print(f"\nCustomer: {kyc['data']['name']}")
    print(f"Requested Loan Amount: ₹{requested_amount:,}")
    print(f"Pre-Approved Limit: ₹{credit['data']['pre_approved_limit']:,}")
    print(f"Credit Score: {credit['data']['credit_score']}")
    
    if requested_amount > credit['data']['pre_approved_limit']:
        print(f"\n⚠️  Requested amount exceeds pre-approved limit!")
        print(f"Max possible: ₹{credit['data']['pre_approved_limit']:,}")
    else:
        print(f"\n✅ Requested amount within pre-approved limit")
    
    print(f"\nEligible Products for ₹{requested_amount:,}:")
    if offers['product_count'] == 0:
        print("  ❌ No eligible products for this amount")
    else:
        for product in offers['eligible_products']:
            print(f"\n  • {product['product_name']}")
            print(f"    Interest Rate: {product['base_interest_rate']}%")
            print(f"    Processing Fee: {product['processing_fee_percent']}%")
            print(f"    Tenure: {product['min_tenure']}-{product['max_tenure']} months")
    
    return offers


def example_3_emi_calculations():
    """
    Example 3: Calculate EMI for different loan scenarios.
    """
    print("\n" + "="*80)
    print("EXAMPLE 3: EMI Calculations")
    print("="*80)
    
    client = MockServicesClient()
    
    scenarios = [
        {"amount": 500000, "rate": 12.5, "months": 60, "name": "Personal Loan - 5 Lakhs"},
        {"amount": 1000000, "rate": 12.0, "months": 84, "name": "Personal Loan - 10 Lakhs"},
        {"amount": 5000000, "rate": 10.0, "months": 180, "name": "Home Loan - 50 Lakhs"},
    ]
    
    print("\nLoan Scenarios & EMI Calculations:\n")
    
    for scenario in scenarios:
        result = client.calculate_emi(
            scenario['amount'],
            scenario['rate'],
            scenario['months']
        )
        
        output = result['output']
        print(f"{scenario['name']}")
        print(f"  Loan Amount: ₹{scenario['amount']:,}")
        print(f"  Interest Rate: {scenario['rate']}% p.a.")
        print(f"  Tenure: {scenario['months']} months")
        print(f"  Monthly EMI: ₹{output['monthly_emi']:,.2f}")
        print(f"  Total Interest: ₹{output['total_interest']:,.2f}")
        print(f"  Total Payable: ₹{output['total_amount_payable']:,.2f}")
        print()
    
    return scenarios


def example_4_batch_customer_processing():
    """
    Example 4: Process multiple customers in batch.
    """
    print("\n" + "="*80)
    print("EXAMPLE 4: Batch Customer Processing")
    print("="*80)
    
    client = MockServicesClient()
    
    # Get all customers
    customers = client.get_all_customers()
    
    print(f"\nProcessing {len(customers)} customers...\n")
    print(f"{'Name':<20} {'City':<15} {'Score':<8} {'Pre-Approved':<15} {'Products':<10}")
    print("-" * 70)
    
    eligible_by_rating = {}
    
    for customer in customers:
        customer_id = customer['customer_id']
        credit = client.get_credit_information(customer_id)
        offers = client.get_eligible_offers(customer_id)
        
        score = credit['data']['credit_score']
        rating = credit['data']['credit_rating']
        pre_approved = credit['data']['pre_approved_limit']
        product_count = offers['product_count']
        
        # Track by rating
        if rating not in eligible_by_rating:
            eligible_by_rating[rating] = 0
        eligible_by_rating[rating] += 1
        
        print(f"{customer['name']:<20} {customer['city']:<15} {score:<8} "
              f"₹{pre_approved:>12,} {product_count:<10}")
    
    print("\n" + "-" * 70)
    print("Summary by Credit Rating:")
    for rating in ["Excellent", "Good", "Fair", "Average", "Poor"]:
        if rating in eligible_by_rating:
            count = eligible_by_rating[rating]
            print(f"  {rating:<12}: {count} customer(s)")


def example_5_advanced_eligibility_matrix():
    """
    Example 5: Build eligibility matrix (customer × loan amount).
    """
    print("\n" + "="*80)
    print("EXAMPLE 5: Loan Eligibility Matrix")
    print("="*80)
    
    client = MockServicesClient()
    
    # Test amounts: 250K, 500K, 1M
    test_amounts = [250000, 500000, 1000000]
    test_customers = ["cust_001", "cust_002", "cust_005", "cust_010"]
    
    print("\nEligibility Matrix (✓ = eligible):\n")
    
    # Header
    print(f"{'Customer':<20}", end="")
    for amount in test_amounts:
        print(f"₹{amount//100000:.0f}L".ljust(12), end="")
    print()
    print("-" * 70)
    
    # Rows
    for customer_id in test_customers:
        kyc = client.get_customer_kyc(customer_id)
        print(f"{kyc['data']['name']:<20}", end="")
        
        for amount in test_amounts:
            offers = client.get_eligible_offers(customer_id, amount)
            status = "✓" if offers['product_count'] > 0 else "✗"
            print(status.ljust(12), end="")
        print()


def example_6_dynamic_offer_recommendation():
    """
    Example 6: Recommend best offer based on customer profile.
    """
    print("\n" + "="*80)
    print("EXAMPLE 6: Smart Offer Recommendation")
    print("="*80)
    
    client = MockServicesClient()
    customer_id = "cust_006"
    
    kyc = client.get_customer_kyc(customer_id)
    credit = client.get_credit_information(customer_id)
    offers_response = client.get_eligible_offers(customer_id)
    
    customer_name = kyc['data']['name']
    score = credit['data']['credit_score']
    pre_approved = credit['data']['pre_approved_limit']
    
    print(f"\nCustomer: {customer_name}")
    print(f"Credit Score: {score} (Excellent)")
    print(f"Pre-Approved: ₹{pre_approved:,}\n")
    
    # Recommendation logic
    recommendation = None
    if score >= 800 and pre_approved >= 900000:
        recommendation = "Personal Loan - Premium"
    elif score >= 750:
        recommendation = "Personal Loan - Standard"
    else:
        recommendation = "Personal Loan - Standard"
    
    print(f"Recommended Product: {recommendation}")
    
    # Show benefits
    for product in offers_response['eligible_products']:
        if product['product_name'] == recommendation:
            print(f"\nBenefits:")
            for feature in product['features']:
                print(f"  ✓ {feature}")
            print(f"\nApproval Time: {product['approval_time']}")
            print(f"Interest Rate: {product['base_interest_rate']}%")
            print(f"Processing Fee: {product['processing_fee_percent']}%")


# ============================================================================
# FASTAPI INTEGRATION EXAMPLE
# ============================================================================

async_example = """
# Integration in FastAPI backend/app.py

from fastapi import APIRouter, HTTPException
from integration_guide import MockServicesClient

mock_client = MockServicesClient("http://localhost:9000")

@app.get("/api/customer/{customer_id}/profile")
async def get_customer_profile(customer_id: str):
    '''Get unified customer profile combining all external services.'''
    try:
        kyc = mock_client.get_customer_kyc(customer_id)
        credit = mock_client.get_credit_information(customer_id)
        offers = mock_client.get_eligible_offers(customer_id)
        
        return {
            "customer": kyc['data'],
            "credit": credit['data'],
            "eligible_products": offers['eligible_products']
        }
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=404, detail="Customer not found")

@app.post("/api/loan-application")
async def create_loan_application(application: LoanApplicationRequest):
    '''Create loan application with pre-filled data from mock services.'''
    
    # Check eligibility
    credit = mock_client.get_credit_information(application.customer_id)
    offers = mock_client.get_eligible_offers(
        application.customer_id,
        application.loan_amount
    )
    
    if offers['product_count'] == 0:
        raise HTTPException(status_code=400, detail="Not eligible for this amount")
    
    # Calculate EMI
    emi_calc = mock_client.calculate_emi(
        application.loan_amount,
        application.selected_product['base_interest_rate'],
        application.tenure_months
    )
    
    # Create application with pre-filled data
    application.credit_score = credit['data']['credit_score']
    application.pre_approved_limit = credit['data']['pre_approved_limit']
    application.estimated_emi = emi_calc['output']['monthly_emi']
    
    return await save_application(application)
"""


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print("MOCK SERVICES INTEGRATION GUIDE - EXAMPLES")
    print("="*80)
    
    # Run all examples
    example_1_complete_customer_profile()
    example_2_loan_eligibility_check()
    example_3_emi_calculations()
    example_4_batch_customer_processing()
    example_5_advanced_eligibility_matrix()
    example_6_dynamic_offer_recommendation()
    
    print("\n" + "="*80)
    print("✅ All integration examples completed!")
    print("="*80 + "\n")
