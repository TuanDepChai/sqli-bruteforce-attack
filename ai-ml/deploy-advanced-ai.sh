#!/bin/bash

# 🛡️ Deploy Advanced Cybersecurity AI với logic chuẩn chỉnh
# Thay thế AI cũ bằng phiên bản tối ưu

echo "🛡️ DEPLOY ADVANCED CYBERSECURITY AI"
echo "===================================="

# Kiểm tra quyền sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Vui lòng chạy với sudo"
    exit 1
fi

# Cài đặt dependencies nâng cao
echo "📦 Cài đặt dependencies nâng cao..."
pip3 install --upgrade scikit-learn numpy pandas scipy

# Backup AI cũ
echo "💾 Backup AI cũ..."
cd /opt/ai-detection/sqli-bruteforce-attack/ai-ml
cp demo-unsupervised-ai.py demo-unsupervised-ai.py.backup 2>/dev/null || true

# Copy AI mới
echo "📋 Deploy AI chuẩn chỉnh..."
cp advanced-cybersecurity-ai.py demo-unsupervised-ai.py

# Cấp quyền
chmod +x demo-unsupervised-ai.py

echo "✅ Deploy hoàn thành!"
echo ""
echo "🚀 Chạy AI chuẩn chỉnh:"
echo "   python3 demo-unsupervised-ai.py"
echo ""
echo "📊 Kết quả sẽ được lưu vào:"
echo "   advanced-ai-detection-results.json"
