@echo off
REM 🚀 SQLi BruteForce Attack - Local Development (Windows)
REM Simple script for local development only

echo 🚀 Starting SQLi BruteForce Attack Training Platform (LOCAL MODE)...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project directory.
    pause
    exit /b 1
)

REM Create logs directory if not exists
if not exist "logs" (
    echo 📁 Creating logs directory...
    mkdir logs
    type nul > logs\attacks.log
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Setup database
echo 🔧 Setting up database...
npm run setup-db

REM Start development server
echo 🎯 Starting local development server...
echo 📱 Access at: http://localhost:3000
echo 🔐 Admin: http://localhost:3000/admin
echo 📊 Login: admin / Admin123!@#
echo.
echo Press Ctrl+C to stop
echo.

npm run dev
