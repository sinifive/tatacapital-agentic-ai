# 🚀 Session Flow Quick Start - 5 Minutes

## ⚡ Get Running in 5 Minutes

### Step 1: Start Backend (1 minute)
```bash
cd c:\Users\DELL\Desktop\tatacapital\sin-i4-tatacapital-agentic-ai\backend
python -m uvicorn app:app --reload --port 8000
```
**Expected:** See `Uvicorn running on http://127.0.0.1:8000`

### Step 2: Start Frontend (1 minute)
```bash
cd c:\Users\DELL\Desktop\tatacapital\sin-i4-tatacapital-agentic-ai\frontend
npm run dev
```
**Expected:** See `Local: http://localhost:5173`

### Step 3: Open Browser (1 minute)
```
http://localhost:5173
```

### Step 4: Test Complete Flow (2 minutes)
1. **See Welcome** - "Welcome to Tata Capital..." in chat
2. **Send Message** - Type: "I need a loan for ₹500,000"
3. **Submit Form** - Fill and submit loan form
4. **Upload File** - Drag a PDF or PNG file
5. **Watch Progress** - See 2-second underwriting animation
6. **Download PDF** - Click "Download Sanction" button

## ✅ What You Should See

### On App Load
```
Header: 🏦 Tata Capital | Session: XXXXXXXX... | ● Active
Flow Indicator: 1. Form → 2. Upload → 3. Complete
Chat: "Welcome to Tata Capital! Let's get started..."
```

### During Loan Form
```
Flow Indicator: 1. Form (highlighted)
Form shows: Loan Amount, Tenure, Purpose
Chat: Agent acknowledges loan details
```

### During File Upload
```
Progress Bar: Animated 2-second underwriting
Status Badge: ⟳ Underwriting...
Messages:
  📤 Uploading salary document...
  🔄 Running underwriting checks...
  ✅ Salary verified! ₹50,000/month
```

### On Approval
```
Flow Indicator: 3. Complete (highlighted)
Chat: 🎉 Congratulations! Your loan has been approved.
Button: "Download Sanction" (enabled)
```

### After Download
```
Chat: ✅ Sanction letter downloaded successfully!
Downloaded File: sanction_letter_XXXXXXXX.pdf
```

---

## 🎯 The Complete Flow in One Diagram

```
START
  ↓
APP LOADS → Session initialized (UUID)
  ↓
CHAT → Welcome message displays
  ↓
USER → Types "I need a loan"
  ↓
AGENT → Responds, shows form
  ↓
USER → Fills loan form (amount, tenure, purpose)
  ↓
AGENT → Acknowledges, requests salary document
  ↓
USER → Uploads PDF/image file
  ↓
PROGRESS → 2-second underwriting animation
  ↓
VERIFICATION → ✅ Salary verified
  ↓
AGENT → Approves loan
  ↓
USER → Clicks "Download Sanction"
  ↓
PDF → File downloads (sanction_letter_XXXXXXXX.pdf)
  ↓
END ✅ Process complete!
```

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" on 8000 | Backend not running. Run Step 1 |
| "Cannot find module" error | Run `npm install` in frontend/ |
| No welcome message | Wait 2 seconds. Check console (F12) |
| File upload fails | Check file < 5MB and type is PDF/PNG/JPG |
| PDF won't download | Check `/sanction` endpoint in backend |

---

## 🔍 What's Happening Behind the Scenes

```
┌─ Frontend ──────────────────────────────────┐
│ React App runs session flow                 │
│ • UUID session created                      │
│ • Messages routed through /chat endpoint    │
│ • Form data collected and sent to agent     │
│ • File uploaded with validation             │
│ • Progress shown during underwriting        │
│ • PDF downloaded when approved              │
└─────────────────────────────────────────────┘
         ↓ HTTP/Axios ↑
┌─ Backend ───────────────────────────────────┐
│ FastAPI processes session                   │
│ • MasterAgent handles conversation          │
│ • /chat: Processes messages                 │
│ • /upload_salary: Handles file upload       │
│ • /sanction: Generates PDF                  │
│ • All linked to session ID                  │
└─────────────────────────────────────────────┘
```

---

## 🎨 Key UI Elements

### Session Badge (Top Right)
```
Session: XXXXXXXX...
```
Your unique session ID (truncated for display)

### Status Badge (Top Right)
```
● Active       (Session ready)
⟳ Underwriting (Checking in progress)
```

### Flow Indicator (Forms Section)
```
1. Form → 2. Upload → 3. Complete
      ↑ (Current stage is highlighted)
```

### Progress Bar (During Underwriting)
```
████████████████░░░░░░░░░░░░░░░░░░
Running underwriting checks...
```

### Chat Messages
```
You (blue, right):    "Hello, I need a loan"
Agent (white, left):  "Great! Let's get started..."
```

---

## 🧪 Quick Test Scenarios

### Scenario 1: Happy Path (2 min)
1. Submit loan form with valid data
2. Upload valid PDF file
3. Download sanction letter
✅ Result: Complete success

### Scenario 2: Error Recovery (1 min)
1. Try to upload invalid file type
2. See error message
3. Upload valid file instead
✅ Result: Recovery works

### Scenario 3: Mobile Test (1 min)
1. Press F12 (DevTools)
2. Click device toolbar (phone icon)
3. Test on 375px width
✅ Result: Layout adapts

---

## 📊 Expected Timing

| Step | Time |
|------|------|
| App load to welcome | <2s |
| Chat message to response | <1s |
| Form submission | <1s |
| File upload | 1-2s |
| Underwriting progress | 2s |
| Sanction approval | <1s |
| PDF download | <1s |
| **Total Journey** | **~10s** |

---

## 🔗 API Endpoints Called

```
1. POST /chat {START_SESSION}
   └─ Initializes session with agent

2. POST /chat {user messages}
   └─ All chat communication

3. POST /mock/upload_salary {file}
   └─ File upload with validation

4. POST /chat {PROCEED_SANCTION}
   └─ Request sanction decision

5. GET /sanction/{session_id}
   └─ Download PDF sanction letter
```

---

## 💾 Data Flow

```
Session ID (UUID)
  ├─ Created at app start
  ├─ Sent with every API call
  ├─ Displayed in header
  └─ Used for all documents

Loan Data {amount, tenure, purpose}
  ├─ Collected via form
  ├─ Sent to agent
  └─ Stored in session context

File ID {file_id}
  ├─ Returned from upload
  ├─ Associated with session
  └─ Used for sanction generation

Messages Array
  ├─ Stores conversation history
  ├─ Includes user and bot messages
  ├─ Type, timestamp, sender info
  └─ Auto-scrolls to latest
```

---

## 🎓 Learning Paths

### Just Want to Test
→ Go to "Get Running in 5 Minutes" section

### Want to Understand Code
→ Read `SESSION_FLOW_IMPLEMENTATION.md`

### Want to See Architecture
→ Read `SESSION_FLOW_ARCHITECTURE.md`

### Want to Trace Code
→ Review `frontend/src/App.jsx`

### Want Detailed Tests
→ Follow `SESSION_FLOW_TESTING.md`

---

## 🚨 Common Issues & Fixes

### "Blank Page / No Welcome Message"
1. Wait 2 seconds for session init
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for /chat request
5. Verify backend running on :8000

### "Upload Button Disabled"
1. Check flow indicator shows "Upload" stage
2. Submit loan form first
3. Refresh page and try again

### "Download Button Not Working"
1. Ensure upload completed successfully
2. Check agent approval message appeared
3. Verify sanction endpoint exists
4. Check network tab for GET /sanction request

### "Styling Looks Broken"
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check Console for CSS errors
4. Verify all CSS files loaded

---

## 📱 Mobile Testing Quick Tips

### Emulate Mobile in Browser
1. Press F12 (DevTools)
2. Press Ctrl+Shift+M (Device Toolbar)
3. Choose iPhone/Android preset
4. Test interactions (tap, scroll)

### Check Responsive Breakpoints
- **Mobile (480px):** Vertical stacked layout
- **Tablet (768px):** Adjusted spacing
- **Desktop (1024px+):** Side-by-side layout

---

## ✨ Hidden Features to Try

### See Session ID
```
Look in header top-right: "Session: XXXXXXXX..."
```

### Watch Messages Auto-Scroll
```
Send many messages quickly
Chat automatically scrolls to latest
```

### Monitor Progress Bar
```
Upload file and watch 2-second animation
Status badge shows "⟳ Underwriting..."
```

### See Message Emojis
```
Upload: 📤 Uploading...
Progress: 🔄 Running checks...
Success: ✅ Verified!
Approval: 🎉 Congratulations!
Download: 📥 Downloading...
```

---

## 🎉 Success Indicators

When everything is working, you should see:

✅ Welcome message on app load  
✅ Session ID in header  
✅ Chat messages send and receive  
✅ Form submits successfully  
✅ Progress bar animates  
✅ Salary verification displays  
✅ Approval message appears  
✅ PDF downloads automatically  

---

## 📞 Next Steps

1. **✅ Run It** - Follow "Get Running in 5 Minutes"
2. **✅ Test It** - Try the complete flow
3. **✅ Explore It** - Play with different inputs
4. **✅ Debug It** - Open DevTools and watch API calls
5. **✅ Learn It** - Read implementation documentation

---

## 💡 Pro Tips

💡 Open DevTools (F12) while testing to see API calls  
💡 The progress bar is a 2-second simulation  
💡 Upload any PDF or PNG image file (< 5MB)  
💡 Loan amount formatting is automatic (₹)  
💡 Tenure is in months but shows as years  
💡 Session ID is unique per app session  
💡 Refresh page creates new session  

---

**Session Flow Status:** ✅ Ready to Test  
**Last Updated:** December 11, 2025  
**Estimated Setup Time:** 5 minutes  

### Ready? Start with Step 1 above! 🚀
