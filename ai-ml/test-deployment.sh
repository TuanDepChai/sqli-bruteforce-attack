#!/bin/bash

# 🧪 Script test deployment trên Ubuntu SIEM
# Kiểm tra xem AI có hoạt động đúng không

echo "🧪 TEST DEPLOYMENT - Ubuntu SIEM"
echo "================================"

# Kiểm tra quyền sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Vui lòng chạy với sudo"
    exit 1
fi

# Kiểm tra các thành phần
echo "🔍 Kiểm tra các thành phần..."

# 1. Kiểm tra thư mục
if [ -d "/opt/ai-detection" ]; then
    echo "✅ Thư mục /opt/ai-detection tồn tại"
else
    echo "❌ Thư mục /opt/ai-detection không tồn tại"
    exit 1
fi

# 2. Kiểm tra Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3 đã cài đặt"
    python3 --version
else
    echo "❌ Python3 chưa cài đặt"
    exit 1
fi

# 3. Kiểm tra dependencies
echo "📦 Kiểm tra Python dependencies..."
python3 -c "import sklearn, numpy, pandas; print('✅ Dependencies OK')" 2>/dev/null || {
    echo "❌ Thiếu dependencies"
    echo "💡 Chạy: pip3 install scikit-learn numpy pandas"
    exit 1
}

# 4. Kiểm tra Wazuh
echo "🔍 Kiểm tra Wazuh..."
if systemctl is-active --quiet wazuh-manager; then
    echo "✅ Wazuh Manager đang chạy"
else
    echo "⚠️  Wazuh Manager không chạy"
fi

# 5. Kiểm tra log files
echo "📊 Kiểm tra log files..."
if [ -f "/var/ossec/logs/archives/archives.json" ]; then
    echo "✅ Tìm thấy archives.json"
    
    # Đếm số dòng
    total_lines=$(wc -l < /var/ossec/logs/archives/archives.json)
    echo "   Tổng số dòng log: $total_lines"
    
    # Đếm số log từ attacks.log
    attacks_count=$(grep -c "attacks.log" /var/ossec/logs/archives/archives.json)
    echo "   Số log từ attacks.log: $attacks_count"
else
    echo "❌ Không tìm thấy archives.json"
fi

# 6. Kiểm tra AI files
echo "🤖 Kiểm tra AI files..."
AI_DIR="/opt/ai-detection/ai-ml"

if [ -f "$AI_DIR/demo-unsupervised-ai.py" ]; then
    echo "✅ File demo-unsupervised-ai.py tồn tại"
else
    echo "❌ File demo-unsupervised-ai.py không tồn tại"
    exit 1
fi

# 7. Test AI
echo "🧪 Test AI..."
cd $AI_DIR

# Chạy test với log mẫu
echo "   Chạy test với log mẫu..."
python3 quick-test.py > /tmp/ai-test.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ AI test thành công"
    
    # Hiển thị kết quả
    echo "   Kết quả test:"
    grep -A 5 "TONG KET:" /tmp/ai-test.log || echo "   Không tìm thấy kết quả"
else
    echo "❌ AI test thất bại"
    echo "   Log lỗi:"
    cat /tmp/ai-test.log
fi

# 8. Test với log thực tế
if [ $attacks_count -gt 0 ]; then
    echo "🔍 Test với log thực tế..."
    python3 demo-unsupervised-ai.py > /tmp/ai-demo.log 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ AI demo thành công"
        
        # Kiểm tra file kết quả
        if [ -f "ai-detection-results.json" ]; then
            echo "✅ File kết quả được tạo"
            
            # Đếm số bất thường
            anomaly_count=$(grep -c '"attack_type"' ai-detection-results.json)
            echo "   Số bất thường phát hiện: $anomaly_count"
        else
            echo "⚠️  File kết quả không được tạo"
        fi
    else
        echo "❌ AI demo thất bại"
        echo "   Log lỗi:"
        cat /tmp/ai-demo.log
    fi
else
    echo "⚠️  Không có log từ attacks.log để test"
fi

echo ""
echo "📋 TỔNG KẾT TEST:"
echo "================="

# Tổng kết
if [ -f "/opt/ai-detection/ai-ml/ai-detection-results.json" ]; then
    echo "🎉 DEPLOYMENT THÀNH CÔNG!"
    echo "   AI đã sẵn sàng phát hiện SQLi và Brute Force"
    echo "   Kết quả: /opt/ai-detection/ai-ml/ai-detection-results.json"
else
    echo "⚠️  DEPLOYMENT CẦN KIỂM TRA"
    echo "   AI có thể chưa hoạt động đúng"
fi

echo ""
echo "🔧 Lệnh hữu ích:"
echo "   Xem kết quả: cat /opt/ai-detection/ai-ml/ai-detection-results.json"
echo "   Chạy lại demo: cd /opt/ai-detection/ai-ml && python3 demo-unsupervised-ai.py"
echo "   Xem hướng dẫn: cat /opt/ai-detection/ai-ml/DEMO-GUIDE.md"
