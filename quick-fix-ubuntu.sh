#!/bin/bash

echo "🚀 QUICK FIX UBUNTU - FIX MONGODB EXPORTS"
echo "=========================================="
echo ""

# Download and run the fix script
echo "📥 Downloading fix script..."
curl -s https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/fix-mongodb-exports.sh -o fix-mongodb-exports.sh

if [ $? -eq 0 ]; then
    echo "✅ Fix script downloaded"
    chmod +x fix-mongodb-exports.sh
    ./fix-mongodb-exports.sh
    rm fix-mongodb-exports.sh
    echo ""
    echo "🎉 All fixes applied! Now restart the server:"
    echo "npm run dev"
else
    echo "❌ Failed to download fix script. Please run manually:"
    echo "curl -s https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/fix-mongodb-exports.sh -o fix-mongodb-exports.sh"
    echo "chmod +x fix-mongodb-exports.sh"
    echo "./fix-mongodb-exports.sh"
fi
