# 📊 Session Flow Architecture & Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               React Frontend (Port 5173)                ││
│  │  ┌────────────────────────────────────────────────────┐ ││
│  │  │ App Component                                       │ ││
│  │  │ ├─ Session Management (UUID)                       │ ││
│  │  │ ├─ Message Queue (Chat History)                    │ ││
│  │  │ ├─ Flow State Management                           │ ││
│  │  │ ├─ Loading & Progress Tracking                     │ ││
│  │  │ └─ UI Component Coordination                       │ ││
│  │  └────────────────────────────────────────────────────┘ ││
│  │                         ↕ Axios HTTP                      ││
│  └─────────────────────────────────────────────────────────┘│
└────────┬─────────────────────────────────────────────────────┘
         │ HTTP/JSON
         ↓
┌──────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ MasterAgent (/chat Endpoint)                           │  │
│  │ • Session context management                          │  │
│  │ • Conversation orchestration                          │  │
│  │ • Workflow step detection                             │  │
│  │ • Response generation                                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                         ↕                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Service Handlers                                       │  │
│  │ ├─ /mock/upload_salary (File processing)             │  │
│  │ ├─ /sanction/{id} (PDF generation)                   │  │
│  │ ├─ /mock/process_application (Application logic)     │  │
│  │ └─ Other mock services                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                         ↕                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Data Layer                                             │  │
│  │ ├─ SQLite Database (customer.db)                      │  │
│  │ ├─ File Storage (uploads/)                            │  │
│  │ ├─ PDF Output (sanction_letters/)                     │  │
│  │ └─ Session Management                                 │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Session Flow Sequence Diagram

```
User Browser                           Backend Server
    │                                     │
    │ APP LOADS                           │
    ├─────────────────────────────────────>
    │ POST /chat {START_SESSION}          │
    │ User-Agent: Browser                 │
    │ Session-ID: UUID                    │
    │                                 MasterAgent activated
    │<─────────────────────────────────────┤
    │ Response: Welcome Message            │
    │ {response: "Welcome..."}             │
    │                                     │
    │ [Chat renders welcome]               │
    │                                     │
    │ User enters: "I need a loan"         │
    ├─────────────────────────────────────>
    │ POST /chat {user_message}            │
    │                              Agent processes request
    │<─────────────────────────────────────┤
    │ Response: Form request               │
    │ {response: "Fill form..."}           │
    │                                     │
    │ [User fills form: ₹500K, 60 mo]      │
    │ [User submits form]                  │
    ├─────────────────────────────────────>
    │ POST /chat {loan details}            │
    │                              Agent acknowledges
    │<─────────────────────────────────────┤
    │ Response: Upload request             │
    │ {response: "Upload salary..."}       │
    │                                     │
    │ [User selects file]                  │
    │ [File validation: type, size]        │
    ├─────────────────────────────────────>
    │ POST /upload_salary {file}           │
    │ Content-Type: multipart/form-data    │
    │                              File processing
    │                              Salary extraction
    │<─────────────────────────────────────┤
    │ Response: {file_id, salary data}    │
    │                                     │
    │ [Progress: 2s underwriting]          │
    │                                     │
    │ [Display: Salary verified ✅]        │
    ├─────────────────────────────────────>
    │ POST /chat {PROCEED_SANCTION}        │
    │                              Agent decision
    │<─────────────────────────────────────┤
    │ Response: Approval message           │
    │ {response: "Approved! 🎉"}           │
    │                                     │
    │ [Enable: Download button]            │
    │ [User clicks Download]               │
    ├─────────────────────────────────────>
    │ GET /sanction/{session_id}           │
    │                              PDF generation
    │<─────────────────────────────────────┤
    │ Response: PDF Binary                 │
    │ Content-Type: application/pdf        │
    │                                     │
    │ [Browser downloads PDF]              │
    │ [Process complete ✅]                │
    │                                     │
```

---

## 📊 State Management Flow

```
App Component State
│
├─ sessionId: UUID
│  └─ Set on: App initialization
│  └─ Used in: All API calls
│
├─ messages: Array<Message>
│  ├─ Type: {id, text, sender, timestamp, type}
│  ├─ Updated on: New message received
│  └─ Used in: ChatWindow display
│
├─ flowStage: String
│  ├─ Values: 'welcome' → 'form' → 'upload' → 'complete'
│  ├─ Updated on: Agent response detection
│  └─ Used in: Conditional component rendering
│
├─ loanData: Object
│  ├─ Fields: {loanAmount, tenure, loanPurpose}
│  ├─ Updated on: Form submission
│  └─ Sent to: Agent in /chat call
│
├─ salaryFileId: String
│  ├─ Updated on: File upload success
│  ├─ Received from: /upload_salary response
│  └─ Used in: Sanction generation
│
├─ loading: Boolean
│  ├─ Set to true: Before API call
│  ├─ Set to false: After response/error
│  └─ Used in: Disable inputs/buttons
│
├─ sessionActive: Boolean
│  ├─ Set to true: After session init
│  ├─ Set to false: On error
│  └─ Used in: Enable/disable chat
│
└─ underwritingProgress: Boolean
   ├─ Set to true: During underwriting
   ├─ Set to false: After completion
   └─ Used in: Show progress bar
```

---

## 🎬 Component Rendering Flow

```
App.jsx
├─ Header
│  ├─ Title & Description
│  ├─ Session Badge: {sessionId.substring(0, 8)}...
│  ├─ Status Badge: Active/Underwriting
│  └─ Pulse Animation (loading)
│
├─ Progress Bar (if underwritingProgress)
│  ├─ Animated fill
│  └─ Text overlay
│
├─ ChatWindow
│  ├─ Messages Container
│  │  ├─ Message (User)
│  │  │  ├─ Bubble: Blue, Right
│  │  │  └─ Timestamp
│  │  ├─ Message (Bot)
│  │  │  ├─ Bubble: White, Left
│  │  │  ├─ Timestamp
│  │  │  └─ Type: text/success/error
│  │  └─ Auto-scroll to latest
│  └─ Input & Send Button
│
└─ Forms Section
   ├─ Flow Indicator
   │  └─ 1. Form → 2. Upload → 3. Complete
   ├─ Action Buttons
   │  ├─ Start Loan Flow (🚀)
   │  └─ Download Sanction (📥)
   └─ Conditional Components
      ├─ IF flowStage === 'form'
      │  └─ LoanForm
      └─ IF flowStage === 'upload' || 'complete'
         └─ SalaryUploadForm
```

---

## 🔗 API Call Flow Diagram

```
Frontend Action → API Call → Backend Processing → Response → UI Update

┌─ INITIALIZATION ─────────────────────────────────────┐
│ POST /chat {START_SESSION}                          │
│ └─> Backend initializes session context             │
│     └─> Returns welcome message                     │
│         └─> UI: Chat displays message               │
└──────────────────────────────────────────────────────┘

┌─ CHAT MESSAGE ───────────────────────────────────────┐
│ POST /chat {user_message, session_id}               │
│ └─> Backend processes through MasterAgent           │
│     ├─> Detects intent (loan, upload, etc.)         │
│     ├─> Generates response                          │
│     └─> Returns {response, session_id}              │
│         └─> UI: Updates flowStage if needed         │
│            └─> Shows message in chat                │
└──────────────────────────────────────────────────────┘

┌─ FILE UPLOAD ────────────────────────────────────────┐
│ POST /upload_salary {file, session_id}              │
│ └─> Backend processes file                          │
│     ├─> Validates file type/size                    │
│     ├─> Extracts salary data                        │
│     ├─> Stores in database                          │
│     └─> Returns {file_id, monthly_salary, ...}      │
│         └─> UI: Shows verification message          │
└──────────────────────────────────────────────────────┘

┌─ SANCTION DECISION ──────────────────────────────────┐
│ POST /chat {PROCEED_SANCTION, session_id}           │
│ └─> Backend makes approval decision                 │
│     ├─> Checks all requirements                     │
│     ├─> Generates decision                          │
│     └─> Returns {response: "Approved"}              │
│         └─> UI: Enables download button             │
└──────────────────────────────────────────────────────┘

┌─ SANCTION DOWNLOAD ──────────────────────────────────┐
│ GET /sanction/{session_id}                          │
│ └─> Backend generates PDF                           │
│     ├─> Populates with customer data                │
│     ├─> Creates PDF file                            │
│     └─> Returns PDF binary blob                     │
│         └─> UI: Browser downloads file              │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Workflow State Transitions

```
START
  │
  └──> [WELCOME] (Session initialized)
       │
       ├─ UI: Welcome message shown
       ├─ UI: Chat enabled
       ├─ UI: Flow indicator at stage 1
       │
       └──> User sends message
            │
            └──> [FORM] (Ready for loan details)
                 │
                 ├─ UI: Loan form visible
                 ├─ UI: Form indicator active
                 │
                 └──> User submits form
                      │
                      └──> [UPLOAD] (Request for salary)
                           │
                           ├─ UI: Upload form visible
                           ├─ UI: Flow indicator at stage 2
                           │
                           └──> User uploads file
                                │
                                ├─ Progress bar shows (2s)
                                ├─ Status: "⟳ Underwriting..."
                                │
                                └──> Underwriting complete
                                     │
                                     └──> [COMPLETE] (Approval)
                                          │
                                          ├─ UI: Approval message
                                          ├─ UI: Download button enabled
                                          ├─ UI: Flow indicator at stage 3
                                          │
                                          └──> User clicks Download
                                               │
                                               └──> PDF downloads
                                                    │
                                                    └──> END
```

---

## 📱 Responsive Layout Diagram

```
DESKTOP (1024px+)
┌─────────────────────────────────────────────────────┐
│ Header: Tata Capital | Session: X... | ● Active    │
├─────────────────────────────────────────────────────┤
│ ChatWindow         │ Flow Indicator                 │
│ ┌──────────────┐   │ 1.Form → 2.Upload → 3.Complete
│ │              │   │                                │
│ │   Messages   │   │ ┌─ Buttons ────────────────┐  │
│ │              │   │ │ Start Loan    Download   │  │
│ │              │   │ └──────────────────────────┘  │
│ │              │   │                                │
│ │              │   │ ┌─ Loan Form ──────────────┐  │
│ └──────────────┘   │ │ Amount: □                │  │
│ Input: [   ] Send  │ │ Tenure: □                │  │
│                    │ │ Purpose: □               │  │
│                    │ └──────────────────────────┘  │
│                    │                                │
│                    │ ┌─ Upload Form ────────────┐  │
│                    │ │ Drag file here...        │  │
│                    │ └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘

TABLET (768px)
┌──────────────────────────────────────┐
│ Header: Tata Capital | Session: X... │
├──────────────────────────────────────┤
│ ChatWindow         │ Forms Section    │
│ ┌──────────────┐   │ ┌──────────────┐│
│ │   Messages   │   │ │ Buttons      ││
│ │              │   │ ├──────────────┤│
│ │              │   │ │ Loan Form    ││
│ │              │   │ ├──────────────┤│
│ │              │   │ │ Upload Form  ││
│ └──────────────┘   │ └──────────────┘│
│ Input: [   ] Send  │                  │
└──────────────────────────────────────┘

MOBILE (480px)
┌──────────────────────┐
│ Header: Tata Capital │
├──────────────────────┤
│    ChatWindow        │
│  ┌────────────────┐  │
│  │    Messages    │  │
│  │                │  │
│  │                │  │
│  └────────────────┘  │
│  Input: [   ] Send   │
├──────────────────────┤
│    Forms Section     │
│  ┌────────────────┐  │
│  │ Buttons        │  │
│  │ Loan Form      │  │
│  │ Upload Form    │  │
│  └────────────────┘  │
└──────────────────────┘
```

---

## ⏱️ Timing Diagram

```
User Action Timeline
│
0ms    APP LOADS
│      └─ Create UUID session
│      └─ POST /chat START_SESSION
│
200ms  WELCOME MESSAGE RECEIVED
│      └─ Display in chat
│      └─ sessionActive = true
│
500ms  USER TYPES MESSAGE
│      └─ Input enabled
│
600ms  USER HITS SEND
│      └─ POST /chat {message}
│      └─ loading = true
│      └─ Button shows "⟳ Sending..."
│
1100ms BOT RESPONSE RECEIVED
│      └─ Add message to chat
│      └─ loading = false
│      └─ Detect flowStage
│
2000ms USER FILLS FORM
│      └─ Input validation
│      └─ Real-time formatting
│
2500ms USER SUBMITS FORM
│      └─ POST /chat {loan_details}
│      └─ loading = true
│
3000ms FORM ACK RECEIVED
│      └─ flowStage = 'upload'
│      └─ loading = false
│
5000ms USER SELECTS FILE
│      └─ File validation (client-side)
│      └─ Size check: < 5MB ✓
│      └─ Type check: PDF/PNG/JPG ✓
│
5100ms USER CONFIRMS UPLOAD
│      └─ POST /upload_salary
│      └─ underwritingProgress = true
│      └─ Progress bar animates
│      └─ Show: "📤 Uploading..."
│
6500ms UPLOAD COMPLETES
│      └─ Show: "🔄 Running checks..."
│      └─ Start 2s simulation timer
│
8500ms UNDERWRITING COMPLETE
│      └─ Show: "✅ Salary verified! ₹50K/month"
│      └─ POST /chat {PROCEED_SANCTION}
│      └─ underwritingProgress = false
│
9000ms APPROVAL RECEIVED
│      └─ Show: "🎉 Approved!"
│      └─ flowStage = 'complete'
│      └─ Download button enabled
│
10000ms USER CLICKS DOWNLOAD
│       └─ GET /sanction/{sessionId}
│       └─ loading = true
│       └─ Show: "📥 Downloading..."
│
11000ms PDF DOWNLOADED
│        └─ Browser saves file
│        └─ loading = false
│        └─ Show: "✅ Downloaded successfully!"
│
COMPLETE ✅
```

---

## 🔐 Session Lifecycle

```
Session Creation
├─ UUID v4 generated
├─ Stored in component state (sessionId)
├─ Included in every API call
└─ Displayed in header badge

Session Active
├─ Chat messages associated with session
├─ Loan data collected under session
├─ File uploads linked to session
└─ All state tracked per session

Session Completion
├─ PDF generated with session context
├─ All documents linked to session ID
└─ Session can be archived

Session Recovery
├─ Refresh page = new session created
├─ No persistence by default
├─ Can add localStorage if needed
└─ Backend maintains session context
```

---

**Architecture Documentation:** December 11, 2025  
**Version:** 1.0  
**Status:** ✅ Complete
