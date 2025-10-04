#!/bin/bash

# 🚀 SQLi BruteForce Attack - Start Script
# Simple script to start the application

echo "🚀 Starting SQLi BruteForce Attack Training Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir -p logs
    touch logs/attacks.log
fi

# Start the application
echo "🔧 Starting development server..."
npm run dev
