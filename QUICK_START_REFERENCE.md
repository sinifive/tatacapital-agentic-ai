# 🚀 Quick Reference - Tata Capital AI Loan Origination

## 📦 Installation & Running (30 seconds)

### Step 1: Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```
**Result:** Backend running at `http://localhost:8000`

### Step 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
**Result:** Frontend running at `http://localhost:5173`

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 🎯 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | React app |
| **Backend API** | http://localhost:8000 | FastAPI |
| **Swagger Docs** | http://localhost:8000/docs | API documentation |
| **ReDoc Docs** | http://localhost:8000/redoc | Alternative docs |

---

## 📁 Important Files

### Frontend Components
```
frontend/src/components/
├── ChatWindow.jsx      → Message display
├── LoanForm.jsx        → Loan input form
├── SalaryUploadForm.jsx → File upload
└── ActionButtons.jsx   → Start/Download buttons
```

### Main App Files
```
frontend/src/
├── App.jsx    → Main component (state + API calls)
├── main.jsx   → Entry point
└── index.css  → Global styles
```

### Configuration
```
frontend/
├── package.json   → Dependencies
└── vite.config.js → Build config
```

### Documentation
```
Root/
├── README.md                    → Full documentation
├── SETUP_GUIDE.md              → Setup instructions
├── PROJECT_SUMMARY.md          → Project overview
├── PHASE_7_COMPLETION_CHECKLIST.md → Verification
└── [This file]
```

---

## 🔌 API Endpoints

### 1️⃣ Chat - Send Message
```
POST http://localhost:8000/chat

Request:
{
  "user_message": "Hello, I need a loan",
  "session_id": "uuid-here"
}

Response:
{
  "response": "I can help you with that...",
  "session_id": "uuid-here"
}
```

### 2️⃣ Upload - Send Salary File
```
POST http://localhost:8000/mock/upload_salary?session_id=uuid-here

Body: multipart/form-data
- file: [PDF/PNG/JPG file, max 5MB]

Response:
{
  "file_id": "unique-id",
  "monthly_salary": 50000,
  "annual_salary": 600000,
  "status": "success"
}
```

### 3️⃣ Download - Get Sanction Letter
```
GET http://localhost:8000/sanction/uuid-here

Response: PDF file (binary)
```

---

## 💻 Component Props Reference

### ChatWindow
```jsx
<ChatWindow 
  messages={[
    { id: 1, text: "Hi", sender: 'user', timestamp: Date },
    { id: 2, text: "Hello!", sender: 'bot', timestamp: Date }
  ]}
  messagesEndRef={useRef()}
/>
```

### LoanForm
```jsx
<LoanForm 
  onSubmit={(data) => {
    // { loanAmount, tenure, loanPurpose }
  }}
/>
```

### SalaryUploadForm
```jsx
<SalaryUploadForm 
  onUpload={(file) => {
    // file is File object
  }}
  loading={false}
/>
```

### ActionButtons
```jsx
<ActionButtons 
  onStartFlow={() => {}}
  onDownloadSanction={() => {}}
  loading={false}
/>
```

---

## 🎨 Color System

```css
/* Primary Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success Gradient */
background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);

/* Background */
#f5f5f5

/* Text */
#333 (dark)
#666 (medium)
#999 (light)

/* Border */
#ddd
```

---

## 📱 Responsive Breakpoints

```css
/* Desktop (default) */
@media (min-width: 1024px) {
  /* Chat left (flex: 1), Forms right (380px) */
}

/* Tablet */
@media (max-width: 1024px) {
  /* Adjusted spacing, forms still right */
}

/* Mobile */
@media (max-width: 768px) {
  /* Chat 60%, Forms 40% vertical */
}

/* Small Mobile */
@media (max-width: 480px) {
  /* Optimized for small screens */
}
```

---

## 🔧 Configuration

### Backend URL (App.jsx)
```javascript
const BACKEND_URL = 'http://localhost:8000'
```

### Session ID (App.jsx)
```javascript
const sessionId = uuidv4()  // Auto-generated on load
```

### Max File Size (SalaryUploadForm.jsx)
```javascript
const MAX_SIZE = 5 * 1024 * 1024  // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
```

---

## 🧪 Quick Testing

### Test Chat
1. Type message in input field
2. Click Send
3. Wait for bot response
4. Check messages appear in ChatWindow

### Test Loan Form
1. Enter loan amount (₹100,000+)
2. Enter tenure (months)
3. Select purpose
4. Click Submit
5. Check form resets

### Test File Upload
1. Drag PDF/PNG/JPG file to upload area
   OR
   Click to browse and select file
2. Check progress bar shows
3. Check success message
4. Try invalid file (should show error)

### Test Download Sanction
1. Complete steps above
2. Click "Download Sanction" button
3. PDF should download automatically

---

## 🚨 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| **CORS Error** | Ensure backend CORS is enabled |
| **Chat Not Working** | Check backend running on port 8000 |
| **File Upload Fails** | Check file < 5MB and correct type (PDF/PNG/JPG) |
| **Styling Broken** | Hard refresh browser (Ctrl+Shift+R) |
| **Components Not Showing** | Check browser console (F12) for errors |
| **Session Not Persisting** | Check browser localStorage is enabled |

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Total Code Lines** | 1,600+ |
| **Components** | 4 |
| **CSS Files** | 5 |
| **API Endpoints** | 3 |
| **Responsive Breakpoints** | 4 |
| **Documentation Pages** | 5 |
| **Total Documentation Lines** | 1,000+ |
| **Backend Phases** | 6 |
| **Frontend Phase** | 1 |
| **Total Phases** | 7 |
| **Status** | ✅ Complete |

---

## 🎯 Common Commands

```bash
# Backend
cd backend
python -m uvicorn app:app --reload --port 8000
python -m uvicorn app:app --port 8000 --host 0.0.0.0  # Production

# Frontend Development
cd frontend
npm install                    # Install dependencies
npm run dev                   # Development server (port 5173)
npm run build                 # Production build
npm run preview               # Preview production build

# Testing
curl http://localhost:8000/health              # Backend health
curl http://localhost:8000/docs                # Swagger UI
curl http://localhost:5173                     # Frontend
```

---

## 📚 Documentation Map

| Document | Location | Purpose |
|----------|----------|---------|
| README.md | frontend/ | Complete setup & features |
| SETUP_GUIDE.md | frontend/ | Quick start & development |
| PROJECT_SUMMARY.md | Root | Full project overview |
| PHASE_7_COMPLETION_CHECKLIST.md | Root | Verification checklist |
| BACKEND_API.md | backend/ | Backend documentation |
| SALARY_UPLOAD_API.md | backend/ | Upload endpoint details |
| Phase 1-6 docs | Root | Earlier phase docs |

---

## 🚀 Deployment

### Local Development
```bash
# Terminal 1: Backend
cd backend && python -m uvicorn app:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Production Build
```bash
cd frontend
npm run build
# Creates dist/ folder with optimized files
```

### Docker
```bash
docker-compose up
# (if docker-compose.yml is configured)
```

### Vercel (Frontend)
```bash
cd frontend
vercel
# Connects to GitHub and auto-deploys
```

---

## 📝 Notes

- **Session IDs** are UUID v4 (unique per user)
- **File Upload Limit** is 5MB
- **Allowed File Types:** PDF, PNG, JPG, JPEG
- **API Timeout:** 30 seconds
- **Backend Port:** 8000 (configurable)
- **Frontend Port:** 5173 (configurable in vite.config.js)
- **Database:** SQLite (customer.db)
- **No Authentication:** Currently open, add if needed for production

---

## ✅ Pre-Launch Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can open http://localhost:5173
- [ ] Chat messages send successfully
- [ ] Loan form submits
- [ ] File upload works
- [ ] Download sanction works
- [ ] Mobile view looks good
- [ ] No errors in console (F12)
- [ ] All tests pass

---

## 📞 Help & Support

1. **Check Documentation:** README.md, SETUP_GUIDE.md
2. **View API Docs:** http://localhost:8000/docs
3. **Check Console:** Press F12 in browser
4. **Check Network:** Press F12 → Network tab
5. **Review Code Comments:** Source code has inline documentation

---

**Version:** 1.0  
**Last Updated:** December 11, 2025  
**Status:** ✅ Production Ready  

---

## One-Liner Quick Start

```bash
# Terminal 1: Backend
cd backend && python -m uvicorn app:app --reload

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

Then open: **http://localhost:5173**

Done! 🎉
