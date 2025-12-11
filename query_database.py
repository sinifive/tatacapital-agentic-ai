"""
Query and display customer data from the seeded database.
Useful for verifying database integrity and testing scenarios.
"""
import sqlite3
from tabulate import tabulate
import json

def query_all_customers():
    """
    Query all customers from database.
    """
    conn = sqlite3.connect("tatacapital_demo.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM customers ORDER BY customer_id')
    rows = cursor.fetchall()
    
    data = []
    for row in rows:
        data.append([
            row['customer_id'],
            row['name'],
            row['city'],
            row['credit_score'],
            f"₹{row['pre_approved_limit']:,.0f}",
            row['employment_type']
        ])
    
    conn.close()
    return data

def query_customer_by_id(customer_id):
    """
    Query specific customer details.
    """
    conn = sqlite3.connect("tatacapital_demo.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM customers WHERE customer_id = ?', (customer_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def query_customers_by_city(city):
    """
    Query customers by city.
    """
    conn = sqlite3.connect("tatacapital_demo.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM customers WHERE city = ? ORDER BY name', (city,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def query_customers_by_credit_range(min_score, max_score):
    """
    Query customers by credit score range.
    """
    conn = sqlite3.connect("tatacapital_demo.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT * FROM customers WHERE credit_score BETWEEN ? AND ? ORDER BY credit_score DESC',
        (min_score, max_score)
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def load_mock_crm():
    """
    Load mock CRM data from JSON.
    """
    try:
        with open("prototypes/mock_services/data/mock_crm.json") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def load_mock_offers():
    """
    Load mock offers data from JSON.
    """
    try:
        with open("prototypes/mock_services/data/mock_offers.json") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def display_demo_scenarios():
    """
    Display demo scenarios using seeded data.
    """
    print("\n" + "=" * 100)
    print("DEMO SCENARIOS - Underwriting Rule Testing")
    print("=" * 100)
    
    scenarios = [
        {
            "name": "Rule 1: Auto-Approval (Within Limit)",
            "customer_id": "CUST_001",
            "loan_amount": 500000,
            "tenure": 24,
            "rule": "Auto-approve if loan_amount ≤ pre_approved_limit"
        },
        {
            "name": "Rule 2: Salary Verification (Medium Request)",
            "customer_id": "CUST_002",
            "loan_amount": 1500000,
            "tenure": 36,
            "rule": "Request salary if pre_approved < loan_amount ≤ 2×pre_approved"
        },
        {
            "name": "Rule 3: Automatic Rejection (Exceeds Limit)",
            "customer_id": "CUST_005",
            "loan_amount": 900000,
            "tenure": 48,
            "rule": "Reject if loan_amount > 2×pre_approved_limit"
        },
        {
            "name": "Rule 2 Edge Case: Exactly 2x Pre-Approved",
            "customer_id": "CUST_006",
            "loan_amount": 1800000,
            "tenure": 60,
            "rule": "Request salary verification if loan_amount = 2×pre_approved_limit"
        },
        {
            "name": "Premium Product: High-Value Approval",
            "customer_id": "CUST_009",
            "loan_amount": 2000000,
            "tenure": 84,
            "rule": "Premium personal loan with lower interest rate"
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        customer = query_customer_by_id(scenario['customer_id'])
        if not customer:
            continue
        
        print(f"\n📋 Scenario {i}: {scenario['name']}")
        print("-" * 100)
        print(f"Customer:           {customer['name']} ({scenario['customer_id']})")
        print(f"Credit Score:       {customer['credit_score']} | Pre-Approved: ₹{customer['pre_approved_limit']:,.0f}")
        print(f"Request:            ₹{scenario['loan_amount']:,} for {scenario['tenure']} months")
        print(f"Business Rule:      {scenario['rule']}")
        
        # Calculate rule evaluation
        loan_amt = scenario['loan_amount']
        pre_app = customer['pre_approved_limit']
        
        if loan_amt <= pre_app:
            result = "✅ AUTO-APPROVED (Rule 1: Within pre-approved limit)"
        elif pre_app < loan_amt <= 2 * pre_app:
            result = "📋 REQUEST SALARY VERIFICATION (Rule 2: Requires income validation)"
        else:
            result = "❌ REJECTED (Rule 3: Exceeds 2× pre-approved limit)"
        
        print(f"Expected Outcome:   {result}")

def main():
    """
    Main display function.
    """
    print("\n" + "=" * 100)
    print("TATA CAPITAL DEMO DATABASE - CUSTOMER & MOCK DATA VIEWER")
    print("=" * 100)
    
    # Display all customers
    print("\n📊 ALL CUSTOMERS IN DATABASE")
    print("-" * 100)
    customers_data = query_all_customers()
    if customers_data:
        headers = ["Customer ID", "Name", "City", "Credit Score", "Pre-Approved", "Employment"]
        print(tabulate(customers_data, headers=headers, tablefmt="grid"))
    
    # Summary statistics
    conn = sqlite3.connect("tatacapital_demo.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT AVG(credit_score) as avg_score, MIN(credit_score) as min_score, MAX(credit_score) as max_score FROM customers")
    stats = cursor.fetchone()
    
    cursor.execute("SELECT SUM(pre_approved_limit) as total_limit FROM customers")
    total_limit = cursor.fetchone()[0]
    
    conn.close()
    
    print("\n📈 DATABASE STATISTICS")
    print("-" * 100)
    print(f"Total Customers:        10")
    print(f"Average Credit Score:   {stats[0]:.0f}")
    print(f"Credit Score Range:     {stats[1]} - {stats[2]}")
    print(f"Total Pre-Approved:     ₹{total_limit:,.0f}")
    
    # Display mock services data
    print("\n💰 MOCK OFFER-MART PRODUCTS")
    print("-" * 100)
    offers = load_mock_offers()
    if offers:
        for offer in offers:
            print(f"\n{offer['product_name']}")
            print(f"  Range:     ₹{offer['min_amount']:,} - ₹{offer['max_amount']:,}")
            print(f"  Tenure:    {offer['min_tenure']} - {offer['max_tenure']} months")
            print(f"  Rate:      {offer['base_interest_rate']}% | Fee: {offer['processing_fee_percent']}%")
            print(f"  Features:  {', '.join(offer['features'])}")
    
    print("\n🏦 MOCK CRM SAMPLE DATA")
    print("-" * 100)
    crm = load_mock_crm()
    if crm:
        sample_cust = crm.get("cust_001")
        if sample_cust:
            print(f"Customer ID:    cust_001")
            print(f"Name:           {sample_cust['name']}")
            print(f"Phone:          {sample_cust['phone']}")
            print(f"Address:        {sample_cust['address']}")
            print(f"City:           {sample_cust['city']}")
            print(f"KYC Verified:   {sample_cust['kyc_verified']}")
            print(f"Employment:     {sample_cust['employment_type']} - {sample_cust['employer']}")
    
    # Display demo scenarios
    display_demo_scenarios()
    
    print("\n" + "=" * 100)
    print("✅ Database seeding verification complete!")
    print("=" * 100)

if __name__ == "__main__":
    try:
        main()
    except ModuleNotFoundError:
        print("⚠️  tabulate module not found. Installing...")
        import subprocess
        subprocess.run(["pip", "install", "tabulate"], check=True)
        print("Retrying...")
        main()
