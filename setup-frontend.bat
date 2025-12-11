@echo off
REM Script to organize frontend files for React + Vite setup

echo Creating frontend directory structure...

REM Create directories
if not exist "frontend" mkdir frontend
if not exist "frontend\src" mkdir frontend\src
if not exist "frontend\src\components" mkdir frontend\src\components
if not exist "frontend\public" mkdir frontend\public

echo.
echo Directory structure created!
echo.
echo Next steps:
echo 1. Copy FRONTEND_App.jsx to frontend\src\App.jsx
echo 2. Copy FRONTEND_App.css to frontend\src\App.css
echo 3. Copy FRONTEND_main.jsx to frontend\src\main.jsx
echo 4. Copy FRONTEND_ChatWindow.jsx to frontend\src\components\ChatWindow.jsx
echo 5. Copy FRONTEND_ChatWindow.css to frontend\src\components\ChatWindow.css
echo 6. Copy FRONTEND_LoanForm.jsx to frontend\src\components\LoanForm.jsx
echo 7. Copy FRONTEND_LoanForm.css to frontend\src\components\LoanForm.css
echo 8. Copy FRONTEND_SalaryUploadForm.jsx to frontend\src\components\SalaryUploadForm.jsx
echo 9. Copy FRONTEND_SalaryUploadForm.css to frontend\src\components\SalaryUploadForm.css
echo 10. Copy FRONTEND_ActionButtons.jsx to frontend\src\components\ActionButtons.jsx
echo 11. Copy FRONTEND_ActionButtons.css to frontend\src\components\ActionButtons.css
echo 12. Copy FRONTEND_index.html to frontend\index.html
echo 13. Copy frontend-app-package.json to frontend\package.json
echo 14. Copy FRONTEND_vite.config.js to frontend\vite.config.js
echo.
echo Then run:
echo cd frontend
echo npm install
echo npm run dev
echo.
