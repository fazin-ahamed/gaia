@echo off
REM GAIA 3.1 - Deployment Helper Script (Windows)
REM This script helps prepare your code for deployment to Render + Vercel

echo.
echo ========================================
echo   GAIA 3.1 Deployment Helper
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo [ERROR] Git repository not initialized
    echo Run: git init
    pause
    exit /b 1
)

echo [OK] Git repository found
echo.

REM Check for uncommitted changes
git status --short > nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] You have uncommitted changes
    echo.
    git status --short
    echo.
    set /p commit="Commit changes now? (y/n): "
    if /i "%commit%"=="y" (
        set /p msg="Enter commit message: "
        git add .
        git commit -m "%msg%"
        echo [OK] Changes committed
    )
)

echo.
echo ========================================
echo   Pre-deployment Checklist
echo ========================================
echo.

REM Check for required files
echo Checking required files...
echo.

if exist render.yaml (
    echo [OK] render.yaml found
) else (
    echo [ERROR] render.yaml not found
    echo        This file is needed for Render deployment
)

if exist backend\package.json (
    echo [OK] backend\package.json found
) else (
    echo [ERROR] backend\package.json not found
)

if exist frontend\package.json (
    echo [OK] frontend\package.json found
) else (
    echo [ERROR] frontend\package.json not found
)

if exist backend\.env.example (
    echo [OK] backend\.env.example found
) else (
    echo [WARNING] backend\.env.example not found (optional)
)

echo.
echo ========================================
echo   Checking Dependencies
echo ========================================
echo.

REM Check backend dependencies
if exist backend\node_modules (
    echo [OK] Backend dependencies installed
) else (
    echo [WARNING] Backend dependencies not installed
    set /p install="Install now? (y/n): "
    if /i "%install%"=="y" (
        cd backend
        call npm install
        cd ..
        echo [OK] Backend dependencies installed
    )
)

REM Check frontend dependencies
if exist frontend\node_modules (
    echo [OK] Frontend dependencies installed
) else (
    echo [WARNING] Frontend dependencies not installed
    set /p install="Install now? (y/n): "
    if /i "%install%"=="y" (
        cd frontend
        call npm install
        cd ..
        echo [OK] Frontend dependencies installed
    )
)

echo.
echo ========================================
echo   Environment Variables Check
echo ========================================
echo.

REM Check for .env files
if exist backend\.env (
    echo [OK] backend\.env found
    echo.
    echo Remember to set these in Render dashboard:
    echo   - GEMINI_API_KEY
    echo   - OPENROUTER_API_KEY
    echo   - DATABASE_URL (auto-set by Render)
    echo   - All other API keys
) else (
    echo [WARNING] backend\.env not found
    echo           You'll need to set environment variables in Render dashboard
)

echo.

if exist frontend\.env.production (
    echo [OK] frontend\.env.production found
) else (
    echo [WARNING] frontend\.env.production not found
    echo           Create it with: VITE_API_URL=https://your-backend.onrender.com
)

echo.
echo ========================================
echo   Git Remote Check
echo ========================================
echo.

REM Check git remote
git remote -v | findstr "origin" > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git remote configured:
    git remote -v
) else (
    echo [ERROR] No git remote configured
    echo        Add remote: git remote add origin ^<your-repo-url^>
)

echo.
echo ========================================
echo   Ready to Deploy?
echo ========================================
echo.
echo Next steps:
echo 1. Push to GitHub: git push origin main
echo 2. Go to render.com and create new Blueprint
echo 3. Connect your GitHub repository
echo 4. Add environment variables in Render dashboard
echo 5. Deploy!
echo.
echo For detailed instructions, see:
echo - RENDER_DEPLOYMENT_GUIDE.md
echo - RENDER_CHECKLIST.md
echo.

set /p push="Push to GitHub now? (y/n): "
if /i "%push%"=="y" (
    git push origin main
    echo.
    echo [OK] Pushed to GitHub
    echo.
    echo Now go to render.com to complete deployment!
) else (
    echo.
    echo Remember to push when ready: git push origin main
)

echo.
echo ========================================
echo   Deployment helper complete!
echo ========================================
echo.
pause
