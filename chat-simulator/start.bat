@echo off
REM Chat Simulator Startup Script for Windows

echo 🚀 Starting Chat Simulator...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm run install:all
)

REM Start the application
echo 🎬 Starting Chat Simulator...
echo    Frontend: http://localhost:5173
echo    Backend: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers

call npm run dev:all
