@echo off
REM GAIA Database Migration Script for Windows

echo ======================================
echo GAIA Database Migration
echo ======================================
echo.

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set
    echo Please set DATABASE_URL before running this script
    exit /b 1
)

echo DATABASE_URL is set
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo Dependencies installed
    echo.
)

REM Run migration
echo Running database migration...
node migrate-and-seed.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo Migration completed successfully!
    echo ======================================
    exit /b 0
) else (
    echo.
    echo ======================================
    echo Migration failed!
    echo ======================================
    exit /b 1
)
