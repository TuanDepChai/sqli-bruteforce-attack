#!/bin/bash

# 🚀 SQLi BruteForce Attack - Local Development
# Simple script for local development only

echo "🚀 Starting SQLi BruteForce Attack Training Platform (LOCAL MODE)..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project directory."
    exit 1
fi

# Create logs directory if not exists
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir -p logs
    touch logs/attacks.log
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start MongoDB (if installed)
if command -v mongod &> /dev/null; then
    echo "🗄️  Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || echo "MongoDB already running or not installed"
fi

# Setup database
echo "🔧 Setting up database..."
npm run setup-db

# Start development server
echo "🎯 Starting local development server..."
echo "📱 Access at: http://localhost:3000"
echo "🔐 Admin: http://localhost:3000/admin"
echo "📊 Login: admin / Admin123!@#"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
