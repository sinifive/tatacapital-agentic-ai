# Frontend Setup & Getting Started Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Backend
```bash
# In a separate terminal
cd backend
python -m uvicorn app:app --reload --port 8000
```

### 3. Start Frontend Dev Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

## What You'll See

```
┌─────────────────────────────────────────────────────────┐
│  Tata Capital - AI-Powered Loan Origination             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │                         │  │ [START LOAN FLOW]    │ │
│  │   CHAT WINDOW           │  │ [DOWNLOAD SANCTION]  │ │
│  │   (Messages here)       │  ├──────────────────────┤ │
│  │                         │  │ LOAN FORM            │ │
│  │                         │  │ • Loan Amount        │ │
│  │                         │  │ • Tenure             │ │
│  │                         │  │ • Purpose            │ │
│  │                         │  ├──────────────────────┤ │
│  │                         │  │ SALARY UPLOAD        │ │
│  │                         │  │ (Drag & drop files)  │ │
│  │                         │  │                      │ │
│  ├─────────────────────────┤  └──────────────────────┘ │
│  │ [Message Input] [Send] │                            │
│  └─────────────────────────┘                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx              # Chat display
│   │   ├── ChatWindow.css
│   │   ├── LoanForm.jsx                # Loan input
│   │   ├── LoanForm.css
│   │   ├── SalaryUploadForm.jsx        # File upload
│   │   ├── SalaryUploadForm.css
│   │   ├── ActionButtons.jsx           # Primary buttons
│   │   └── ActionButtons.css
│   ├── App.jsx                         # Main app
│   ├── index.css                       # Global styles
│   └── main.jsx                        # Entry point
├── index.html                          # HTML
├── package.json                        # Dependencies
├── vite.config.js                      # Vite config
└── README.md                           # Documentation
```

## Component Overview

### App.jsx (Main Component)
**Responsibilities:**
- Session management (unique ID per user)
- Message history state
- Loan data storage
- Salary file ID tracking
- Backend API calls

**Key Functions:**
- `sendMessage()` - Send chat to backend
- `handleStartLoanFlow()` - Initiate loan process
- `handleLoanFormSubmit()` - Process loan form
- `handleSalaryUpload()` - Upload salary file
- `handleDownloadSanction()` - Download PDF

### ChatWindow Component
**Props:**
- `messages` - Array of message objects
- `messagesEndRef` - Ref for auto-scroll

**Features:**
- Real-time message display
- User vs bot message styling
- Timestamps
- Empty state with tips
- Auto-scroll

### LoanForm Component
**Props:**
- `onSubmit` - Callback with form data

**Form Fields:**
- Loan Amount (number input)
- Tenure (months, number input)
- Loan Purpose (select dropdown)

**Features:**
- Real-time formatting
- Validation
- Currency display
- Year conversion

### SalaryUploadForm Component
**Props:**
- `onUpload` - Callback with file
- `loading` - Loading state

**Features:**
- Drag-and-drop
- Click to browse
- File validation
- Size limit (5MB)
- Progress indicator

### ActionButtons Component
**Props:**
- `onStartFlow` - Start flow callback
- `onDownloadSanction` - Download callback
- `loading` - Loading state

**Buttons:**
- Start Loan Flow (🚀)
- Download Sanction (📥)

## Styling System

### Color Scheme
```
Primary Purple:    #667eea to #764ba2
Success Green:     #11998e to #38ef7d
Background:        #f5f5f5
Text Dark:         #333
Text Light:        #999
Border:            #ddd
```

### Responsive Breakpoints
- Desktop: 1024px+ (Chat left, Forms right)
- Tablet: 768px-1024px (Adjusted spacing)
- Mobile: 480px-768px (Horizontal scroll forms)
- Small: <480px (Optimized layout)

### CSS Patterns
- Flexbox layout
- CSS Grid (where applicable)
- Transitions and animations
- Gradients for buttons
- Box shadows for depth

## API Integration

### Backend Endpoints Used

**1. POST /chat**
```javascript
const response = await axios.post(
  `${BACKEND_URL}/chat`,
  {
    user_message: text,
    session_id: sessionId
  }
)
// Returns: { response, session_id, timestamp }
```

**2. POST /mock/upload_salary**
```javascript
const formData = new FormData()
formData.append('file', file)

const response = await axios.post(
  `${BACKEND_URL}/mock/upload_salary?session_id=${sessionId}`,
  formData,
  { headers: { 'Content-Type': 'multipart/form-data' } }
)
// Returns: { file_id, monthly_salary, annual_salary, status, message }
```

**3. GET /sanction/{session_id}**
```javascript
const response = await axios.get(
  `${BACKEND_URL}/sanction/${sessionId}`,
  { responseType: 'blob' }
)
// Returns: PDF blob
```

## State Management

### App State
```javascript
const [messages, setMessages] = useState([])          // Chat history
const [sessionId, setSessionId] = useState(null)      // User session
const [loanData, setLoanData] = useState(null)        // Current loan
const [salaryFileId, setSalaryFileId] = useState(null) // Uploaded file
const [loading, setLoading] = useState(false)         // Loading state
```

### Message Object
```javascript
{
  id: number,              // Unique ID
  text: string,            // Message content
  sender: 'user'|'bot',   // Message source
  timestamp: Date          // When sent
}
```

## Development Workflow

### Adding a New Feature

1. **Create Component**
   ```bash
   touch src/components/MyComponent.jsx
   touch src/components/MyComponent.css
   ```

2. **Build Component**
   ```jsx
   // MyComponent.jsx
   import './MyComponent.css'
   
   export default function MyComponent({ prop1, prop2 }) {
     return (
       <div className="my-component">
         {/* Content */}
       </div>
     )
   }
   ```

3. **Style Component**
   ```css
   /* MyComponent.css */
   .my-component {
     /* Styles */
   }
   ```

4. **Import in App**
   ```jsx
   import MyComponent from './components/MyComponent'
   
   // In JSX:
   <MyComponent prop1={value1} prop2={value2} />
   ```

### Common Tasks

**Change Backend URL:**
```javascript
// In App.jsx
const BACKEND_URL = 'http://your-server:8000'
```

**Add Form Field:**
```javascript
// In LoanForm.jsx
const [formData, setFormData] = useState({
  newField: ''  // Add here
})

// In handleChange:
[name]: value   // Already handles all fields

// In JSX:
<input name="newField" {...} />
```

**Customize Colors:**
Edit color values in CSS files:
```css
.btn-primary {
  background: linear-gradient(135deg, #yourcolor1 0%, #yourcolor2 100%);
}
```

**Add New Button:**
```jsx
<button onClick={handler} className="btn btn-primary">
  Action
</button>
```

## Testing

### Manual Testing Checklist

- [ ] Backend is running on port 8000
- [ ] Frontend loads at localhost:5173
- [ ] Chat sends messages successfully
- [ ] Loan form validates inputs
- [ ] File upload accepts valid files
- [ ] File upload rejects invalid files
- [ ] "Start Loan Flow" button works
- [ ] "Download Sanction" button works
- [ ] Responsive on mobile (use DevTools)
- [ ] Messages auto-scroll
- [ ] Loading states show properly

### Testing Commands

```bash
# Check backend health
curl http://localhost:8000/docs

# Check frontend build
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint  # (if eslint is configured)
```

## Troubleshooting

### Issue: CORS Error
**Solution:** Ensure backend has CORS enabled:
```python
# In backend/app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Chat Not Working
**Check:**
1. Backend running? `http://localhost:8000`
2. Session ID set?
3. Network tab shows request?
4. Backend returns response?
5. Console for JavaScript errors?

### Issue: File Upload Fails
**Check:**
1. File size < 5MB?
2. File type is PDF/PNG/JPG?
3. Backend /mock/upload_salary endpoint working?
4. FormData constructed correctly?

### Issue: Styling Looks Wrong
**Check:**
1. CSS files imported?
2. CSS syntax valid?
3. Browser cache cleared? (Ctrl+Shift+R)
4. Responsive breakpoint correct?

## Performance Tips

1. **Optimize Chat History**
   - Limit messages shown (paginate old ones)
   - Use virtualizing for long lists

2. **Lazy Load Components**
   - Load forms only when needed
   - Code split with React.lazy

3. **Optimize Images**
   - Compress before upload
   - Use appropriate formats

4. **Cache API Responses**
   - Store loan data locally
   - Avoid duplicate requests

## Environment Variables

Create `.env` file (optional):
```
VITE_BACKEND_URL=http://localhost:8000
VITE_APP_VERSION=1.0.0
```

## Production Build

```bash
# Build optimized version
npm run build

# Output in dist/ folder
# Test with:
npm run preview

# Deploy to hosting:
# - Vercel: just push to GitHub
# - Netlify: connect GitHub repo
# - Docker: build image
# - Traditional: copy dist/ to web server
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start backend: `python -m uvicorn backend.app:app --reload`
3. ✅ Start frontend: `npm run dev`
4. ✅ Open browser: `http://localhost:5173`
5. ✅ Test features
6. ✅ Read full README.md
7. ✅ Build for production: `npm run build`

## Support & Documentation

- **Frontend README:** `frontend/README.md`
- **Backend API:** `http://localhost:8000/docs` (Swagger UI)
- **Backend Docs:** See backend documentation files
- **Phase 6 Guide:** `SALARY_UPLOAD_API.md`

---

**Frontend Version:** 1.0  
**Setup Guide Version:** 1.0  
**Last Updated:** December 11, 2025  
