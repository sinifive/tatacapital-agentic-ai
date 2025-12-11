# Tata Capital Mock Services API Documentation

## Overview

The Mock Services API simulates external third-party services commonly used in loan origination:
- **CRM System**: Customer KYC verification and profile data
- **Credit Bureau**: Credit score evaluation and pre-approved limits
- **Offer Mart**: Loan product catalog and eligibility

This server uses **deterministic seeded data** for consistent testing and demo purposes.

---

## Quick Start

### 1. Start the Mock Services Server

```bash
cd prototypes/mock_services
python app.py
```

The server will start on `http://0.0.0.0:9000`

### 2. Access Interactive API Documentation

Navigate to: http://localhost:9000/docs

This Swagger UI shows all endpoints with try-it-out capabilities.

---

## API Endpoints

### Core Endpoints

#### 1. GET `/crm/{customer_id}` - Customer KYC Data

Returns comprehensive customer information from the CRM system.

**Parameters:**
- `customer_id` (path): Customer ID (e.g., `cust_001`)

**Response:**
```json
{
  "status": "success",
  "data": {
    "customer_id": "cust_001",
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "email": "rajesh.kumar@example.com",
    "address": "302, Prestige Towers, Worli, Mumbai",
    "city": "Mumbai",
    "kyc_verified": true,
    "kyc_date": "2025-06-15",
    "kyc_status": "approved",
    "pan": "AAAP1234A",
    "aadhar_masked": "****4567",
    "employment_type": "Salaried",
    "employer": "InfoSys Limited",
    "annual_income": 1200000
  },
  "timestamp": "2025-12-15T10:30:45.123456"
}
```

**Example:**
```bash
curl http://localhost:9000/crm/cust_001
```

---

#### 2. GET `/credit/{customer_id}` - Credit Score & Limits

Returns credit bureau information including credit score and pre-approved limit.

**Parameters:**
- `customer_id` (path): Customer ID (e.g., `cust_001`)

**Response:**
```json
{
  "status": "success",
  "data": {
    "customer_id": "cust_001",
    "credit_score": 785,
    "credit_rating": "Good",
    "pre_approved_limit": 750000,
    "max_multiplier": 2.0,
    "last_updated": "2025-12-10"
  },
  "timestamp": "2025-12-15T10:30:45.123456"
}
```

**Credit Rating Scale:**
- **Excellent** (800+): 2.5x multiplier, lowest interest rates
- **Good** (750-799): 2.0x multiplier, competitive rates
- **Fair** (700-749): 2.0x multiplier, standard rates
- **Average** (650-699): 1.5x multiplier, higher rates
- **Poor** (<650): Lower multiplier, limited products

**Example:**
```bash
curl http://localhost:9000/credit/cust_001
```

---

#### 3. GET `/offers/{customer_id}` - Eligible Loan Products

Returns loan products matching the customer's pre-approved limit and eligibility.

**Parameters:**
- `customer_id` (path): Customer ID (e.g., `cust_001`)
- `loan_amount` (query, optional): Filter by loan amount in rupees

**Response:**
```json
{
  "status": "success",
  "customer_id": "cust_001",
  "pre_approved_limit": 750000,
  "eligible_products": [
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
    }
  ],
  "product_count": 3,
  "timestamp": "2025-12-15T10:30:45.123456"
}
```

**Example without filter:**
```bash
curl http://localhost:9000/offers/cust_001
```

**Example with loan amount filter:**
```bash
curl "http://localhost:9000/offers/cust_001?loan_amount=500000"
```

---

#### 4. GET `/calculate-emi` - EMI Calculator

Calculates monthly EMI (Equated Monthly Installment) for a loan.

**Parameters:**
- `amount` (query): Loan amount in rupees
- `annual_rate` (query): Interest rate per annum (%)
- `months` (query): Loan tenure in months

**Response:**
```json
{
  "status": "success",
  "input": {
    "loan_amount": 1000000,
    "annual_rate": 12.0,
    "tenure_months": 60
  },
  "output": {
    "monthly_emi": 22244.45,
    "total_amount_payable": 1334666.86,
    "total_interest": 334666.86
  }
}
```

**Example:**
```bash
curl "http://localhost:9000/calculate-emi?amount=1000000&annual_rate=12&months=60"
```

---

### Utility Endpoints

#### GET `/` - Service Information

Returns server metadata and available endpoints.

```bash
curl http://localhost:9000/
```

---

#### GET `/health` - Health Check

Simple health check endpoint.

```bash
curl http://localhost:9000/health
```

---

#### GET `/customers` - List All Customers

Returns summary of all available test customers.

```bash
curl http://localhost:9000/customers
```

**Response:**
```json
{
  "status": "success",
  "customer_count": 10,
  "customers": [
    {
      "customer_id": "cust_001",
      "name": "Rajesh Kumar",
      "city": "Mumbai",
      "credit_score": 785,
      "pre_approved": 750000
    }
  ]
}
```

---

## Test Customers

10 synthetic test customers are available:

| ID | Name | City | Credit Score | Pre-Approved |
|---|---|---|---|---|
| cust_001 | Rajesh Kumar | Mumbai | 785 | ₹750,000 |
| cust_002 | Priya Sharma | Bangalore | 820 | ₹1,000,000 |
| cust_003 | Amit Patel | Ahmedabad | 710 | ₹500,000 |
| cust_004 | Neha Singh | Delhi | 750 | ₹600,000 |
| cust_005 | Vikram Desai | Pune | 680 | ₹400,000 |
| cust_006 | Anjali Gupta | Kolkata | 800 | ₹900,000 |
| cust_007 | Rohan Malhotra | Hyderabad | 725 | ₹550,000 |
| cust_008 | Divya Reddy | Chennai | 760 | ₹700,000 |
| cust_009 | Karan Verma | Gurgaon | 790 | ₹850,000 |
| cust_010 | Shalini Iyer | Kochi | 710 | ₹450,000 |

---

## Available Loan Products

### 1. Personal Loan - Standard
- **Rate:** 12.5% p.a.
- **Amount:** ₹1 Lakh - ₹50 Lakhs
- **Tenure:** 12-84 months
- **Fee:** 1.0%
- **Approval:** 24 hours

### 2. Personal Loan - Premium
- **Rate:** 11.5% p.a.
- **Amount:** ₹5 Lakhs - ₹1 Crore
- **Tenure:** 12-84 months
- **Fee:** 1.5%
- **Approval:** 12 hours

### 3. Home Loan - Standard
- **Rate:** 10.0% p.a.
- **Amount:** ₹5 Lakhs - ₹5 Crores
- **Tenure:** 60-240 months
- **Fee:** 0.5%
- **Approval:** 5-7 days

---

## Python Example: Complete Workflow

```python
import requests

BASE_URL = "http://localhost:9000"

def customer_workflow(customer_id):
    """Demonstrate complete loan origination workflow."""
    
    # Step 1: Get CRM data
    crm = requests.get(f"{BASE_URL}/crm/{customer_id}").json()
    print(f"Customer: {crm['data']['name']}")
    print(f"Employment: {crm['data']['employer']}")
    
    # Step 2: Get credit information
    credit = requests.get(f"{BASE_URL}/credit/{customer_id}").json()
    print(f"Credit Score: {credit['data']['credit_score']}")
    print(f"Pre-Approved: ₹{credit['data']['pre_approved_limit']:,}")
    
    # Step 3: Get eligible offers
    offers = requests.get(f"{BASE_URL}/offers/{customer_id}").json()
    print(f"Eligible Products: {offers['product_count']}")
    
    # Step 4: Calculate EMI for ₹10 Lakhs @ 12% for 60 months
    emi = requests.get(
        f"{BASE_URL}/calculate-emi?amount=1000000&annual_rate=12&months=60"
    ).json()
    print(f"Monthly EMI: ₹{emi['output']['monthly_emi']:,.2f}")

# Run workflow for customer cust_001
customer_workflow("cust_001")
```

---

## JavaScript/React Example: Fetching Offers

```javascript
async function getCustomerOffers(customerId) {
  const response = await fetch(
    `http://localhost:9000/offers/${customerId}`
  );
  const data = await response.json();
  
  return {
    preApprovedLimit: data.pre_approved_limit,
    products: data.eligible_products
  };
}

// Usage
getCustomerOffers("cust_001").then(offers => {
  console.log(`Pre-approved: ₹${offers.preApprovedLimit}`);
  console.log(`Products available: ${offers.products.length}`);
});
```

---

## Error Handling

### 404 - Customer Not Found

**Request:**
```bash
curl http://localhost:9000/crm/cust_999
```

**Response:**
```json
{
  "detail": "Customer cust_999 not found in CRM"
}
```

### 400 - Invalid EMI Parameters

**Request:**
```bash
curl "http://localhost:9000/calculate-emi?amount=-1000&annual_rate=12&months=60"
```

**Response:**
```json
{
  "detail": "Amount, rate, and months must be positive numbers"
}
```

---

## Running Tests

Execute comprehensive test suite:

```bash
python test_mock_services.py
```

This runs:
- ✅ 22 test cases covering all endpoints
- ✅ Edge cases and error handling
- ✅ Data consistency validation
- ✅ Complete workflow integration test

---

## Integration with Main Backend

The mock services can be integrated with the main Tata Capital backend:

```python
# In backend/app.py or agents
import requests

MOCK_SERVICES_URL = "http://localhost:9000"

async def get_customer_profile(customer_id):
    """Fetch customer from mock CRM."""
    response = requests.get(f"{MOCK_SERVICES_URL}/crm/{customer_id}")
    return response.json()

async def check_eligibility(customer_id, loan_amount):
    """Check loan eligibility via mock services."""
    credit = requests.get(
        f"{MOCK_SERVICES_URL}/credit/{customer_id}"
    ).json()
    
    offers = requests.get(
        f"{MOCK_SERVICES_URL}/offers/{customer_id}?loan_amount={loan_amount}"
    ).json()
    
    return {
        "credit_score": credit['data']['credit_score'],
        "pre_approved": credit['data']['pre_approved_limit'],
        "eligible_products": offers['eligible_products']
    }
```

---

## API Reference Summary

| Method | Endpoint | Purpose | Sample IDs |
|--------|----------|---------|-----------|
| GET | `/` | Service info | - |
| GET | `/health` | Health check | - |
| GET | `/customers` | List customers | - |
| GET | `/crm/{id}` | Customer data | cust_001 - cust_010 |
| GET | `/credit/{id}` | Credit info | cust_001 - cust_010 |
| GET | `/offers/{id}` | Loan products | cust_001 - cust_010 |
| GET | `/calculate-emi` | EMI calculation | amount, rate, months |

---

## Performance Notes

- All responses are **deterministic** (same input = same output)
- No randomization or external API calls
- Response time: **< 10ms** per endpoint
- Suitable for high-volume testing and demos
- No database writes (read-only)

---

## Troubleshooting

### Server Won't Start

**Issue:** Port 9000 already in use
```bash
# Use a different port
uvicorn app:app --port 9001
```

### CORS Errors in Frontend

**Solution:** Server includes CORS middleware. If issues persist:
```python
# Verify in app.py
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

### Customer ID Format

**Note:** IDs are case-insensitive: `cust_001` = `CUST_001` = `Cust_001`

---

## Support & Documentation

- **Interactive Docs:** http://localhost:9000/docs
- **Test File:** `test_mock_services.py`
- **Source Code:** `prototypes/mock_services/app.py`

---

**Last Updated:** December 2025
**Status:** Production Ready ✅
