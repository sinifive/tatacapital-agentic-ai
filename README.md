# Tata Capital - React + Vite Prototype

## Project Structure

```
capitaltata/
├── src/
│   ├── pages/
│   │   └── TataCapitalPrototype.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   └── app.js                    (Express mock backend)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

## Features

### Frontend
- ⚡ Vite + React 18
- 🎨 Tailwind CSS with custom Tata colors
- 🚀 React Router for navigation
- 📡 Axios for API calls
- ✨ Framer Motion for animations
- 🤖 AI Chatbot widget (TIA)
- 📱 Responsive design

### Backend (Mock)
- Express.js server on port 3001
- 5 REST API endpoints:
  - `POST /api/login` - User authentication
  - `POST /api/verification` - eKYC verification
  - `GET /api/credit-score/:pan` - Credit score lookup
  - `POST /api/apply` - Submit loan application
  - `GET /api/sanction/:applicationId` - Get sanction decision

## Installation & Setup

```bash
# Install dependencies
npm install

# Run both frontend (port 5173) and backend (port 3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run only the backend
npm run server
```

## API Endpoints

### 1. Login
```
POST /api/login
Body: { "name": "John Doe", "pan": "ABCD1234E" }
Response: { "userId", "token", "user" }
```

### 2. Verification
```
POST /api/verification
Body: { "pan": "ABCD1234E", "aadhaar": "1234567890123456" }
Response: { "verified", "status", "verificationId" }
```

### 3. Credit Score
```
GET /api/credit-score/ABCD1234E
Response: { "creditScore", "creditWorthy", "riskLevel", "maxLoanAmount", "roi" }
```

### 4. Apply for Loan
```
POST /api/apply
Body: { "userId", "loanAmount", "tenure", "documents": [...] }
Response: { "applicationId", "status", "estimatedApprovalTime" }
```

### 5. Sanction/Approval Decision
```
GET /api/sanction/app-1234567890
Response: { "status", "sanctionLetter" } or { "status": "rejected", "reason" }
```

## Dependencies

### Production
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.0
- axios: ^1.6.2
- framer-motion: ^10.16.4

### Development
- @vitejs/plugin-react: ^4.2.0
- vite: ^5.0.0
- tailwindcss: ^3.3.0
- postcss: ^8.4.31
- autoprefixer: ^10.4.16
- concurrently: ^8.2.2
- express: ^4.18.2
- cors: ^2.8.5

## Next Steps for Enhancement

- [ ] Add form validation and error handling
- [ ] Implement state management (Zustand/Redux)
- [ ] Add loading states and animations
- [ ] Create reusable components
- [ ] Add unit & integration tests
- [ ] Setup authentication with JWT
- [ ] Add file upload functionality
- [ ] Implement real backend integration
- [ ] Add email notifications
- [ ] Setup payment gateway (Razorpay/PayU)
