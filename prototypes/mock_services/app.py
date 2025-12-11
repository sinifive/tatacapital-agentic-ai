"""
Mock Services API Server (FastAPI)

Provides deterministic responses for:
- CRM: Customer KYC verification
- Credit: Credit scores and pre-approved limits
- Offers: Loan products and pricing

Routes:
  GET /crm/{customer_id} -> KYC data
  GET /credit/{customer_id} -> Credit score and pre-approved limit
  GET /offers/{customer_id} -> Pre-approved limit and product offers
  GET /health -> Health check
  GET / -> Service info
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import os

# Initialize FastAPI app
app = FastAPI(
    title="Tata Capital - Mock Services API",
    description="Mock external service responses for demo and testing",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# SEEDED DATA DEFINITIONS
# ============================================================================

# CRM Database: Customer KYC Information
CRM_DATABASE = {
    "cust_001": {
        "customer_id": "cust_001",
        "name": "Rajesh Kumar",
        "phone": "9876543210",
        "email": "rajesh.kumar@example.com",
        "address": "302, Prestige Towers, Worli, Mumbai",
        "city": "Mumbai",
        "kyc_verified": True,
        "kyc_date": "2025-06-15",
        "kyc_status": "approved",
        "pan": "AAAP1234A",
        "aadhar_masked": "****4567",
        "employment_type": "Salaried",
        "employer": "InfoSys Limited",
        "annual_income": 1200000
    },
    "cust_002": {
        "customer_id": "cust_002",
        "name": "Priya Sharma",
        "phone": "9876543211",
        "email": "priya.sharma@example.com",
        "address": "Apt 501, Kshitij Towers, Bangalore",
        "city": "Bangalore",
        "kyc_verified": True,
        "kyc_date": "2025-07-20",
        "kyc_status": "approved",
        "pan": "BBBS5678B",
        "aadhar_masked": "****8901",
        "employment_type": "Salaried",
        "employer": "TCS Limited",
        "annual_income": 1800000
    },
    "cust_003": {
        "customer_id": "cust_003",
        "name": "Amit Patel",
        "phone": "9876543212",
        "email": "amit.patel@example.com",
        "address": "101, Ahmedabad Plaza, Ahmedabad",
        "city": "Ahmedabad",
        "kyc_verified": True,
        "kyc_date": "2025-05-10",
        "kyc_status": "approved",
        "pan": "CCCC9012C",
        "aadhar_masked": "****2345",
        "employment_type": "Salaried",
        "employer": "Reliance Industries",
        "annual_income": 900000
    },
    "cust_004": {
        "customer_id": "cust_004",
        "name": "Neha Singh",
        "phone": "9876543213",
        "email": "neha.singh@example.com",
        "address": "Flat 204, South Delhi Complex, Delhi",
        "city": "Delhi",
        "kyc_verified": True,
        "kyc_date": "2025-08-05",
        "kyc_status": "approved",
        "pan": "DDDD3456D",
        "aadhar_masked": "****6789",
        "employment_type": "Salaried",
        "employer": "Google India",
        "annual_income": 1100000
    },
    "cust_005": {
        "customer_id": "cust_005",
        "name": "Vikram Desai",
        "phone": "9876543214",
        "email": "vikram.desai@example.com",
        "address": "Desai Business Center, Pune",
        "city": "Pune",
        "kyc_verified": True,
        "kyc_date": "2025-04-18",
        "kyc_status": "approved",
        "pan": "EEEE7890E",
        "aadhar_masked": "****0123",
        "employment_type": "Self-Employed",
        "employer": "Desai Consultants",
        "annual_income": 800000
    },
    "cust_006": {
        "customer_id": "cust_006",
        "name": "Anjali Gupta",
        "phone": "9876543215",
        "email": "anjali.gupta@example.com",
        "address": "42, Park Street, Kolkata",
        "city": "Kolkata",
        "kyc_verified": True,
        "kyc_date": "2025-09-12",
        "kyc_status": "approved",
        "pan": "FFFF1234F",
        "aadhar_masked": "****4567",
        "employment_type": "Salaried",
        "employer": "HDFC Bank",
        "annual_income": 1500000
    },
    "cust_007": {
        "customer_id": "cust_007",
        "name": "Rohan Malhotra",
        "phone": "9876543216",
        "email": "rohan.malhotra@example.com",
        "address": "Hitech City, Hyderabad",
        "city": "Hyderabad",
        "kyc_verified": True,
        "kyc_date": "2025-03-25",
        "kyc_status": "approved",
        "pan": "GGGG5678G",
        "aadhar_masked": "****8901",
        "employment_type": "Salaried",
        "employer": "Microsoft India",
        "annual_income": 1000000
    },
    "cust_008": {
        "customer_id": "cust_008",
        "name": "Divya Reddy",
        "phone": "9876543217",
        "email": "divya.reddy@example.com",
        "address": "Marina Bay, Chennai",
        "city": "Chennai",
        "kyc_verified": True,
        "kyc_date": "2025-10-08",
        "kyc_status": "approved",
        "pan": "HHHH9012H",
        "aadhar_masked": "****2345",
        "employment_type": "Salaried",
        "employer": "Infosys Limited",
        "annual_income": 1300000
    },
    "cust_009": {
        "customer_id": "cust_009",
        "name": "Karan Verma",
        "phone": "9876543218",
        "email": "karan.verma@example.com",
        "address": "DLF Square, Gurgaon",
        "city": "Gurgaon",
        "kyc_verified": True,
        "kyc_date": "2025-11-02",
        "kyc_status": "approved",
        "pan": "IIII3456I",
        "aadhar_masked": "****6789",
        "employment_type": "Salaried",
        "employer": "Accenture India",
        "annual_income": 1600000
    },
    "cust_010": {
        "customer_id": "cust_010",
        "name": "Shalini Iyer",
        "phone": "9876543219",
        "email": "shalini.iyer@example.com",
        "address": "Cochin Towers, Kochi",
        "city": "Kochi",
        "kyc_verified": True,
        "kyc_date": "2025-12-01",
        "kyc_status": "approved",
        "pan": "JJJJ7890J",
        "aadhar_masked": "****0123",
        "employment_type": "Salaried",
        "employer": "Tata Consultancy Services",
        "annual_income": 950000
    }
}

# Credit Bureau Database: Credit Scores and Pre-Approved Limits
CREDIT_DATABASE = {
    "cust_001": {
        "customer_id": "cust_001",
        "credit_score": 785,
        "credit_rating": "Good",
        "pre_approved_limit": 750000,
        "max_multiplier": 2.0,
        "last_updated": "2025-12-10"
    },
    "cust_002": {
        "customer_id": "cust_002",
        "credit_score": 820,
        "credit_rating": "Excellent",
        "pre_approved_limit": 1000000,
        "max_multiplier": 2.5,
        "last_updated": "2025-12-10"
    },
    "cust_003": {
        "customer_id": "cust_003",
        "credit_score": 710,
        "credit_rating": "Fair",
        "pre_approved_limit": 500000,
        "max_multiplier": 2.0,
        "last_updated": "2025-12-10"
    },
    "cust_004": {
        "customer_id": "cust_004",
        "credit_score": 750,
        "credit_rating": "Good",
        "pre_approved_limit": 600000,
        "max_multiplier": 2.0,
        "last_updated": "2025-12-10"
    },
    "cust_005": {
        "customer_id": "cust_005",
        "credit_score": 680,
        "credit_rating": "Average",
        "pre_approved_limit": 400000,
        "max_multiplier": 1.5,
        "last_updated": "2025-12-10"
    },
    "cust_006": {
        "customer_id": "cust_006",
        "credit_score": 800,
        "credit_rating": "Excellent",
        "pre_approved_limit": 900000,
        "max_multiplier": 2.5,
        "last_updated": "2025-12-10"
    },
    "cust_007": {
        "customer_id": "cust_007",
        "credit_score": 725,
        "credit_rating": "Good",
        "pre_approved_limit": 550000,
        "max_multiplier": 2.0,
        "last_updated": "2025-12-10"
    },
    "cust_008": {
        "customer_id": "cust_008",
        "credit_score": 760,
        "credit_rating": "Good",
        "pre_approved_limit": 700000,
        "max_multiplier": 2.0,
        "last_updated": "2025-12-10"
    },
    "cust_009": {
        "customer_id": "cust_009",
        "credit_score": 790,
        "credit_rating": "Good",
        "pre_approved_limit": 850000,
        "max_multiplier": 2.0,
        "last_updated": "2025-12-10"
    },
    "cust_010": {
        "customer_id": "cust_010",
        "credit_score": 710,
        "credit_rating": "Fair",
        "pre_approved_limit": 450000,
        "max_multiplier": 1.5,
        "last_updated": "2025-12-10"
    }
}

# Loan Offers Database: Products and Pricing
OFFERS_DATABASE = {
    "products": [
        {
            "product_id": "personal_loan_standard",
            "product_name": "Personal Loan - Standard",
            "description": "Flexible personal loan for various needs",
            "min_amount": 100000,
            "max_amount": 5000000,
            "min_tenure": 12,
            "max_tenure": 84,
            "base_interest_rate": 12.5,
            "processing_fee_percent": 1.0,
            "features": ["Instant Disbursal", "Quick Approval", "Minimal Documentation"],
            "approval_time": "24 hours"
        },
        {
            "product_id": "personal_loan_premium",
            "product_name": "Personal Loan - Premium",
            "description": "Premium personal loan with special benefits",
            "min_amount": 500000,
            "max_amount": 10000000,
            "min_tenure": 12,
            "max_tenure": 84,
            "base_interest_rate": 11.5,
            "processing_fee_percent": 1.5,
            "features": ["Lower Interest Rate", "Priority Processing", "Dedicated Support"],
            "approval_time": "12 hours"
        },
        {
            "product_id": "home_loan_standard",
            "product_name": "Home Loan - Standard",
            "description": "Affordable home loan with flexible repayment",
            "min_amount": 500000,
            "max_amount": 50000000,
            "min_tenure": 60,
            "max_tenure": 240,
            "base_interest_rate": 10.0,
            "processing_fee_percent": 0.5,
            "features": ["Property Coverage", "Tax Benefits", "Long Tenure"],
            "approval_time": "5-7 days"
        }
    ]
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_eligible_offers(customer_id: str, loan_amount: Optional[float] = None) -> List[Dict[str, Any]]:
    """
    Get eligible loan products for a customer based on their pre-approved limit.
    Filters products by loan amount if provided.
    """
    if customer_id not in CREDIT_DATABASE:
        return []
    
    pre_approved = CREDIT_DATABASE[customer_id]["pre_approved_limit"]
    eligible = []
    
    for product in OFFERS_DATABASE["products"]:
        # Check if product is within amount range
        if loan_amount:
            if loan_amount < product["min_amount"] or loan_amount > product["max_amount"]:
                continue
        
        # Check if pre-approved limit is within product range
        if pre_approved < product["min_amount"]:
            continue
        
        eligible.append(product)
    
    return eligible


def calculate_emi(principal: float, annual_rate: float, months: int) -> float:
    """
    Calculate monthly EMI using the standard formula:
    EMI = P * R * (1+R)^N / ((1+R)^N - 1)
    where R = monthly interest rate
    """
    monthly_rate = annual_rate / 100 / 12
    if monthly_rate == 0:
        return principal / months
    
    numerator = principal * monthly_rate * ((1 + monthly_rate) ** months)
    denominator = ((1 + monthly_rate) ** months) - 1
    return numerator / denominator


# ============================================================================
# API ROUTES
# ============================================================================

@app.get("/")
def root():
    """Root endpoint with service information."""
    return {
        "service": "Tata Capital - Mock Services API",
        "version": "0.1.0",
        "description": "Provides mock responses for CRM, Credit Bureau, and Offer Mart",
        "endpoints": {
            "crm": "GET /crm/{customer_id}",
            "credit": "GET /credit/{customer_id}",
            "offers": "GET /offers/{customer_id}",
            "health": "GET /health"
        },
        "sample_customers": list(CRM_DATABASE.keys())
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Mock Services API"
    }


@app.get("/crm/{customer_id}")
def get_customer_kyc(customer_id: str):
    """
    Get customer KYC information from CRM.
    
    Returns:
        - customer_id, name, phone, email
        - address, city
        - kyc_verified, kyc_status, kyc_date
        - pan, aadhar_masked
        - employment_type, employer, annual_income
    """
    customer_id = customer_id.lower()
    
    if customer_id not in CRM_DATABASE:
        raise HTTPException(
            status_code=404,
            detail=f"Customer {customer_id} not found in CRM"
        )
    
    return {
        "status": "success",
        "data": CRM_DATABASE[customer_id],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/credit/{customer_id}")
def get_credit_information(customer_id: str):
    """
    Get customer credit score and pre-approved limit from Credit Bureau.
    
    Returns:
        - customer_id
        - credit_score (300-900 range)
        - credit_rating (Poor, Average, Fair, Good, Excellent)
        - pre_approved_limit (in rupees)
        - max_multiplier (for loan amount evaluation)
        - last_updated
    """
    customer_id = customer_id.lower()
    
    if customer_id not in CREDIT_DATABASE:
        raise HTTPException(
            status_code=404,
            detail=f"Customer {customer_id} not found in Credit Database"
        )
    
    return {
        "status": "success",
        "data": CREDIT_DATABASE[customer_id],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/offers/{customer_id}")
def get_customer_offers(customer_id: str, loan_amount: Optional[float] = None):
    """
    Get eligible loan products for a customer.
    
    Query Parameters:
        loan_amount (optional): Filter products by loan amount (in rupees)
    
    Returns:
        - customer_id
        - pre_approved_limit
        - eligible_products: List of loan products matching customer profile
        - each product includes: name, rates, features, approval time
    """
    customer_id = customer_id.lower()
    
    if customer_id not in CREDIT_DATABASE:
        raise HTTPException(
            status_code=404,
            detail=f"Customer {customer_id} not found"
        )
    
    pre_approved = CREDIT_DATABASE[customer_id]["pre_approved_limit"]
    eligible_products = get_eligible_offers(customer_id, loan_amount)
    
    return {
        "status": "success",
        "customer_id": customer_id,
        "pre_approved_limit": pre_approved,
        "eligible_products": eligible_products,
        "product_count": len(eligible_products),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/customers")
def list_all_customers():
    """List all available test customers."""
    return {
        "status": "success",
        "customer_count": len(CRM_DATABASE),
        "customers": [
            {
                "customer_id": cid,
                "name": CRM_DATABASE[cid]["name"],
                "city": CRM_DATABASE[cid]["city"],
                "credit_score": CREDIT_DATABASE[cid]["credit_score"],
                "pre_approved": CREDIT_DATABASE[cid]["pre_approved_limit"]
            }
            for cid in sorted(CRM_DATABASE.keys())
        ]
    }


@app.get("/calculate-emi")
def calculate_loan_emi(
    amount: float,
    annual_rate: float,
    months: int
):
    """
    Calculate monthly EMI for a loan.
    
    Query Parameters:
        amount: Loan amount (in rupees)
        annual_rate: Interest rate per annum (%)
        months: Tenure in months
    
    Returns:
        - monthly_emi
        - total_amount
        - total_interest
    """
    if amount <= 0 or annual_rate < 0 or months <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount, rate, and months must be positive numbers"
        )
    
    monthly_emi = calculate_emi(amount, annual_rate, months)
    total_amount = monthly_emi * months
    total_interest = total_amount - amount
    
    return {
        "status": "success",
        "input": {
            "loan_amount": amount,
            "annual_rate": annual_rate,
            "tenure_months": months
        },
        "output": {
            "monthly_emi": round(monthly_emi, 2),
            "total_amount_payable": round(total_amount, 2),
            "total_interest": round(total_interest, 2)
        }
    }


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*80)
    print("Mock Services API Server")
    print("="*80)
    print("\nStarting Tata Capital Mock Services on http://0.0.0.0:9000")
    print("\nAvailable Endpoints:")
    print("  GET /                           - Service info")
    print("  GET /health                     - Health check")
    print("  GET /customers                  - List all test customers")
    print("  GET /crm/{customer_id}          - Get customer KYC data")
    print("  GET /credit/{customer_id}       - Get credit score & limits")
    print("  GET /offers/{customer_id}       - Get eligible loan offers")
    print("  GET /calculate-emi              - Calculate EMI (query params)")
    print("\nSample Customers: cust_001 through cust_010")
    print("API Docs: http://localhost:9000/docs")
    print("="*80 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=9000, reload=True)
