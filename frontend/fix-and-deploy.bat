@echo off
echo.
echo ========================================
echo   Fixing CSS for Vercel Deployment
echo ========================================
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Build project
echo Building project...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [OK] Build successful
echo.

REM Preview build
echo Starting preview server...
echo Visit http://localhost:4173 to test
echo Press Ctrl+C when done testing
echo.

start /B npm run preview

pause

echo.
echo Ready to deploy to Vercel!
echo.

set /p deploy="Deploy now? (y/n): "

if /i "%deploy%"=="y" (
    where vercel >nul 2>&1
    if %errorlevel% equ 0 (
        echo Deploying to Vercel...
        call vercel --prod
        echo.
        echo [OK] Deployed successfully!
    ) else (
        echo [WARNING] Vercel CLI not installed
        echo            Install: npm install -g vercel
        echo            Or deploy via GitHub push
    )
) else (
    echo Deploy manually when ready:
    echo   vercel --prod
)

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
pause
