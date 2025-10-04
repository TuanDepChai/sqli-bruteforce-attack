#!/bin/bash

# 🧪 Script chạy Test AI với log mẫu
# Chạy trên Ubuntu Wazuh Manager

echo "🧪 TEST AI VỚI LOG MẪU THỰC TẾ"
echo "==============================="

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa được cài đặt"
    exit 1
fi

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
pip3 install scikit-learn numpy pandas --quiet

# Tạo thư mục làm việc
mkdir -p /home/web/ai-test
cd /home/web/ai-test

# Copy file test
cp /home/web/Desktop/sqli-bruteforce-attack/ai-ml/test-with-sample-logs.py .
cp /home/web/Desktop/sqli-bruteforce-attack/ai-ml/demo-unsupervised-ai.py .

# Cấp quyền thực thi
chmod +x test-with-sample-logs.py
chmod +x demo-unsupervised-ai.py

echo "🧪 Chạy Test AI..."
echo "=================="
python3 test-with-sample-logs.py

echo ""
echo "📋 Kết quả Test:"
echo "================"
if [ -f "test-results.json" ]; then
    echo "✅ File kết quả: test-results.json"
    
    # Hiển thị kết quả
    echo ""
    echo "🔍 Chi tiết kết quả:"
    cat test-results.json | python3 -m json.tool
    
    # Thống kê
    echo ""
    echo "📊 Thống kê:"
    anomaly_count=$(grep -c '"is_anomaly": true' test-results.json)
    total_count=$(grep -c '"timestamp"' test-results.json)
    echo "   Tổng số log: $total_count"
    echo "   Bất thường: $anomaly_count"
    echo "   Tỷ lệ: $(echo "scale=1; $anomaly_count * 100 / $total_count" | bc)%"
    
else
    echo "❌ Không tạo được file kết quả"
fi

echo ""
echo "🏁 Test hoàn thành!"
