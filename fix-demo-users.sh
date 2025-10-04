#!/bin/bash

echo "🔧 FIXING DEMO USERS - PLAIN TEXT PASSWORDS"
echo "==========================================="
echo ""

echo "📝 Creating demo users with plain text passwords..."
node scripts/create-demo-users.js

echo ""
echo "✅ DEMO USERS FIXED!"
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
echo "🚀 Now restart the server:"
echo "   npm run dev"
echo ""
echo "⚠️  These are PLAIN TEXT passwords for DEMO ONLY!"
