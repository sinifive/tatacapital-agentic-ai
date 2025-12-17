# 🏦 Tata Capital - Agentic AI Fintech Platform

A modern, intelligent digital lending platform built with React, Express.js, and Google Gemini AI. Features conversational loan application through an AI chatbot with KYC verification, credit scoring, and automated underwriting.

---

## ✨ Key Features

### 🤖 **AI-Powered Chatbot (TIA)**
- Real-time conversation with Google Gemini API
- Tata Capital context injection for accurate responses
- Multi-mode operation (ANSWERING, APPLYING, COMPLETED)
- Conversational loan application without page redirects

### 📱 **Intelligent Application System**
- Homepage with Benefits, How It Works, Trust, and FAQ sections
- Loan selection (Personal/Business)
- Chat-based form collection (one field at a time)
- Real-time application status tracking

### 🔍 **Advanced Verification & Scoring**
- KYC verification with document handling
- Hash-based credit scoring algorithm
- Risk assessment and underwriting engine
- Automated approval workflow

### 📊 **Dashboard & Analytics**
- My Applications view with status tracking
- Application history
- Real-time progress indicators

### 📄 **Digital Documentation**
- PDF generation for sanction letters
- Digital signature support
- Professional document management

---

## 🛠️ Technology Stack

### Frontend
- **React** 18.2 - UI framework
- **Vite** 5.4 - Build tool
- **Tailwind CSS** 3.3 - Styling
- **Framer Motion** 10.16 - Animations
- **React Router** 6.20 - Navigation
- **Axios** 1.6.2 - HTTP client

### Backend
- **Express.js** 4.18 - Server framework
- **SQLite3** 5.1.6 - Database
- **Multer** 1.4.5 - File upload handling
- **PDFKit** 0.17.2 - PDF generation
- **bcryptjs** 2.4.3 - Password hashing

### AI & External Services
- **Google Gemini API** - Intelligent chatbot
- **Custom KYC Module** - Document verification
- **Credit Scoring Engine** - Risk assessment
- **Underwriting Module** - Loan approval logic

---

## 📁 Project Structure

```
tatacapital-agentic-ai/
├── src/
│   ├── components/
│   │   ├── Hero.jsx                 # Homepage hero section
│   │   ├── BenefitsSection.jsx      # Benefits showcase
│   │   ├── HowItWorks.jsx           # 5-step application flow
│   │   ├── TrustSection.jsx         # Testimonials & trust points
│   │   ├── FAQSection.jsx           # FAQ section
│   │   ├── ChatWidget.jsx           # AI chatbot interface
│   │   ├── Apply.jsx                # Application form
│   │   ├── ApplicationStatus.jsx    # Status tracking
│   │   ├── MyApplications.jsx       # My applications view
│   │   ├── LoginModal.jsx           # Authentication
│   │   └── [other components]
│   ├── utils/
│   │   ├── chatAPI.js               # Chat API client
│   │   ├── fileHandling.js          # File upload utilities
│   │   └── sessionStorage.js        # Session management
│   ├── pages/
│   │   └── TataCapitalPrototype.jsx # Main app page
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── app.js                       # Express server (port 3001)
│   ├── database.js                  # SQLite operations
│   ├── geminiService.js             # Gemini API integration
│   ├── rules.json                   # Business rules
│   └── [other services]
├── diagrams/
│   ├── 00_Start_Here.html          # Navigation hub
│   ├── 01_Architecture.html         # System architecture
│   ├── 02_Flowchart.html           # User journey
│   ├── 03_Charts_Graphs.html        # Analytics & visualizations
│   ├── 04_Wireframes.html          # UI wireframes
│   └── 05_Tech_Stack.html          # Tech stack details
├── data/
│   └── tata_capital.db              # SQLite database
├── package.json
├── vite.config.js
├── tailwind.config.js
└── PROJECT_DOCUMENTATION.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sinifive/tatacapital-agentic-ai.git
cd tatacapital-agentic-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create a `.env` file in the root:
```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start development servers**

Terminal 1 - Frontend (Vite):
```bash
npm run dev
```

Terminal 2 - Backend (Express):
```bash
npm run server
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3001`

---

## 📊 Core APIs

### Chat Endpoint
```
POST /api/chat
Body: {
  message: string,
  conversationHistory: Array,
  sessionMode: 'ANSWERING' | 'APPLYING' | 'COMPLETED',
  formData: Object
}

Response: {
  success: boolean,
  reply: string,
  mode: string,
  nextField: string,
  formData: Object,
  timestamp: Date
}
```

### Application Endpoints
```
POST /api/submit          # Submit application
GET  /api/status/:id      # Get application status
GET  /api/fetch           # Fetch user applications
POST /api/verify          # KYC verification
GET  /api/credit-score    # Credit score check
POST /api/generate-pdf    # Generate sanction letter
```

---

## 🎯 Workflow

1. **User Arrives** → Browses loan options
2. **Inquiry Phase** → Chats with TIA bot (answers via Gemini)
3. **Application** → Chooses to apply via chat or form
4. **Data Collection** → Bot asks form fields conversationally
5. **Verification** → KYC document verification
6. **Credit Check** → Hash-based credit scoring
7. **Underwriting** → Risk assessment
8. **Approval** → Generate sanction letter
9. **Disbursement** → Funds transferred to account

---

## 📊 Presentation Diagrams

Professional presentation materials included:

- **Architecture Diagram** - System components & data flow
- **User Journey Flowchart** - Complete application flow
- **Data Visualizations** - Analytics & metrics
- **UI Wireframes** - 6 screen layouts
- **Tech Stack Breakdown** - Technologies & modules

Open `/diagrams/00_Start_Here.html` in browser to view all diagrams.

---

## 💾 Database Schema

### Tables
- **Users** - User authentication & profile
- **Applications** - Loan applications
- **Verifications** - KYC verification status
- **Credit_Scores** - Credit rating history
- **Underwriting** - Loan approval assessment
- **Sanctions** - Sanction letters & disbursement

---

## 🔐 Security Features

✅ Password hashing with bcryptjs
✅ Session management
✅ Secure file upload (5MB limit)
✅ API request validation
✅ Error handling & logging

---

## 📈 Key Metrics

- **Total Components**: 14+ React components
- **API Endpoints**: 12+ REST endpoints
- **Database Tables**: 5+ relational tables
- **Lines of Code**: 3,200+ total
- **Presentation Diagrams**: 6 professional HTML files
- **Processing Time**: <24 hours average

---

## 🎨 Chat Features

**Chat Modes:**
- 🟢 **ANSWERING** - Bot answers questions with Gemini AI
- 🟡 **APPLYING** - Bot collects application data conversationally
- 🔵 **COMPLETED** - Form complete, ready to submit

**Application Status:**
- ✅ Approved
- ⏳ Under Review
- ❌ Rejected
- 📄 Sanctioned
- 💰 Disbursed

---

## 📝 Configuration Files

- `vite.config.js` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS for Tailwind
- `package.json` - Dependencies and scripts
- `.gitignore` - Git ignore rules

---

## 🤝 Contributing

This is a showcase project for Tata Capital fintech platform. For contributions:

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Push and create a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👨‍💻 Developer

Created as a modern fintech solution for Tata Capital digital lending.

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

## 🔗 Links

- **GitHub**: https://github.com/sinifive/tatacapital-agentic-ai
- **Live Demo**: Coming soon
- **Documentation**: See `PROJECT_DOCUMENTATION.md`

---

**Built with ❤️ for modern digital lending** 🚀
