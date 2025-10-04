#!/bin/bash

echo "🚀 SETUP SECURE APP"
echo "==================="
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate environment keys
echo "🔑 Generating environment keys..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

cat > .env.local << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security Keys
JWT_SECRET=$JWT_SECRET
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# App Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=15
SESSION_TIMEOUT=3600
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring
MONITORING_ENABLED=true
LOG_LEVEL=info
EOF

echo "✅ Environment keys generated"

# Setup database
echo "🗄️ Setting up database..."
node scripts/setup-mongodb.js

echo ""
echo "🎉 SETUP COMPLETED!"
echo ""
echo "🔑 LOGIN CREDENTIALS:"
echo "   admin / Admin123!@#"
echo "   security / Security123!@#"
echo "   john / John123!@#"
echo "   sarah / Sarah123!@#"
echo "   mike / Mike123!@#"
echo "   emma / Emma123!@#"
echo "   alex / Alex123!@#"
echo "   lisa / Lisa123!@#"
echo "   david / David123!@#"
echo "   test / Test123!@#"
echo ""
echo "🚀 Start server with: npm run dev"
echo ""
echo "⚠️  WARNING: Plain text passwords for DEMO ONLY!"
