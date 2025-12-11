"""
Seed script for mock CRM and offer-mart services.
Populates in-memory mock data structures used by demo.
"""
import json
import os
from datetime import datetime

def create_mock_crm_data():
    """
    Create mock CRM data for 10 customers.
    Returns dictionary suitable for MockCRM service.
    """
    crm_data = {
        "cust_001": {
            "name": "Rajesh Kumar",
            "phone": "9876543210",
            "email": "rajesh.kumar@example.com",
            "address": "302, Prestige Towers, Worli, Mumbai",
            "city": "Mumbai",
            "kyc_verified": True,
            "kyc_date": "2025-06-15",
            "pan": "AAAP1234A",
            "aadhar": "****4567",
            "employment_type": "Salaried",
            "employer": "InfoSys Limited"
        },
        "cust_002": {
            "name": "Priya Sharma",
            "phone": "9876543211",
            "email": "priya.sharma@example.com",
            "address": "Apt 501, Kshitij Towers, Bangalore",
            "city": "Bangalore",
            "kyc_verified": True,
            "kyc_date": "2025-07-20",
            "pan": "BBBS5678B",
            "aadhar": "****8901",
            "employment_type": "Salaried",
            "employer": "TCS Limited"
        },
        "cust_003": {
            "name": "Amit Patel",
            "phone": "9876543212",
            "email": "amit.patel@example.com",
            "address": "101, Ahmedabad Plaza, Ahmedabad",
            "city": "Ahmedabad",
            "kyc_verified": True,
            "kyc_date": "2025-05-10",
            "pan": "CCCC9012C",
            "aadhar": "****2345",
            "employment_type": "Salaried",
            "employer": "Reliance Industries"
        },
        "cust_004": {
            "name": "Neha Singh",
            "phone": "9876543213",
            "email": "neha.singh@example.com",
            "address": "Flat 204, South Delhi Complex, Delhi",
            "city": "Delhi",
            "kyc_verified": True,
            "kyc_date": "2025-08-05",
            "pan": "DDDD3456D",
            "aadhar": "****6789",
            "employment_type": "Salaried",
            "employer": "Google India"
        },
        "cust_005": {
            "name": "Vikram Desai",
            "phone": "9876543214",
            "email": "vikram.desai@example.com",
            "address": "Desai Business Center, Pune",
            "city": "Pune",
            "kyc_verified": True,
            "kyc_date": "2025-04-18",
            "pan": "EEEE7890E",
            "aadhar": "****0123",
            "employment_type": "Self-Employed",
            "employer": "Desai Consultants"
        },
        "cust_006": {
            "name": "Anjali Gupta",
            "phone": "9876543215",
            "email": "anjali.gupta@example.com",
            "address": "42, Park Street, Kolkata",
            "city": "Kolkata",
            "kyc_verified": True,
            "kyc_date": "2025-09-12",
            "pan": "FFFF1234F",
            "aadhar": "****4567",
            "employment_type": "Salaried",
            "employer": "HDFC Bank"
        },
        "cust_007": {
            "name": "Rohan Malhotra",
            "phone": "9876543216",
            "email": "rohan.malhotra@example.com",
            "address": "Hitech City, Hyderabad",
            "city": "Hyderabad",
            "kyc_verified": True,
            "kyc_date": "2025-03-25",
            "pan": "GGGG5678G",
            "aadhar": "****8901",
            "employment_type": "Salaried",
            "employer": "Microsoft India"
        },
        "cust_008": {
            "name": "Divya Reddy",
            "phone": "9876543217",
            "email": "divya.reddy@example.com",
            "address": "Marina Bay, Chennai",
            "city": "Chennai",
            "kyc_verified": True,
            "kyc_date": "2025-10-08",
            "pan": "HHHH9012H",
            "aadhar": "****2345",
            "employment_type": "Salaried",
            "employer": "Infosys Limited"
        },
        "cust_009": {
            "name": "Karan Verma",
            "phone": "9876543218",
            "email": "karan.verma@example.com",
            "address": "DLF Square, Gurgaon",
            "city": "Gurgaon",
            "kyc_verified": True,
            "kyc_date": "2025-11-02",
            "pan": "IIII3456I",
            "aadhar": "****6789",
            "employment_type": "Salaried",
            "employer": "Accenture India"
        },
        "cust_010": {
            "name": "Shalini Iyer",
            "phone": "9876543219",
            "email": "shalini.iyer@example.com",
            "address": "Cochin Towers, Kochi",
            "city": "Kochi",
            "kyc_verified": True,
            "kyc_date": "2025-12-01",
            "pan": "JJJJ7890J",
            "aadhar": "****0123",
            "employment_type": "Salaried",
            "employer": "Tata Consultancy Services"
        }
    }
    
    return crm_data

def create_mock_offer_mart_data():
    """
    Create mock offer-mart products.
    Returns list of loan products with pricing.
    """
    products = [
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
            "features": ["Instant Disbursal", "Quick Approval", "Minimal Documentation"]
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
            "features": ["Lower Interest Rate", "Priority Processing", "Dedicated Support"]
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
            "features": ["Property Coverage", "Tax Benefits", "Long Tenure"]
        }
    ]
    
    return products

def create_credit_bureau_data():
    """
    Create mock credit bureau rating scales.
    """
    rating_scales = {
        "800_plus": {
            "rating": "Excellent",
            "interest_rate_reduction": 2.0,
            "approval_probability": 0.99
        },
        "750_799": {
            "rating": "Good",
            "interest_rate_reduction": 1.5,
            "approval_probability": 0.95
        },
        "700_749": {
            "rating": "Fair",
            "interest_rate_reduction": 0.5,
            "approval_probability": 0.85
        },
        "650_699": {
            "rating": "Average",
            "interest_rate_reduction": 0.0,
            "approval_probability": 0.70
        },
        "below_650": {
            "rating": "Poor",
            "interest_rate_reduction": 0.0,
            "approval_probability": 0.40
        }
    }
    
    return rating_scales

def save_seed_data(output_dir="prototypes/mock_services/data"):
    """
    Save mock data to JSON files for persistence.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Save CRM data
    crm_data = create_mock_crm_data()
    with open(os.path.join(output_dir, "mock_crm.json"), 'w') as f:
        json.dump(crm_data, f, indent=2)
    print(f"✓ Saved mock CRM data to {output_dir}/mock_crm.json")
    
    # Save offer-mart data
    offers = create_mock_offer_mart_data()
    with open(os.path.join(output_dir, "mock_offers.json"), 'w') as f:
        json.dump(offers, f, indent=2)
    print(f"✓ Saved mock offers to {output_dir}/mock_offers.json")
    
    # Save credit bureau data
    bureau = create_credit_bureau_data()
    with open(os.path.join(output_dir, "mock_credit_bureau.json"), 'w') as f:
        json.dump(bureau, f, indent=2)
    print(f"✓ Saved mock credit bureau data to {output_dir}/mock_credit_bureau.json")

def print_summary():
    """
    Print summary of seeded data.
    """
    print("\n" + "=" * 80)
    print("MOCK DATA SEED SUMMARY")
    print("=" * 80)
    
    crm = create_mock_crm_data()
    offers = create_mock_offer_mart_data()
    
    print(f"\n📊 CRM Database:")
    print(f"  • Customers: {len(crm)}")
    for cust_id, data in crm.items():
        print(f"    - {cust_id}: {data['name']} ({data['city']})")
    
    print(f"\n💰 Offer Mart:")
    print(f"  • Products: {len(offers)}")
    for product in offers:
        print(f"    - {product['product_name']}")
        print(f"      Amount: ₹{product['min_amount']:,} - ₹{product['max_amount']:,}")
        print(f"      Rate: {product['base_interest_rate']}% | Fee: {product['processing_fee_percent']}%")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("TATA CAPITAL MOCK SERVICES DATA SEEDING")
    print("=" * 80)
    
    # Create and save seed data
    save_seed_data()
    
    # Print summary
    print_summary()
    
    print("\nData seeding complete! ✅")
    print("\nNext steps:")
    print("  1. Update backend/agents/mock_apis.py to use these seed files")
    print("  2. Run backend/tests to verify integration")
    print("  3. Start demo with: docker-compose up")
