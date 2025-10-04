#!/bin/bash

echo "🚀 RUN DIRECT FIX ON UBUNTU"
echo "============================"
echo ""

# Download and run the fix script
echo "📥 Downloading and running direct fix..."
curl -s https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/direct-fix.sh -o direct-fix.sh

if [ $? -eq 0 ]; then
    echo "✅ Fix script downloaded"
    chmod +x direct-fix.sh
    ./direct-fix.sh
    rm direct-fix.sh
    echo ""
    echo "🎉 All fixes applied! Now restart the server:"
    echo "npm run dev"
else
    echo "❌ Failed to download fix script. Please run manually:"
    echo "curl -s https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/direct-fix.sh -o direct-fix.sh"
    echo "chmod +x direct-fix.sh"
    echo "./direct-fix.sh"
fi
