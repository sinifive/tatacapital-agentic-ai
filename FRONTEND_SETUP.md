# Tata Capital Frontend - React + Vite Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Create frontend directory and copy files:**
```bash
mkdir frontend
cd frontend
```

2. **Copy all frontend files provided to the `frontend` directory:**
   - Copy `FRONTEND_*.jsx` files to `src/` directory
   - Copy `FRONTEND_*.css` files to `src/` directory
   - Copy `FRONTEND_*.json` and config files to root

3. **Create project structure:**
```bash
mkdir src
mkdir src/components
```

4. **Organize files:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── ChatWindow.css
│   │   ├── LoanForm.jsx
│   │   ├── LoanForm.css
│   │   ├── SalaryUploadForm.jsx
│   │   ├── SalaryUploadForm.css
│   │   ├── ActionButtons.jsx
│   │   └── ActionButtons.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

5. **Install dependencies:**
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Features

✅ **Chat Window Component**
- Real-time message display
- Auto-scroll to latest message
- User and bot message styling
- Timestamp for each message

✅ **Loan Form Component**
- Loan amount input (100K to any amount)
- Tenure selection (12 to 84 months)
- Form validation
- Real-time salary calculation display

✅ **Salary Upload Component**
- Drag-and-drop file upload
- File type validation (PDF, PNG, JPEG)
- File size limits (max 5MB)
- Visual feedback on upload status

✅ **Action Buttons**
- Start Loan Flow button
- Download Sanction Letter button
- Loading states
- Disabled states for pending operations

✅ **Backend Integration**
- Axios for HTTP requests
- /chat endpoint integration
- /mock/upload_salary endpoint integration
- /sanction/{session_id} endpoint integration
- Proper error handling

---

## Configuration

### Backend API URL

Edit `src/App.jsx` to change the backend URL:

```javascript
const BACKEND_URL = 'http://localhost:8000';
```

If your backend is on a different host/port, update this constant.

### CORS Configuration

Make sure your backend has CORS enabled for `http://localhost:5173` (or your frontend URL).

---

## Component Details

### ChatWindow Component
Displays chat messages with auto-scrolling.

**Props:**
- `messages`: Array of message objects
- `messagesEndRef`: Ref for scroll target

**Message Object:**
```javascript
{
  id: number,
  text: string,
  sender: 'user' | 'bot',
  timestamp: Date
}
```

### LoanForm Component
Structured input for loan details.

**Props:**
- `onSubmit`: Callback function with form data

**Form Data:**
```javascript
{
  loanAmount: number,
  tenure: number
}
```

### SalaryUploadForm Component
File upload with validation.

**Props:**
- `onUpload`: Callback function with File object
- `loading`: Boolean for loading state

### ActionButtons Component
Primary action buttons for the flow.

**Props:**
- `onStartFlow`: Start loan flow callback
- `onDownloadSanction`: Download sanction callback
- `loading`: Boolean for loading state

---

## Styling

The app uses:
- **Custom CSS** with CSS Grid and Flexbox
- **Gradient backgrounds** (purple gradient theme)
- **Responsive design** for mobile, tablet, and desktop
- **Smooth animations** and transitions

### Color Palette
- Primary: #667eea to #764ba2 (purple gradient)
- Success: #11998e to #38ef7d (green gradient)
- Background: #f8f9fa
- Text: #333, #555, #999

### Responsive Breakpoints
- Desktop: Full layout with side-by-side chat and forms
- Tablet (1024px): Stacked layout
- Mobile (640px): Full-width forms with chat above

---

## API Integration

### Chat Endpoint
```
POST /chat
Body: { user_message: string, session_id: string }
Response: { response: string, ... }
```

### Salary Upload Endpoint
```
POST /mock/upload_salary?session_id=<id>
Body: FormData with file
Response: { file_id: string, monthly_salary: number, ... }
```

### Sanction Letter Endpoint
```
GET /sanction/<session_id>
Response: PDF blob
```

---

## Environment Variables (Optional)

Create a `.env` file for different environments:

```env
VITE_API_URL=http://localhost:8000
```

Then use in code:
```javascript
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## Troubleshooting

### Port Already in Use
If port 5173 is busy, run:
```bash
npm run dev -- --port 3000
```

### CORS Errors
Ensure backend CORS middleware allows requests from frontend URL.

### File Upload Issues
- Check file size (max 5MB)
- Verify file type (PDF, PNG, JPEG)
- Ensure backend upload directory exists

### Chat Not Connecting
- Verify backend is running on correct port
- Check network tab in browser DevTools
- Verify BACKEND_URL is correct

---

## Performance Tips

1. **Lazy load components** for larger apps
2. **Optimize images** for salary upload preview
3. **Implement message pagination** for many messages
4. **Use React.memo** for expensive components
5. **Enable gzip compression** in production

---

## Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile browsers: iOS Safari, Chrome Mobile

---

## Next Steps

1. Copy all files to proper directories
2. Run `npm install`
3. Update BACKEND_URL if needed
4. Run `npm run dev`
5. Open http://localhost:5173

---

## Support

For issues or questions about the frontend:
1. Check browser console for errors (F12)
2. Check network tab for API calls
3. Verify backend is running
4. Check CORS configuration
5. Review component props and callbacks

---

**Frontend ready for development!** 🚀
