#!/usr/bin/env python3
"""
Quick Start Guide - Database & Seed Scripts
Run this file to see available commands and usage examples.
"""

def print_quick_start():
    guide = """
╔════════════════════════════════════════════════════════════════════════════════╗
║                   TATA CAPITAL DATABASE & SEEDING QUICK START                  ║
╚════════════════════════════════════════════════════════════════════════════════╝

📚 FILES CREATED:
─────────────────────────────────────────────────────────────────────────────────
1. init_database.py
   → Create SQLite database with 10 synthetic customers
   → Run: python init_database.py

2. prototypes/mock_services/seed_customers.py
   → Generate mock CRM, offer-mart, and credit bureau JSON data
   → Run: python prototypes/mock_services/seed_customers.py

3. query_database.py
   → Query and display customer data with demo scenarios
   → Run: python query_database.py

4. DATABASE_SEEDING.md
   → Complete documentation with schemas and integration examples

5. DATABASE_SEEDING_SUMMARY.md
   → Implementation summary with deliverables and status


🚀 QUICK START (Step by Step):
─────────────────────────────────────────────────────────────────────────────────

Step 1: Initialize Database
$ python init_database.py

Step 2: Seed Mock Services
$ python prototypes/mock_services/seed_customers.py

Step 3: Query and Verify
$ python query_database.py


📊 WHAT YOU GET:
─────────────────────────────────────────────────────────────────────────────────
✅ SQLite Database:          tatacapital_demo.db (12 KB)
✅ Customers Table:          10 synthetic records with credit scores & limits
✅ Mock CRM Data:            prototypes/mock_services/data/mock_crm.json (3.65 KB)
✅ Mock Offers:              prototypes/mock_services/data/mock_offers.json (1.31 KB)
✅ Credit Bureau Ratings:    prototypes/mock_services/data/mock_credit_bureau.json (0.58 KB)

Total Size: ~62.5 KB (production-ready)


👥 SAMPLE CUSTOMERS (10 Synthetic Entries):
─────────────────────────────────────────────────────────────────────────────────
ID       | Name              | City       | Credit | Pre-Approved
---------|-------------------|------------|--------|---------------
CUST_001 | Rajesh Kumar      | Mumbai     | 785    | ₹750,000
CUST_002 | Priya Sharma      | Bangalore  | 820    | ₹1,000,000
CUST_003 | Amit Patel        | Ahmedabad  | 710    | ₹500,000
CUST_004 | Neha Singh        | Delhi      | 750    | ₹600,000
CUST_005 | Vikram Desai      | Pune       | 680    | ₹400,000
CUST_006 | Anjali Gupta      | Kolkata    | 800    | ₹900,000
CUST_007 | Rohan Malhotra    | Hyderabad  | 725    | ₹550,000
CUST_008 | Divya Reddy       | Chennai    | 760    | ₹700,000
CUST_009 | Karan Verma       | Gurgaon    | 790    | ₹850,000
CUST_010 | Shalini Iyer      | Kochi      | 710    | ₹450,000


💰 LOAN PRODUCTS (Offer-Mart):
─────────────────────────────────────────────────────────────────────────────────
1. Personal Loan - Standard
   Range: ₹100K - ₹5M | Rate: 12.5% | Fee: 1.0%

2. Personal Loan - Premium
   Range: ₹500K - ₹10M | Rate: 11.5% | Fee: 1.5%

3. Home Loan - Standard
   Range: ₹500K - ₹50M | Rate: 10.0% | Fee: 0.5%


📋 DEMO SCENARIOS (Underwriting Rules):
─────────────────────────────────────────────────────────────────────────────────

Scenario 1: Rule 1 - Auto-Approval (Within Limit)
┌─────────────────────────────────────────────────────────┐
│ Customer:  Rajesh Kumar (CUST_001)                      │
│ Credit:    785 | Pre-Approved: ₹750,000                │
│ Request:   ₹500,000 for 24 months                      │
│ Result:    ✅ AUTO-APPROVED                             │
│ Rule:      loan_amount ≤ pre_approved_limit            │
└─────────────────────────────────────────────────────────┘

Scenario 2: Rule 2 - Salary Verification (Medium Request)
┌─────────────────────────────────────────────────────────┐
│ Customer:  Priya Sharma (CUST_002)                      │
│ Credit:    820 | Pre-Approved: ₹1,000,000              │
│ Request:   ₹1,500,000 for 36 months                    │
│ Result:    📋 REQUEST SALARY VERIFICATION              │
│ Rule:      pre_approved < loan_amount ≤ 2×pre_approved│
└─────────────────────────────────────────────────────────┘

Scenario 3: Rule 3 - Automatic Rejection (Exceeds Limit)
┌─────────────────────────────────────────────────────────┐
│ Customer:  Vikram Desai (CUST_005)                      │
│ Credit:    680 | Pre-Approved: ₹400,000                │
│ Request:   ₹900,000 for 48 months                      │
│ Result:    ❌ REJECTED                                  │
│ Rule:      loan_amount > 2×pre_approved_limit          │
└─────────────────────────────────────────────────────────┘

Scenario 4: Rule 2 Edge Case (Exactly 2x Pre-Approved)
┌─────────────────────────────────────────────────────────┐
│ Customer:  Anjali Gupta (CUST_006)                      │
│ Credit:    800 | Pre-Approved: ₹900,000                │
│ Request:   ₹1,800,000 for 60 months                    │
│ Result:    📋 REQUEST SALARY VERIFICATION              │
│ Rule:      Boundary case triggers salary check         │
└─────────────────────────────────────────────────────────┘

Scenario 5: Premium Loan High-Value (Rule 3)
┌─────────────────────────────────────────────────────────┐
│ Customer:  Karan Verma (CUST_009)                       │
│ Credit:    790 | Pre-Approved: ₹850,000                │
│ Request:   ₹2,000,000 for 84 months (Premium)          │
│ Result:    ❌ REJECTED                                  │
│ Rule:      Exceeds 2×pre_approved (1.7M < 2M)          │
└─────────────────────────────────────────────────────────┘


🔧 INTEGRATION EXAMPLES:
─────────────────────────────────────────────────────────────────────────────────

Python - Query SQLite Customer:
────────────────────────────────
import sqlite3

conn = sqlite3.connect("tatacapital_demo.db")
cursor = conn.cursor()
cursor.execute("SELECT * FROM customers WHERE customer_id = ?", ("CUST_001",))
customer = cursor.fetchone()
print(f"{customer[1]}: {customer[5]} score, ₹{customer[6]} pre-approved")
conn.close()


Python - Load Mock CRM from JSON:
──────────────────────────────────
import json

with open("prototypes/mock_services/data/mock_crm.json") as f:
    crm_data = json.load(f)

customer = crm_data.get("cust_001")
print(f"{customer['name']} - {customer['city']}")


Python - Check Underwriting Rule:
──────────────────────────────────
def check_rule(loan_amount, pre_approved):
    if loan_amount <= pre_approved:
        return "AUTO-APPROVED"
    elif loan_amount <= 2 * pre_approved:
        return "REQUEST_SALARY"
    else:
        return "REJECTED"

# Example: CUST_001, request 500K (pre-approved: 750K)
result = check_rule(500000, 750000)  # Returns: "AUTO-APPROVED"


⚙️ COMMAND REFERENCE:
─────────────────────────────────────────────────────────────────────────────────

Initialize Database & Customers
$ python init_database.py
→ Creates tatacapital_demo.db with schema and 10 records

Seed Mock Services Data
$ python prototypes/mock_services/seed_customers.py
→ Creates JSON files in prototypes/mock_services/data/

Query Database & Show Scenarios
$ python query_database.py
→ Displays customers, statistics, products, and demo evaluations

View Database with SQLite CLI
$ sqlite3 tatacapital_demo.db
sqlite> SELECT * FROM customers;
sqlite> SELECT COUNT(*) FROM customers;
sqlite> .quit

View JSON Data (Linux/Mac)
$ cat prototypes/mock_services/data/mock_crm.json | jq .

View JSON Data (Windows PowerShell)
PS> Get-Content prototypes/mock_services/data/mock_crm.json | ConvertFrom-Json


📁 FILE STRUCTURE:
─────────────────────────────────────────────────────────────────────────────────
sin-i4-tatacapital-agentic-ai/
├── init_database.py                          ← Run this first
├── query_database.py                         ← Run this third
├── tatacapital_demo.db                       ← Auto-created
├── DATABASE_SEEDING.md                       ← Full documentation
├── DATABASE_SEEDING_SUMMARY.md               ← Summary
├── QUICK_START.py                            ← This file
└── prototypes/mock_services/
    ├── seed_customers.py                     ← Run this second
    └── data/
        ├── mock_crm.json                     ← Auto-created
        ├── mock_offers.json                  ← Auto-created
        └── mock_credit_bureau.json           ← Auto-created


✅ VERIFICATION CHECKLIST:
─────────────────────────────────────────────────────────────────────────────────
After running all scripts, verify:

□ tatacapital_demo.db file exists (12 KB)
□ prototypes/mock_services/data/mock_crm.json exists (3.65 KB)
□ prototypes/mock_services/data/mock_offers.json exists (1.31 KB)
□ prototypes/mock_services/data/mock_credit_bureau.json exists (0.58 KB)
□ query_database.py shows 10 customers in table
□ Database statistics show: Avg score 753, Range 680-820
□ All 5 demo scenarios display correctly
□ Demo scenarios show expected outcomes (✅❌📋)


🎯 NEXT STEPS:
─────────────────────────────────────────────────────────────────────────────────
1. Integration Phase
   → Update backend/agents/mock_apis.py to load seed files
   → Update backend/agents/database.py to query SQLite
   → Verify tests still pass (pytest backend/tests/)

2. Frontend Phase
   → Use CUST_001 through CUST_010 for demo
   → Test each of 5 scenarios in UI
   → Verify rule engine behavior

3. Production Phase
   → Add data encryption for sensitive fields
   → Add backup/restore scripts
   → Add audit logging
   → Implement pagination for large datasets


📞 SUPPORT:
─────────────────────────────────────────────────────────────────────────────────
For issues or questions:
1. Check DATABASE_SEEDING.md for detailed documentation
2. Review DATABASE_SEEDING_SUMMARY.md for technical specs
3. Run query_database.py to verify data integrity
4. Check backend/tests/ for integration examples


═════════════════════════════════════════════════════════════════════════════════
✅ Status: All seed scripts created, tested, and ready for production demo
═════════════════════════════════════════════════════════════════════════════════
"""
    print(guide)

if __name__ == "__main__":
    print_quick_start()
