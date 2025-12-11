"""
Database initialization script for Tata Capital demo.
Creates SQLite database with customers table and sample data.
"""
import sqlite3
import os
from datetime import datetime

DATABASE_FILE = "tatacapital_demo.db"

def init_customers_table():
    """
    Initialize customers table with schema.
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Drop existing table if it exists (for fresh start)
    cursor.execute('DROP TABLE IF EXISTS customers')
    
    # Create customers table
    cursor.execute('''
        CREATE TABLE customers (
            customer_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            city TEXT NOT NULL,
            credit_score INTEGER NOT NULL,
            pre_approved_limit REAL NOT NULL,
            employment_type TEXT,
            annual_income REAL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"✓ Created customers table in {DATABASE_FILE}")

def seed_customers():
    """
    Seed database with 10 synthetic customer entries.
    """
    # Synthetic customer data
    customers = [
        {
            'customer_id': 'CUST_001',
            'name': 'Rajesh Kumar',
            'phone': '9876543210',
            'email': 'rajesh.kumar@example.com',
            'city': 'Mumbai',
            'credit_score': 785,
            'pre_approved_limit': 750000,
            'employment_type': 'Salaried',
            'annual_income': 1200000
        },
        {
            'customer_id': 'CUST_002',
            'name': 'Priya Sharma',
            'phone': '9876543211',
            'email': 'priya.sharma@example.com',
            'city': 'Bangalore',
            'credit_score': 820,
            'pre_approved_limit': 1000000,
            'employment_type': 'Salaried',
            'annual_income': 1800000
        },
        {
            'customer_id': 'CUST_003',
            'name': 'Amit Patel',
            'phone': '9876543212',
            'email': 'amit.patel@example.com',
            'city': 'Ahmedabad',
            'credit_score': 710,
            'pre_approved_limit': 500000,
            'employment_type': 'Salaried',
            'annual_income': 900000
        },
        {
            'customer_id': 'CUST_004',
            'name': 'Neha Singh',
            'phone': '9876543213',
            'email': 'neha.singh@example.com',
            'city': 'Delhi',
            'credit_score': 750,
            'pre_approved_limit': 600000,
            'employment_type': 'Salaried',
            'annual_income': 1100000
        },
        {
            'customer_id': 'CUST_005',
            'name': 'Vikram Desai',
            'phone': '9876543214',
            'email': 'vikram.desai@example.com',
            'city': 'Pune',
            'credit_score': 680,
            'pre_approved_limit': 400000,
            'employment_type': 'Self-Employed',
            'annual_income': 800000
        },
        {
            'customer_id': 'CUST_006',
            'name': 'Anjali Gupta',
            'phone': '9876543215',
            'email': 'anjali.gupta@example.com',
            'city': 'Kolkata',
            'credit_score': 800,
            'pre_approved_limit': 900000,
            'employment_type': 'Salaried',
            'annual_income': 1500000
        },
        {
            'customer_id': 'CUST_007',
            'name': 'Rohan Malhotra',
            'phone': '9876543216',
            'email': 'rohan.malhotra@example.com',
            'city': 'Hyderabad',
            'credit_score': 725,
            'pre_approved_limit': 550000,
            'employment_type': 'Salaried',
            'annual_income': 1000000
        },
        {
            'customer_id': 'CUST_008',
            'name': 'Divya Reddy',
            'phone': '9876543217',
            'email': 'divya.reddy@example.com',
            'city': 'Chennai',
            'credit_score': 760,
            'pre_approved_limit': 700000,
            'employment_type': 'Salaried',
            'annual_income': 1300000
        },
        {
            'customer_id': 'CUST_009',
            'name': 'Karan Verma',
            'phone': '9876543218',
            'email': 'karan.verma@example.com',
            'city': 'Gurgaon',
            'credit_score': 790,
            'pre_approved_limit': 850000,
            'employment_type': 'Salaried',
            'annual_income': 1600000
        },
        {
            'customer_id': 'CUST_010',
            'name': 'Shalini Iyer',
            'phone': '9876543219',
            'email': 'shalini.iyer@example.com',
            'city': 'Kochi',
            'credit_score': 710,
            'pre_approved_limit': 450000,
            'employment_type': 'Salaried',
            'annual_income': 950000
        }
    ]
    
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    for customer in customers:
        cursor.execute('''
            INSERT INTO customers 
            (customer_id, name, phone, email, city, credit_score, pre_approved_limit, 
             employment_type, annual_income, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            customer['customer_id'],
            customer['name'],
            customer['phone'],
            customer['email'],
            customer['city'],
            customer['credit_score'],
            customer['pre_approved_limit'],
            customer['employment_type'],
            customer['annual_income'],
            now,
            now
        ))
    
    conn.commit()
    conn.close()
    
    print(f"\n✓ Seeded 10 customers into {DATABASE_FILE}")
    print("\nCustomer Summary:")
    print("-" * 80)
    print(f"{'Customer ID':<12} {'Name':<20} {'City':<15} {'Credit Score':<14} {'Pre-Approved':<15}")
    print("-" * 80)
    
    for customer in customers:
        print(f"{customer['customer_id']:<12} {customer['name']:<20} {customer['city']:<15} "
              f"{customer['credit_score']:<14} ₹{customer['pre_approved_limit']:>13,.0f}")

def verify_database():
    """
    Verify database and display customer information.
    """
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as count FROM customers')
    count = cursor.fetchone()['count']
    
    print(f"\n✓ Database verification: {count} customers found")
    
    # Show sample customer details
    cursor.execute('SELECT * FROM customers WHERE customer_id = "CUST_001"')
    sample = cursor.fetchone()
    
    if sample:
        print("\nSample Customer Record (CUST_001):")
        print("-" * 80)
        for key in sample.keys():
            print(f"  {key:<25} : {sample[key]}")
    
    conn.close()

if __name__ == "__main__":
    print("=" * 80)
    print("TATA CAPITAL DEMO DATABASE INITIALIZATION")
    print("=" * 80)
    
    # Initialize database
    init_customers_table()
    
    # Seed with customer data
    seed_customers()
    
    # Verify
    verify_database()
    
    print("\n" + "=" * 80)
    print(f"Database file: {os.path.abspath(DATABASE_FILE)}")
    print("=" * 80)
