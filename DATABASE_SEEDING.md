# Tata Capital Demo Database & Seed Scripts

This directory contains scripts to initialize and seed the Tata Capital agentic AI demo with realistic customer and product data.

## Files

### 1. `init_database.py` (Root Level)
Creates and seeds the SQLite database with customer records.

**Features:**
- Creates `tatacapital_demo.db` SQLite database
- Initializes `customers` table with schema
- Seeds 10 synthetic Indian customers
- Displays verification summary with customer details

**Schema:**
```sql
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
```

**Run Command:**
```bash
python init_database.py
```

**Output:**
- Database file: `tatacapital_demo.db` (12 KB)
- 10 customer records with credit scores (680-820) and pre-approved limits (₹400K-₹1M)

---

### 2. `prototypes/mock_services/seed_customers.py`
Generates mock service data (JSON files) for CRM, Offer Mart, and Credit Bureau.

**Features:**
- Creates mock CRM customer records (10 customers)
- Generates offer-mart loan products (3 products)
- Defines credit bureau rating scales
- Saves all data as JSON files in `prototypes/mock_services/data/`

**Run Command:**
```bash
python prototypes/mock_services/seed_customers.py
```

**Output Files:**

#### `prototypes/mock_services/data/mock_crm.json` (3.65 KB)
Contains 10 customers with KYC data:
```json
{
  "cust_001": {
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "email": "rajesh.kumar@example.com",
    "address": "302, Prestige Towers, Worli, Mumbai",
    "city": "Mumbai",
    "kyc_verified": true,
    "pan": "AAAP1234A",
    "aadhar": "****4567",
    "employment_type": "Salaried",
    "employer": "InfoSys Limited"
  },
  ...
}
```

#### `prototypes/mock_services/data/mock_offers.json` (1.31 KB)
Contains 3 loan products:
```json
[
  {
    "product_id": "personal_loan_standard",
    "product_name": "Personal Loan - Standard",
    "min_amount": 100000,
    "max_amount": 5000000,
    "base_interest_rate": 12.5,
    "processing_fee_percent": 1.0,
    "features": ["Instant Disbursal", "Quick Approval", "Minimal Documentation"]
  },
  {
    "product_id": "personal_loan_premium",
    "product_name": "Personal Loan - Premium",
    "min_amount": 500000,
    "max_amount": 10000000,
    "base_interest_rate": 11.5,
    "processing_fee_percent": 1.5,
    "features": ["Lower Interest Rate", "Priority Processing", "Dedicated Support"]
  },
  {
    "product_id": "home_loan_standard",
    "product_name": "Home Loan - Standard",
    "min_amount": 500000,
    "max_amount": 50000000,
    "base_interest_rate": 10.0,
    "processing_fee_percent": 0.5,
    "features": ["Property Coverage", "Tax Benefits", "Long Tenure"]
  }
]
```

#### `prototypes/mock_services/data/mock_credit_bureau.json` (0.58 KB)
Contains credit score rating scales:
```json
{
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
```

---

## Synthetic Customer Data

### 10 Test Customers:

| ID | Name | City | Credit Score | Pre-Approved |
|---|---|---|---|---|
| CUST_001 | Rajesh Kumar | Mumbai | 785 | ₹750,000 |
| CUST_002 | Priya Sharma | Bangalore | 820 | ₹1,000,000 |
| CUST_003 | Amit Patel | Ahmedabad | 710 | ₹500,000 |
| CUST_004 | Neha Singh | Delhi | 750 | ₹600,000 |
| CUST_005 | Vikram Desai | Pune | 680 | ₹400,000 |
| CUST_006 | Anjali Gupta | Kolkata | 800 | ₹900,000 |
| CUST_007 | Rohan Malhotra | Hyderabad | 725 | ₹550,000 |
| CUST_008 | Divya Reddy | Chennai | 760 | ₹700,000 |
| CUST_009 | Karan Verma | Gurgaon | 790 | ₹850,000 |
| CUST_010 | Shalini Iyer | Kochi | 710 | ₹450,000 |

---

## Quick Start

### 1. Initialize Database
```bash
python init_database.py
```
Creates `tatacapital_demo.db` with customer records.

### 2. Seed Mock Services
```bash
python prototypes/mock_services/seed_customers.py
```
Creates JSON data files in `prototypes/mock_services/data/`.

### 3. Verify Creation
```bash
# Check database
sqlite3 tatacapital_demo.db "SELECT COUNT(*) FROM customers;"

# Check JSON files
ls -la prototypes/mock_services/data/
```

---

## Integration with Backend

### Using SQLite Database in Backend

Update `backend/agents/database.py` to use the seeded customer database for KYC verification:

```python
from sqlite3 import connect

def get_customer_from_db(customer_id):
    conn = connect("../../tatacapital_demo.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (customer_id,))
    customer = cursor.fetchone()
    conn.close()
    return customer
```

### Using Mock Service JSON Files

Update `backend/agents/mock_apis.py` to load seed data:

```python
import json

class MockCRM:
    def __init__(self):
        with open("prototypes/mock_services/data/mock_crm.json") as f:
            self.data = json.load(f)
    
    async def verify_customer(self, customer_id):
        return self.data.get(customer_id, {"error": "not_found"})

class MockOfferMart:
    def __init__(self):
        with open("prototypes/mock_services/data/mock_offers.json") as f:
            self.products = json.load(f)
```

---

## Demo Usage

### Scenario 1: Auto-Approval (Rule 1)
- Use CUST_001 (Rajesh Kumar)
- Request: ₹500,000 for 24 months
- Expected: Auto-approved (within pre-approved limit of ₹750,000)

### Scenario 2: Salary Verification (Rule 2)
- Use CUST_002 (Priya Sharma)
- Request: ₹1,500,000 for 36 months
- Expected: Salary verification requested (1M < 1.5M ≤ 2M)

### Scenario 3: Rejection (Rule 3)
- Use CUST_005 (Vikram Desai)
- Request: ₹900,000 for 48 months
- Expected: Rejected (900K > 2 × 400K)

---

## Data Files Summary

| File | Size | Records | Purpose |
|---|---|---|---|
| `tatacapital_demo.db` | 12 KB | 10 | SQLite customer database |
| `mock_crm.json` | 3.65 KB | 10 | CRM verification data |
| `mock_offers.json` | 1.31 KB | 3 | Loan product catalog |
| `mock_credit_bureau.json` | 0.58 KB | 5 | Credit rating scales |

**Total:** ~17.5 KB of seed data covering complete loan origination workflow

---

## Next Steps

1. **Update mock_apis.py** to load seed JSON files instead of hardcoded data
2. **Update database.py** to query customers from SQLite
3. **Run end-to-end tests** with synthetic customer scenarios
4. **Demo workflow** using test customers with various loan amounts/tenures
5. **Generate test reports** showing rule engine behavior

---

## Notes

- All customer data is synthetic and for demo purposes only
- Credit scores, pre-approved limits, and employment data are realistic but fictional
- Phone numbers and emails follow Indian format (sample data)
- PAN and Aadhar numbers are masked for privacy
- Data files can be easily extended with additional customers/products

---

**Created:** 2025-12-11  
**Version:** 1.0  
**Status:** ✅ Complete - Ready for integration
