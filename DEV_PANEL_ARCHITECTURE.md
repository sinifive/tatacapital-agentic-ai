# Dev Panel - Visual Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TATA CAPITAL APP                         │
│                   (React Frontend + FastAPI Backend)             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         App Header (with 🔧 Customers button)            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  🏦 Tata Capital          [●Active] [🔧 Customers] ◄────┤  │ Click
│  └──────────────────────────────────────────────────────────┘  │
│                                    │                             │
│                                    ▼                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         DevPanel Modal (Overlay)                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  🔧 DEV: Synthetic Customers                      [✕]   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Grid of 10 Customer Cards:                             │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│  │  │ Rajesh      │ │ Priya       │ │ Amit        │       │  │
│  │  │ Mumbai      │ │ Bangalore   │ │ Ahmedabad   │       │  │
│  │  │ 💳 785      │ │ 💳 820      │ │ 💳 710      │       │  │
│  │  │ 💰 7.5L     │ │ 💰 10L      │ │ 💰 5L       │       │  │
│  │  │[Select&Strt]│ │[Select&Strt]│ │[Select&Strt]│       │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│  │                                                          │  │
│  │  [5 more customers...]                                  │  │
│  │                                                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  💡 Select a customer to pre-fill KYC and jump flow     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        │                                        │
│                        ▼ (User selects customer)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Chat Messages (Updated)                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Bot: ✅ KYC Verified: Priya Sharma from Bangalore      │  │
│  │       💳 Credit Score: 820                               │  │
│  │       💰 Pre-approved: ₹10L                             │  │
│  │                                                          │  │
│  │  Bot: Great! I've pre-filled your loan form based on    │  │
│  │       your profile. You can request up to ₹8L...        │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Loan Form (Pre-Filled)                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Loan Amount:    [₹800,000]  (pre-filled, editable)    │  │
│  │  Purpose:        [Personal Needs]  (default)            │  │
│  │  Tenure:         [36] months  (default)                │  │
│  │                                                          │  │
│  │                    [Submit Loan Application]             │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        │                                        │
│                        ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Normal Loan Flow (Upload, Underwriting, Download)     │  │
│  │   ... (continues as usual)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.jsx
├── Header
│   ├── Title (🏦 Tata Capital)
│   ├── Status Badges
│   └── 🔧 Customers Button (onClick: setDevPanelOpen(true))
│
├── DevPanel (NEW)
│   ├── Overlay (Modal Backdrop)
│   └── Modal Container
│       ├── Header
│       │   ├── Title (🔧 DEV: Synthetic Customers)
│       │   └── Close Button
│       │
│       ├── Body (Scrollable)
│       │   └── Customer Grid
│       │       ├── Customer Card 1
│       │       │   ├── Name + City
│       │       │   ├── Credit Score Badge
│       │       │   ├── Pre-Approved Badge
│       │       │   └── Select Button
│       │       ├── Customer Card 2
│       │       └── ... (10 total)
│       │
│       └── Footer
│           └── Help Text
│
├── ChatWindow
│   └── Message List
│       ├── Welcome Message
│       ├── KYC Verification (from selection)
│       ├── Form Instructions
│       └── ... (normal flow)
│
├── LoanForm (Pre-filled after selection)
│   ├── Amount Input (pre-filled)
│   ├── Purpose Select (pre-filled)
│   ├── Tenure Input (pre-filled)
│   └── Submit Button
│
├── SalaryUploadForm (after form submitted)
│   ├── File Drop Zone
│   └── Upload Button
│
└── ActionButtons
    ├── Start Loan Flow Button
    └── Download Sanction Button
```

---

## State Flow Diagram

```
Initial App Load
    ↓
[devPanelOpen = false] ← Dev panel hidden
    ↓
Header Rendered
    ├─ "🔧 Customers" button visible
    │   onClick → setDevPanelOpen(true)
    │
└─ "🔧 Customers" clicked
    ↓
[devPanelOpen = true] ← Dev panel visible
    ↓
DevPanel Component Mounts
    ↓
useEffect Triggered (isOpen=true)
    ↓
fetch('http://localhost:8000/mock/customers')
    ├─ Loading: true → Show spinner
    ├─ Success → setCustomers([...10 customers])
    └─ Error → Show error message
    ↓
Display Grid of 10 Customers
    ├─ Each card shows: Name, City, Score, Pre-Approved
    └─ Each has "Select & Start" button
    ↓
User Clicks "Select & Start" on Priya Sharma
    ↓
onSelectCustomer(customer) called
    │
    └─→ handleSelectCustomer(customer) in App.jsx
        ├─ Calculate: suggestedAmount = 1000000 * 0.8 = 800000
        ├─ setLoanData({ loanAmount: 800000, purpose: '...', tenure: 36 })
        ├─ Add KYC Message to Chat
        ├─ Add Form Info Message to Chat
        ├─ setFlowStage('form')
        └─ setDevPanelOpen(false) ← Close modal
        ↓
[devPanelOpen = false] ← Modal hidden
    ↓
LoanForm Component Renders with Pre-Filled Values
    ├─ Amount: ₹8,00,000 (from loanData)
    ├─ Purpose: Personal Needs (default)
    └─ Tenure: 36 months (default)
    ↓
User Views Pre-Filled Form
    ├─ Can edit all values if desired
    └─ Clicks "Submit Loan Application"
    ↓
Normal Loan Flow Continues
    ├─ SalaryUploadForm appears
    ├─ File upload & processing
    ├─ Underwriting simulation
    └─ Download sanction letter
```

---

## Data Flow: Customer Selection

```
Frontend Request
────────────────

GET /mock/customers
    │
    ▼
DevPanel.jsx:
  fetch('http://localhost:8000/mock/customers')
    │
    ├─ Loading state: true
    │ (Show spinner)
    │
    └─ HTTP GET Request
        │
        ▼
Backend Response
────────────────

FastAPI app.py:
  @app.get("/mock/customers")
  def list_mock_customers():
      return {
        "status": "success",
        "customer_count": 10,
        "customers": [
            {
              "customer_id": "cust_001",
              "name": "Rajesh Kumar",
              "city": "Mumbai",
              "credit_score": 785,
              "pre_approved": 750000
            },
            {
              "customer_id": "cust_002",
              "name": "Priya Sharma",
              "city": "Bangalore",
              "credit_score": 820,
              "pre_approved": 1000000
            },
            ... (8 more)
        ]
      }
        │
        ▼
Frontend Processing
──────────────────

DevPanel.jsx:
  const data = await response.json()
  setCustomers(data.customers)
        │
        ├─ Render Customer Grid
        │ (10 cards with:
        │  - Name + City
        │  - Credit Score Badge
        │  - Pre-Approved Badge
        │  - Select Button)
        │
        └─ User Clicks Customer
            │
            ▼
App.jsx - handleSelectCustomer(customer):
  1. suggestedAmount = customer.pre_approved * 0.8
  2. setLoanData({ amount, purpose, tenure })
  3. Add message: "✅ KYC Verified: [name]..."
  4. Add message: "I've pre-filled your form..."
  5. setFlowStage('form')
  6. setDevPanelOpen(false)
            │
            ▼
Loan Form Component:
  Displays with pre-filled values from loanData
  User sees: Amount ₹8,00,000 (80% of pre-approved ₹10,00,000)
```

---

## API Endpoint Specification

```
┌─────────────────────────────────────────────────────────────┐
│  GET /mock/customers                                        │
├─────────────────────────────────────────────────────────────┤
│  Purpose: Fetch list of 10 synthetic test customers         │
│  Type: DEV-ONLY (for frontend dev panel)                   │
│  Auth: None (dev endpoint)                                  │
│  Rate Limit: None (dev endpoint)                           │
├─────────────────────────────────────────────────────────────┤
│  Request:                                                   │
│  GET http://localhost:8000/mock/customers                  │
│                                                             │
│  Response (200 OK):                                         │
│  {                                                          │
│    "status": "success",                                    │
│    "customer_count": 10,                                   │
│    "customers": [                                          │
│      {                                                      │
│        "customer_id": "cust_001",                          │
│        "name": "Rajesh Kumar",                             │
│        "city": "Mumbai",                                   │
│        "credit_score": 785,                                │
│        "pre_approved": 750000                              │
│      },                                                     │
│      ... (9 more customers)                                │
│    ]                                                        │
│  }                                                          │
│                                                             │
│  Response (Error):                                          │
│  {                                                          │
│    "detail": "Error message"                               │
│  }                                                          │
├─────────────────────────────────────────────────────────────┤
│  Usage: Called by DevPanel.jsx on modal open                │
│  Called from: fetch() in useEffect                          │
│  Frequency: Once per modal open                             │
│  Caching: None (fresh load each time)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## CSS Animation Timeline

```
Event                Timeline          Animation
─────────────────────────────────────────────────────
User clicks button
    │
    ▼
[0ms]   setDevPanelOpen(true)
    │   ↓ Modal renders
[0-100ms] Overlay fades in  ◀─── @keyframes fadeIn (0.2s)
    │   (opacity 0 → 1)
    │
[100ms] Modal slides up    ◀─── @keyframes slideUp (0.3s)
    │   (translateY 20px → 0)
    │   (opacity 0 → 1)
[200ms] Customer cards     ◀─── Staggered by CSS :nth-child
    │   fade in gradually      (no separate animation)
[300ms] Animation complete
    │   Modal fully visible
    │
[User selects customer]
    │   ↓ Hover effect active
[Hover] Card lifts +shadow ◀─── transform: translateY(-2px)
    │   (transition: 0.3s)
[Click] Button scales     ◀─── transform: scale(0.98)
    │   (active state)
[Release] Back to normal
    │   ↓
[300ms] Modal closes      ◀─── Same slideUp/fadeIn reversed
[600ms] Modal hidden
```

---

## Pre-Fill Logic Visualization

```
Customer Selected: Priya Sharma

Input Data:
  credit_score: 820 (Excellent)
  pre_approved: 1,000,000 (₹10L)
        │
        ▼
handleSelectCustomer() Logic:
        │
        ├─ suggestedAmount = pre_approved × 0.8
        │                   = 1,000,000 × 0.8
        │                   = 800,000
        │
        ├─ setLoanData({
        │    loanAmount: 800,000
        │    purpose: 'Personal Needs'
        │    tenure: 36
        │  })
        │
        └─ Messages Added:
             1. KYC Verification
                ✅ KYC Verified: Priya Sharma from Bangalore
                💳 Credit Score: 820
                💰 Pre-approved: ₹10L
             
             2. Form Information
                Great! I've pre-filled your loan form...
                You can request up to ₹8L
        ▼
Form Component Renders:
        │
        ├─ Amount Input
        │  ┌─────────────────┐
        │  │ ₹ 800,000      │  ◀─ Pre-filled from loanData
        │  │                 │     (User can edit)
        │  └─────────────────┘
        │
        ├─ Purpose Dropdown
        │  ┌─────────────────┐
        │  │ Personal Needs │  ◀─ Pre-filled (default)
        │  └─────────────────┘
        │
        ├─ Tenure Input
        │  ┌─────────────────┐
        │  │ 36 months      │  ◀─ Pre-filled (default)
        │  └─────────────────┘
        │
        └─ Submit Button
           [Submit Loan Application]

Result:
  User sees form ready to submit with realistic values
  Saves ~30 seconds vs manual data entry
  Can easily modify if needed
```

---

## Mobile Responsive Layout

```
Desktop (>768px)                    Tablet (600-768px)
─────────────────                   ──────────────────
┌──────────────────┐                ┌──────────────┐
│ Dev Panel Modal  │                │ Dev Modal    │
│ ┌──────┬──────┐  │                │ ┌─────────┐  │
│ │ Card │ Card │  │                │ │  Card   │  │
│ ├──────┼──────┤  │                │ ├─────────┤  │
│ │ Card │ Card │  │ 2-column       │ │  Card   │  │ 1-col
│ └──────┴──────┘  │ grid           │ ├─────────┤  │ grid
│ [More below]     │                │ │  Card   │  │
└──────────────────┘                │ └─────────┘  │
                                    └──────────────┘

Mobile (<600px)
───────────────
┌────────────┐
│ Dev Modal  │
│ (Full Wdt) │
├────────────┤
│  Card 1    │
├────────────┤
│  Card 2    │
├────────────┤
│  Card 3    │
├────────────┤
│  [Scroll]  │
└────────────┘

CSS: grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
     @media (max-width: 600px) { grid-template-columns: 1fr }
```

---

## Error Handling Paths

```
Fetch /mock/customers
    │
    ├─ [OFFLINE BACKEND]
    │  ↓
    │  Network Error
    │  ↓
    │  setError('Failed to fetch customers')
    │  ↓
    │  Display: ❌ Error: Failed to fetch customers
    │
    ├─ [HTTP 500]
    │  ↓
    │  Server Error
    │  ↓
    │  response.ok = false
    │  ↓
    │  throw new Error('Failed to fetch...')
    │  ↓
    │  Display: ❌ Error message
    │
    ├─ [TIMEOUT]
    │  ↓
    │  Request hangs
    │  ↓
    │  Network timeout
    │  ↓
    │  Catch block
    │  ↓
    │  Display: ❌ Error
    │
    └─ [SUCCESS 200]
       ↓
       data.customers array
       ↓
       setCustomers(data.customers)
       ↓
       Render grid successfully
```

---

## Feature Completeness Matrix

```
Feature              Status  Notes
─────────────────────────────────────────────────
Dev Panel Modal      ✅✅   Full implementation
Customer Grid        ✅✅   10 customers configured
Selection Handler    ✅✅   Pre-fill logic complete
KYC Messages         ✅✅   Dynamic based on customer
Form Pre-Fill        ✅✅   80% pre-approved logic
Flow Jump            ✅✅   Jumps to form stage
Animations           ✅✅   Fade + Slide effects
Responsive Design    ✅✅   Desktop, Tablet, Mobile
Error States         ✅✅   Loading, Error, Empty
API Endpoint         ✅✅   /mock/customers working
Documentation        ✅✅   4 comprehensive guides
Testing              ✅✅   Checklist provided
─────────────────────────────────────────────────
Overall: 100% COMPLETE
```
