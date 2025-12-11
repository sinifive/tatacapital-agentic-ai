# Testing Session Flow - Quick Guide

## 🧪 Pre-Test Checklist

- [ ] Backend running: `http://localhost:8000`
- [ ] Frontend running: `http://localhost:5173`
- [ ] Browser DevTools available (F12)
- [ ] Network tab ready to monitor API calls

---

## 🎬 Test Scenarios

### **Test 1: Session Initialization** ✅

**Objective:** Verify session creates on app startup

**Steps:**
1. Open `http://localhost:5173`
2. Wait for app to load
3. Observe:
   - Header shows "Session: XXXXXXXX..."
   - Status badge shows "● Active"
   - Welcome message appears in chat
   - Flow indicator shows all stages

**Expected Results:**
- ✅ Session ID displays in header
- ✅ Status badge shows "Active"
- ✅ Welcome message from agent visible
- ✅ Input field is enabled
- ✅ "Start" button is clickable

**Network Check:**
- POST /chat with `"user_message": "START_SESSION"`
- Response contains welcome message

---

### **Test 2: Send Chat Message** ✅

**Objective:** Verify chat messaging works

**Steps:**
1. Type message: "Hello, I need a loan"
2. Click Send or press Enter
3. Observe:
   - Message appears in chat (blue, right side)
   - "Send" button shows "⟳ Sending..."
   - Input field is disabled
   - Agent response appears below

**Expected Results:**
- ✅ User message displays correctly
- ✅ Loading state shows during send
- ✅ Bot response appears after ~500ms
- ✅ Messages display in chronological order
- ✅ Auto-scroll to latest message

**Network Check:**
- POST /chat with `"user_message": "Hello, I need a loan"`
- Response has agent reply

---

### **Test 3: Flow Stage - Form** ✅

**Objective:** Verify form submission advances stage

**Steps:**
1. Fill loan form:
   - Amount: 500000 (₹)
   - Tenure: 60 (months)
   - Purpose: Home
2. Click "Submit Loan Details"
3. Observe:
   - Form data sent as message
   - Flow indicator shows "Upload" stage active
   - Agent asks for salary upload

**Expected Results:**
- ✅ Form submission sends formatted message
- ✅ Flow indicator updates
- ✅ Forms section shows upload component
- ✅ Agent responds requesting upload

**Network Check:**
- POST /chat with loan details
- Message includes: amount, tenure, purpose

---

### **Test 4: File Upload with Progress** ✅

**Objective:** Verify file upload flow with progress indicator

**Steps:**
1. Have PDF or image file ready (< 5MB)
2. In SalaryUploadForm:
   - Either drag-drop file
   - Or click to browse and select
3. Observe:
   - Upload progress message appears ("📤 Uploading...")
   - Progress bar animates
   - "Running underwriting checks..." message appears
   - Status badge shows "⟳ Underwriting..."
   - After 2s, salary verification appears ("✅ Salary verified!")

**Expected Results:**
- ✅ Upload initiates immediately
- ✅ Progress bar visible and animating
- ✅ "Uploading..." message displays
- ✅ 2-second underwriting pause
- ✅ Salary details displayed (monthly/annual)
- ✅ Approval message appears

**Network Check:**
- POST /mock/upload_salary with file
- Response contains file_id, monthly_salary, annual_salary
- Second POST /chat for PROCEED_SANCTION

---

### **Test 5: Flow Stage - Complete** ✅

**Objective:** Verify completion stage and download button

**Steps:**
1. After approval message appears
2. Observe:
   - Flow indicator shows "Complete" stage active
   - "Download Sanction" button is enabled
   - Upload form disappears
3. Click "Download Sanction"
4. Observe:
   - Button shows "⟳ Loading..."
   - "📥 Downloading..." message appears
   - PDF downloads to device
   - Success message appears

**Expected Results:**
- ✅ Flow indicator shows "Complete"
- ✅ Download button is enabled and clickable
- ✅ PDF file downloads
- ✅ File named: `sanction_letter_XXXXXXXX.pdf`
- ✅ Success confirmation in chat

**Network Check:**
- GET /sanction/{sessionId}
- Response is PDF blob
- Status 200 OK

---

### **Test 6: Error Handling - Invalid File** ❌

**Objective:** Verify error handling for invalid files

**Steps:**
1. Try to upload:
   - File > 5MB (should reject)
   - .txt or .doc file (should reject)
2. Observe:
   - Error message displays
   - Upload form doesn't close
   - User can retry

**Expected Results:**
- ✅ Error alert shows for invalid type
- ✅ Error alert shows for size > 5MB
- ✅ No API call made
- ✅ User can retry with valid file

**Browser Check:**
- No network request made
- Error message user-friendly

---

### **Test 7: Error Handling - Network Error** ❌

**Objective:** Verify graceful error handling

**Steps:**
1. Stop backend server (Ctrl+C)
2. Try to send message
3. Observe:
   - Error message appears in chat
   - Button returns to normal state
   - User can retry

**Expected Results:**
- ✅ Error message: "Sorry, I encountered an error..."
- ✅ UI recovers gracefully
- ✅ User can restart session

**Browser Check:**
- Network shows failed request
- Console shows error logged

---

### **Test 8: Mobile Responsiveness** 📱

**Objective:** Verify mobile layout works

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test breakpoints:
   - 768px (tablet)
   - 480px (mobile)

**Expected Results:**
- ✅ Layout stacks vertically
- ✅ Chat section resizable
- ✅ Forms section accessible
- ✅ All buttons touch-friendly
- ✅ Text readable
- ✅ No horizontal scrolling

**Check:**
- Flow indicator responsive
- Buttons stack on small screens
- Status badges visible

---

### **Test 9: Message Types & Styling** 💬

**Objective:** Verify different message types render correctly

**Steps:**
1. Send various messages
2. Upload file (triggers multiple types)
3. Observe message styling:
   - User messages: blue, right-aligned
   - Bot messages: white, left-aligned
   - Success messages: emoji icons
   - Status messages: different styling

**Expected Results:**
- ✅ User messages styled consistently
- ✅ Bot messages styled consistently
- ✅ Emojis render correctly
- ✅ Timestamps visible
- ✅ Messages readable on all backgrounds

---

### **Test 10: Concurrent API Calls** ⚡

**Objective:** Verify handling of rapid interactions

**Steps:**
1. Send message
2. Immediately try to upload file
3. Try clicking buttons
4. Observe:
   - Loading state prevents double-sends
   - All buttons disabled during load
   - No race conditions in messages

**Expected Results:**
- ✅ All inputs/buttons disabled during load
- ✅ Loading indicators show state
- ✅ No duplicate messages
- ✅ Messages received in order

**Network Check:**
- Check Network tab order of requests
- Verify no concurrent duplicate calls

---

## 📊 Test Results Template

```
Session Flow Test Results
Date: ___________
Browser: ___________
OS: ___________

Test 1: Session Init       [ ] PASS [ ] FAIL
Test 2: Chat Message       [ ] PASS [ ] FAIL
Test 3: Form Stage         [ ] PASS [ ] FAIL
Test 4: File Upload        [ ] PASS [ ] FAIL
Test 5: Complete Stage     [ ] PASS [ ] FAIL
Test 6: Error - Invalid    [ ] PASS [ ] FAIL
Test 7: Error - Network    [ ] PASS [ ] FAIL
Test 8: Mobile Design      [ ] PASS [ ] FAIL
Test 9: Message Styling    [ ] PASS [ ] FAIL
Test 10: Concurrent Calls  [ ] PASS [ ] FAIL

Overall: [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
```

---

## 🔍 Debugging Tips

### **Check Session ID**
```javascript
// In DevTools console
localStorage.getItem('sessionId')
// or check header display
```

### **Monitor API Calls**
1. Open DevTools (F12)
2. Go to Network tab
3. Check each request:
   - Method (POST/GET)
   - URL (correct endpoint)
   - Payload (session_id included)
   - Response (status 200)

### **Check Message Flow**
```javascript
// In console
document.querySelectorAll('.message')
// Count messages
// Check classes (user vs bot)
```

### **Verify Flow Stage**
```javascript
// In React DevTools
// Inspect App component
// Check flowStage prop value
// Check sessionActive state
```

### **Monitor State Changes**
```javascript
// Add logging to App.jsx
console.log('Flow stage:', flowStage)
console.log('Session active:', sessionActive)
console.log('Loading:', loading)
```

---

## ✅ Checklist Before Production

- [ ] All 10 tests pass
- [ ] No console errors
- [ ] No network failures
- [ ] Mobile responsive works
- [ ] Error messages user-friendly
- [ ] Loading states clear
- [ ] Session ID visible in header
- [ ] Flow indicator accurate
- [ ] PDF downloads correctly
- [ ] Performance acceptable (<2s per action)

---

## 📞 Quick Fixes

| Issue | Solution |
|-------|----------|
| Session not showing | Refresh page, check console |
| No welcome message | Check backend running on 8000 |
| Upload button disabled | Check flow stage in React DevTools |
| File won't upload | Check file size (<5MB) and type (PDF/PNG/JPG) |
| Download doesn't work | Check backend has sanction endpoint |
| Styling looks wrong | Clear browser cache (Ctrl+Shift+R) |
| Messages not scrolling | Check messagesEndRef in code |

---

**Last Updated:** December 11, 2025  
**Version:** 1.0  
**Status:** Ready for Testing
