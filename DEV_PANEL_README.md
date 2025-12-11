# Dev Panel - Synthetic Customers Feature

## Overview

A **dev-only panel** that allows testers and demo users to quickly select from 10 pre-configured synthetic customers, automatically pre-filling KYC data and jumping the loan flow to the form stage.

Perfect for **rapid demos**, **testing workflows**, and **validation scenarios**.

---

## Features

✅ **10 Synthetic Customers** - Diverse profiles across Indian cities
✅ **One-Click Selection** - Click a customer card to load their KYC
✅ **Auto Pre-Fill** - Loan form pre-populated with credit-based suggestions
✅ **Visual Credit Info** - Credit scores and pre-approved amounts at a glance
✅ **Jump Flow** - Bypasses welcome stage, starts at loan form
✅ **Modal Interface** - Polished overlay with customer grid
✅ **Responsive Design** - Works on desktop, tablet, mobile

---

## How to Use

### Accessing the Dev Panel

1. **Look for the button** in the top-right of the header: `🔧 Customers`
2. **Click it** to open the modal showing all 10 synthetic customers
3. **Select a customer** by clicking "Select & Start" on their card

### What Happens After Selection

1. ✅ Session initializes (if not already active)
2. ✅ KYC verification message displays with customer details
3. ✅ Loan form appears with suggested loan amount (80% of pre-approved)
4. ✅ User can proceed to upload salary document

### Example Customers

| Customer | City | Credit Score | Pre-Approved |
|----------|------|--------------|--------------|
| Rajesh Kumar | Mumbai | 785 | ₹7.5L |
| Priya Sharma | Bangalore | 820 | ₹10L |
| Amit Patel | Ahmedabad | 710 | ₹5L |
| Neha Singh | Delhi | 750 | ₹6L |
| Vikram Desai | Pune | 680 | ₹4L |
| Anjali Gupta | Kolkata | 760 | ₹7L |
| Rohan Malhotra | Hyderabad | 795 | ₹8L |
| Divya Reddy | Chennai | 805 | ₹8.5L |
| Karan Verma | Gurgaon | 815 | ₹9L |
| Shalini Iyer | Kochi | 770 | ₹6.5L |

---

## Technical Implementation

### Files Modified

#### 1. **frontend/src/components/DevPanel.jsx** (NEW)
   - React component for the customer selection modal
   - Fetches customers from `/mock/customers` endpoint
   - Displays grid of customer cards with credit/pre-approved info
   - Handles customer selection with callback

#### 2. **frontend/src/App.jsx** (UPDATED)
   - Added `DevPanel` import
   - Added `devPanelOpen` state management
   - Added `handleSelectCustomer()` function to pre-fill loan data
   - Added `🔧 Customers` button in header
   - Renders `<DevPanel>` component with props

#### 3. **frontend/src/index.css** (UPDATED)
   - Added 150+ lines of dev panel styles
   - Modal overlay with fade-in animation
   - Customer card grid with hover effects
   - Responsive design for mobile/tablet
   - Credit score and pre-approved badges

#### 4. **backend/app.py** (UPDATED)
   - Added `GET /mock/customers` endpoint
   - Returns 10 synthetic customers with:
     - ID, Name, City
     - Credit Score, Pre-Approved Amount
   - CORS-enabled for frontend access

---

## Endpoint Details

### GET /mock/customers

**Purpose:** Retrieve list of synthetic customers for dev panel

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
    },
    ...
  ]
}
```

**Usage:** Called automatically by `DevPanel.jsx` when modal opens

---

## Flow Diagram

```
User clicks 🔧 Customers
         ↓
Dev Panel Modal Opens
         ↓
Fetches /mock/customers API
         ↓
Displays 10 customer cards
         ↓
User clicks "Select & Start"
         ↓
handleSelectCustomer() called
         ↓
Loan data pre-filled (80% pre-approved)
         ↓
KYC verification message shown
         ↓
Flow jumps to form stage
         ↓
User sees pre-filled loan form
```

---

## Demo Script

### Quick Demo in 30 Seconds

1. Open the app at `http://localhost:5173`
2. Click `🔧 Customers` in top-right
3. Click "Select & Start" on **Priya Sharma** (best credit score 820)
4. See KYC verified message with ₹10L pre-approved
5. Form shows suggested ₹8L loan amount
6. Click "Submit Loan Application"
7. Upload a sample salary document
8. Watch underwriting progress
9. Download sanction letter in 2 seconds

**Total time: ~30 seconds** ✨

---

## Customization

### Adding More Customers

Edit `/backend/app.py` in the `list_mock_customers()` function:

```python
"cust_011": {
    "customer_id": "cust_011",
    "name": "Your Customer Name",
    "city": "Your City",
    "credit_score": 750,
    "pre_approved": 600000,
}
```

### Changing Pre-Fill Logic

Edit `App.jsx` `handleSelectCustomer()` function:

```javascript
const suggestedAmount = customer.pre_approved * 0.8 // Change multiplier here
```

### Styling Customization

Dev Panel CSS is in `index.css` under `/* DEV PANEL STYLES */` section:
- Colors: Modify `.dev-panel`, `.dev-select-btn` gradients
- Grid layout: Change `grid-template-columns` in `.dev-customers-grid`
- Animation: Adjust timing in `@keyframes slideUp` and `fadeIn`

---

## Testing Scenarios

### Scenario 1: High Credit Score Demo
- **Customer:** Priya Sharma (Credit: 820)
- **Expected:** Pre-approved ₹10L
- **Use Case:** Show premium product capabilities

### Scenario 2: Fair Credit Score
- **Customer:** Amit Patel (Credit: 710)
- **Expected:** Pre-approved ₹5L
- **Use Case:** Show risk management, lower limits

### Scenario 3: Average Credit Score
- **Customer:** Vikram Desai (Credit: 680)
- **Expected:** Pre-approved ₹4L
- **Use Case:** Demonstrate near-threshold approval

---

## Troubleshooting

### Dev Panel doesn't open
- ✅ Check browser console for errors
- ✅ Verify backend is running on port 8000
- ✅ Check CORS headers in network tab

### Customers don't load
- ✅ Verify `/mock/customers` endpoint responds: `curl http://localhost:8000/mock/customers`
- ✅ Check network tab for 200 status code
- ✅ Verify JSON response has `customers` array

### Form doesn't pre-fill
- ✅ Check browser console for JavaScript errors
- ✅ Verify `handleSelectCustomer()` receives customer object
- ✅ Check `loanData` state in React DevTools

---

## Future Enhancements

- [ ] Filter customers by credit score range
- [ ] Search customers by name/city
- [ ] Bulk test scenarios (run 5 flows simultaneously)
- [ ] Export customer data as CSV
- [ ] Save/load custom customer profiles
- [ ] A/B test different messaging with customers

---

## Support

For issues or improvements, check:
- `frontend/src/components/DevPanel.jsx` - Component logic
- `frontend/src/App.jsx` - Integration logic
- `backend/app.py` - Endpoint implementation
- `frontend/src/index.css` - UI styling (search "DEV PANEL")
