"""
Test script for PDF sanction letter generation.
"""

import sys
import os
from datetime import datetime

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.utils.pdf_helper import generate_sanction_letter


def test_sanction_letter_generation():
    """Test generating a sample sanction letter."""
    
    print("\n" + "="*80)
    print("PDF SANCTION LETTER GENERATION TEST")
    print("="*80)
    
    # Test data
    session_id = "test_session_001"
    customer_name = "Rajesh Kumar"
    loan_amount = 750000
    tenure = 24
    interest_rate = 12.5
    emi = 33750
    total_amount = emi * tenure
    
    print(f"\n📋 Test Parameters:")
    print(f"   Session ID: {session_id}")
    print(f"   Customer: {customer_name}")
    print(f"   Loan Amount: ₹{loan_amount:,.2f}")
    print(f"   Tenure: {tenure} months")
    print(f"   Interest Rate: {interest_rate}%")
    print(f"   Monthly EMI: ₹{emi:,.2f}")
    print(f"   Total Payable: ₹{total_amount:,.2f}")
    
    try:
        # Generate sanction letter
        print("\n⏳ Generating sanction letter...")
        pdf_path = generate_sanction_letter(
            session_id=session_id,
            name=customer_name,
            loan_amount=loan_amount,
            tenure=tenure,
            interest=interest_rate,
            emi=emi,
            total_amount=total_amount,
            processing_fee=loan_amount * 0.01
        )
        
        # Verify file exists
        if os.path.exists(pdf_path):
            file_size = os.path.getsize(pdf_path)
            print(f"\n✅ PDF Generated Successfully!")
            print(f"   File: {pdf_path}")
            print(f"   Size: {file_size:,} bytes ({file_size/1024:.2f} KB)")
            print(f"   Directory: {os.path.dirname(os.path.abspath(pdf_path))}")
            return True
        else:
            print(f"\n❌ PDF file not found at {pdf_path}")
            return False
    
    except Exception as e:
        print(f"\n❌ Error generating PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_multiple_scenarios():
    """Test generating PDFs for multiple scenarios."""
    
    scenarios = [
        {
            "session_id": "session_001",
            "name": "Priya Sharma",
            "loan_amount": 1000000,
            "tenure": 36,
            "interest": 11.5,
            "emi": 31500
        },
        {
            "session_id": "session_002",
            "name": "Amit Patel",
            "loan_amount": 500000,
            "tenure": 24,
            "interest": 12.5,
            "emi": 22500
        },
        {
            "session_id": "session_003",
            "name": "Neha Singh",
            "loan_amount": 600000,
            "tenure": 48,
            "interest": 12.0,
            "emi": 15000
        }
    ]
    
    print("\n" + "="*80)
    print("MULTIPLE SCENARIOS TEST")
    print("="*80)
    
    success_count = 0
    
    for scenario in scenarios:
        print(f"\n📄 Generating PDF for {scenario['name']}...")
        try:
            pdf_path = generate_sanction_letter(
                session_id=scenario['session_id'],
                name=scenario['name'],
                loan_amount=scenario['loan_amount'],
                tenure=scenario['tenure'],
                interest=scenario['interest'],
                emi=scenario['emi'],
                total_amount=scenario['emi'] * scenario['tenure'],
                processing_fee=scenario['loan_amount'] * 0.01
            )
            
            if os.path.exists(pdf_path):
                file_size = os.path.getsize(pdf_path)
                print(f"   ✅ Generated: {os.path.basename(pdf_path)} ({file_size/1024:.2f} KB)")
                success_count += 1
            else:
                print(f"   ❌ File not found: {pdf_path}")
        
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print(f"\n📊 Summary: {success_count}/{len(scenarios)} PDFs generated successfully")
    return success_count == len(scenarios)


if __name__ == "__main__":
    print("\n🚀 Starting PDF Sanction Letter Generation Tests\n")
    
    # Test 1: Single scenario
    test1_result = test_sanction_letter_generation()
    
    # Test 2: Multiple scenarios
    test2_result = test_multiple_scenarios()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Single Scenario Test: {'✅ PASSED' if test1_result else '❌ FAILED'}")
    print(f"Multiple Scenarios Test: {'✅ PASSED' if test2_result else '❌ FAILED'}")
    
    if test1_result and test2_result:
        print("\n✅ All tests passed! PDF generation is working correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Please check the output above.")
        sys.exit(1)
