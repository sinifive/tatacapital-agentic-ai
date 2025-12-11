# Tata Capital Frontend - React + Vite

Complete AI-powered loan origination system frontend built with React, Vite, and Tailwind CSS.

## Features

✅ **Chat Interface** - Real-time conversation with AI agent  
✅ **Loan Form** - Structured input for loan amount, tenure, purpose  
✅ **Salary Upload** - Drag-and-drop file upload with validation  
✅ **Action Buttons** - Quick actions for loan flow and sanction download  
✅ **Responsive Design** - Mobile-first, works on all devices  
✅ **Backend Integration** - Axios integration with loan origination backend  

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx          # Chat message display
│   │   ├── ChatWindow.css          # Chat styling
│   │   ├── LoanForm.jsx            # Loan input form
│   │   ├── LoanForm.css            # Form styling
│   │   ├── SalaryUploadForm.jsx    # File upload component
│   │   ├── SalaryUploadForm.css    # Upload styling
│   │   ├── ActionButtons.jsx       # Primary action buttons
│   │   └── ActionButtons.css       # Button styling
│   ├── App.jsx                     # Main application component
│   ├── index.css                   # Global styles
│   └── main.jsx                    # React entry point
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # This file
```

## Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

## Usage

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Integration

The frontend connects to the backend API at `http://localhost:8000`. Update `BACKEND_URL` in `App.jsx` if your backend is on a different host.

**Available Endpoints:**
- `POST /chat` - Send messages to the AI agent
- `POST /mock/upload_salary` - Upload salary documents
- `GET /sanction/{session_id}` - Download sanction letter PDF

## Components

### ChatWindow
Displays conversation history with timestamps. Supports:
- User and bot messages
- Empty state with tips
- Auto-scroll to latest messages
- Smooth animations

```jsx
<ChatWindow messages={messages} messagesEndRef={messagesEndRef} />
```

### LoanForm
Structured form for loan details:
- Loan Amount (₹)
- Tenure (months)
- Loan Purpose (select)
- Real-time formatting and hints

```jsx
<LoanForm onSubmit={handleLoanFormSubmit} />
```

### SalaryUploadForm
File upload component with:
- Drag-and-drop support
- File type validation (PDF, PNG, JPG)
- Size limit (5MB)
- Upload progress indicator

```jsx
<SalaryUploadForm onUpload={handleSalaryUpload} loading={loading} />
```

### ActionButtons
Primary action buttons:
- Start Loan Flow
- Download Sanction Letter

```jsx
<ActionButtons
  onStartFlow={handleStartLoanFlow}
  onDownloadSanction={handleDownloadSanction}
  loading={loading}
/>
```

## Styling

### Colors
- Primary: `#667eea` to `#764ba2` (Purple gradient)
- Success: `#11998e` to `#38ef7d` (Green gradient)
- Background: `#f5f5f5` (Light gray)
- Text: `#333` (Dark gray)

### Layout
- Flexbox-based responsive design
- Mobile-first approach
- Breakpoints: 1024px, 768px, 480px

### CSS Variables
None currently, but colors are defined in CSS files for easy customization.

## API Integration

### Chat Endpoint
```javascript
POST /chat
{
  user_message: string,
  session_id: string
}

Response:
{
  response: string,
  session_id: string,
  timestamp: string
}
```

### Salary Upload Endpoint
```javascript
POST /mock/upload_salary?session_id={id}
FormData: { file: File }

Response:
{
  file_id: string,
  monthly_salary: number,
  annual_salary: number,
  status: string,
  message: string
}
```

### Sanction Letter Download
```javascript
GET /sanction/{session_id}
Returns: PDF file (blob)
```

## Features in Detail

### Session Management
- Each user gets a unique session ID (UUID)
- Session persists across page navigation
- Used for all backend requests

### Chat Interface
- Real-time message display
- User and bot message differentiation
- Timestamps for each message
- Auto-scroll to latest message
- Empty state with helpful tips

### Loan Form
- Currency formatting for loan amount
- Year conversion for tenure display
- Dropdown for loan purpose
- Form validation before submission
- Auto-reset after submission

### File Upload
- Drag-and-drop zone
- Click to browse
- File type validation
- Size validation (max 5MB)
- Progress indicator during upload
- Success/error feedback

### Error Handling
- Network error messages
- File upload errors
- Validation errors
- User-friendly error displays

## Performance

- Vite fast refresh for development
- Optimized production build
- Lazy loading of components
- Minimal dependencies
- ~40KB gzipped (production)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Customization

### Change Backend URL
Edit `BACKEND_URL` in `App.jsx`:
```javascript
const BACKEND_URL = 'http://your-backend-url:8000'
```

### Change Colors
Edit color variables in CSS files:
- `ChatWindow.css` - Chat styling
- `LoanForm.css` - Form styling
- `SalaryUploadForm.css` - Upload styling
- `ActionButtons.css` - Button styling
- `index.css` - Global styles

### Add New Components
1. Create component in `src/components/`
2. Create corresponding `.css` file
3. Import in `App.jsx`
4. Add to JSX layout

## Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Backend Not Responding
- Ensure backend is running on port 8000
- Check CORS is configured in backend
- Verify network connectivity

### File Upload Fails
- Check file type (must be PDF, PNG, JPG)
- Check file size (max 5MB)
- Verify backend /mock/upload_salary endpoint

### Chat Not Working
- Verify backend /chat endpoint is running
- Check session ID is being set
- View browser console for errors

## Development

### Key Libraries
- **React 18.2** - UI framework
- **Vite 5.0** - Build tool
- **Axios 1.6** - HTTP client
- **UUID** - Session ID generation

### Code Style
- ES6+ JavaScript
- Functional React components
- Hooks (useState, useRef, useEffect)
- CSS modules or inline styles

## Performance Tips

1. **Limit chat history** - Implement pagination for older messages
2. **Lazy load forms** - Load forms only when needed
3. **Compress images** - Upload optimized images
4. **Cache requests** - Cache chat responses

## Future Enhancements

- [ ] Real-time notification system
- [ ] Document upload history
- [ ] Loan status tracking
- [ ] EMI calculator
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Analytics integration

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for errors
4. Verify all endpoints are accessible

---

**Frontend Version:** 1.0  
**Last Updated:** December 11, 2025  
**Compatible with:** Backend Phase 6  
