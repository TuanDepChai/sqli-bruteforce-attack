#!/bin/bash

echo "🚀 ONE-CLICK START - UBUNTU"
echo "============================"
echo ""
echo "This will automatically setup and start everything:"
echo "✅ Install MongoDB + Node.js"
echo "✅ Setup database with 10 users"
echo "✅ Generate environment keys"
echo "✅ Start web server"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Check if already setup
if [ -f ".env.local" ] && [ -d "node_modules" ]; then
    echo "📋 Already setup detected. Starting server..."
    echo ""
    echo "🌐 Web application will start on: http://localhost:3000"
    echo "📋 Login with any user from the list below:"
    echo ""
    echo "🔑 ADMIN USERS:"
    echo "   - admin / Admin123!@#"
    echo "   - security / Security123!@#"
    echo ""
    echo "👥 REGULAR USERS:"
    echo "   - john / John123!@#"
    echo "   - sarah / Sarah123!@#"
    echo "   - mike / Mike123!@#"
    echo "   - emma / Emma123!@#"
    echo "   - alex / Alex123!@#"
    echo "   - lisa / Lisa123!@#"
    echo "   - david / David123!@#"
    echo "   - test / Test123!@#"
    echo ""
    echo "Press Enter to start server..."
    read
    npm run dev
else
    echo "🔧 Running full auto setup..."
    npm run auto-setup-ubuntu
fi
