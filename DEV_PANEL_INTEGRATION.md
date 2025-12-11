# Dev Panel Integration Guide

## What Was Added

### 1. DevPanel Component (NEW FILE)
**Location:** `frontend/src/components/DevPanel.jsx`

A React modal component that:
- Fetches 10 synthetic customers from `/mock/customers` API
- Displays them in a responsive grid
- Shows credit score and pre-approved amount for each
- Handles customer selection with callback

### 2. Backend Endpoint (NEW)
**Location:** `backend/app.py`

```python
@app.get("/mock/customers")
def list_mock_customers():
    """DEV-ONLY endpoint: List all 10 synthetic test customers."""
    # Returns 10 customers with ID, Name, City, Credit Score, Pre-Approved Amount
```

### 3. App.jsx Integration (UPDATED)
**Changes made:**

#### a. Import DevPanel
```javascript
import DevPanel from './components/DevPanel'
```

#### b. Add state
```javascript
const [devPanelOpen, setDevPanelOpen] = useState(false)
```

#### c. New handler function
```javascript
const handleSelectCustomer = (customer) => {
  // Pre-fills loan form with suggested amount (80% of pre-approved)
  // Adds KYC verification message
  // Jumps flow to form stage
  // Closes dev panel
}
```

#### d. Header button
```jsx
<button 
  className="btn btn-dev"
  onClick={() => setDevPanelOpen(!devPanelOpen)}
>
  🔧 Customers
</button>
```

#### e. Render component
```jsx
<DevPanel 
  isOpen={devPanelOpen} 
  onClose={() => setDevPanelOpen(false)}
  onSelectCustomer={handleSelectCustomer}
/>
```

### 4. CSS Styles (UPDATED)
**Location:** `frontend/src/index.css`

Added 170+ lines for:
- `.btn-dev` - Header button styling
- `.dev-panel-overlay` - Modal backdrop
- `.dev-panel` - Modal container with animations
- `.dev-customer-card` - Customer card grid items
- `.dev-select-btn` - Selection button styling
- Responsive media queries for mobile/tablet

---

## User Flow

```
┌─────────────────────────────────────────┐
│  App Header                             │
│  "🏦 Tata Capital"   [🔧 Customers]    │◄─ Click here
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Dev Panel Modal                        │
│  ┌───────┬───────┬───────┬───────┐    │
│  │Rajesh │ Priya │ Amit  │ Neha  │    │
│  │Mumbai │Bng... │Ahmed...│Delhi │    │
│  │💳 785 │💳820  │💳710  │💳750 │    │
│  │💰7.5L │💰10L  │💰5L   │💰6L  │    │
│  │ [PICK]│[PICK] │[PICK] │[PICK]│    │
│  └───────┴───────┴───────┴───────┘    │
│  [5 more customers below...]            │
└─────────────────────────────────────────┘
              │
              ▼ (User clicks customer)
┌─────────────────────────────────────────┐
│  Chat Message (KYC Verified)            │
│  "✅ KYC Verified: Priya Sharma..."    │
│  "💳 Credit Score: 820"                 │
│  "💰 Pre-approved: ₹10L"               │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Loan Form (PRE-FILLED)                 │
│  Amount: ₹8,00,000 (suggested)         │
│  Purpose: Personal Needs               │
│  Tenure: 36 months                     │
│  [Submit Loan Application]             │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Salary Upload (Normal Flow)            │
│  [Normal loan flow continues...]        │
└─────────────────────────────────────────┘
```

---

## Code Architecture

### Component Tree
```
App.jsx
├── ChatWindow
├── LoanForm
├── SalaryUploadForm
├── ActionButtons
└── DevPanel (NEW)
    ├── Panel Header
    ├── Customer Grid
    │  └── Customer Card (×10)
    │      ├── Name + City
    │      ├── Credit Score Badge
    │      ├── Pre-Approved Badge
    │      └── Select Button
    └── Panel Footer
```

### State Management in App
```javascript
// Existing
const [messages, setMessages] = useState([])
const [sessionId, setSessionId] = useState(null)
const [flowStage, setFlowStage] = useState('welcome')
const [loanData, setLoanData] = useState(null)
// ... other states

// NEW
const [devPanelOpen, setDevPanelOpen] = useState(false)
```

### Data Flow
```
User clicks "🔧 Customers"
  → devPanelOpen = true
  → DevPanel mounts
  → useEffect triggers
  → fetch('/mock/customers')
  → Display 10 customers

User clicks "Select & Start"
  → onSelectCustomer(customer)
  → handleSelectCustomer(customer)
  → setLoanData({ ...suggested values })
  → setMessages([...KYC messages])
  → setFlowStage('form')
  → setDevPanelOpen(false)
  → LoanForm component appears with pre-filled data
```

---

## API Contract

### GET /mock/customers

**Request:**
```
GET http://localhost:8000/mock/customers
```

**Response (200 OK):**
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
    },
    {
      "customer_id": "cust_002",
      "name": "Priya Sharma",
      "city": "Bangalore",
      "credit_score": 820,
      "pre_approved": 1000000
    },
    // ... 8 more customers
  ]
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Failed to load customers"
}
```

---

## CSS Classes Reference

### Interactive Elements
- `.btn-dev` - Header button with hover effects
- `.dev-select-btn` - Customer selection button

### Container Elements
- `.dev-panel-overlay` - Modal backdrop (rgba overlay + flex center)
- `.dev-panel` - Modal container (white box with shadow)
- `.dev-panel-header` - Title bar with gradient
- `.dev-panel-body` - Scrollable customer list area
- `.dev-panel-footer` - Help text footer

### Grid & Cards
- `.dev-customers-grid` - CSS Grid layout (auto-fill, min 250px)
- `.dev-customer-card` - Individual customer card with hover effect

### Text & Badges
- `.dev-customer-name` - Bold customer name
- `.dev-customer-city` - Lighter city text
- `.dev-credit-score` - Blue badge with score
- `.dev-pre-approved` - Green badge with ₹ amount

### States
- `.dev-loading` - Loading spinner message
- `.dev-error` - Error message (red background)
- `.dev-empty` - Empty state message

### Animations
- `@keyframes fadeIn` - Overlay fade-in (0.2s)
- `@keyframes slideUp` - Modal slide-up (0.3s)

---

## Testing Checklist

- [ ] Click "🔧 Customers" button in header
- [ ] Modal opens with fade animation
- [ ] 10 customer cards display in grid
- [ ] Credit score badges show correct values
- [ ] Pre-approved amounts show with ₹ symbol
- [ ] Cards have hover effect (slight lift + shadow)
- [ ] Click "Select & Start" on any customer
- [ ] Modal closes smoothly
- [ ] KYC message appears in chat
- [ ] Loan form pre-fills with suggested amount (80% of pre-approved)
- [ ] Form shows correct suggested amount: `pre_approved * 0.8`
- [ ] Can modify pre-filled form values
- [ ] Submit form and continue normal flow
- [ ] Test on mobile (single column grid)
- [ ] Test error handling (disconnect backend, observe error message)

---

## Performance Notes

- **Lazy Load:** Customers only fetched when panel opens (useEffect)
- **Grid Layout:** CSS Grid with auto-fill handles responsive sizing
- **No Pagination:** 10 customers fit comfortably without scrolling (desktop)
- **Smooth Animations:** Uses CSS animations for 60fps performance
- **Minimal Re-renders:** DevPanel state isolated from main App

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requires:**
- ES6+ (arrow functions, destructuring)
- CSS Grid
- CSS Animations
- Fetch API
