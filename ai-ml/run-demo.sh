#!/bin/bash

# 🚀 Script chạy Demo AI Không Giám Sát
# Chạy trên Ubuntu Wazuh Manager (192.168.205.128)

echo "🚀 DEMO AI KHÔNG GIÁM SÁT - Wazuh Integration"
echo "=============================================="

# Kiểm tra quyền sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Vui lòng chạy với sudo"
    exit 1
fi

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa được cài đặt"
    exit 1
fi

# Cài đặt dependencies nếu cần
echo "📦 Kiểm tra dependencies..."
pip3 install scikit-learn numpy pandas --quiet

# Tạo thư mục làm việc
mkdir -p /home/web/ai-demo
cd /home/web/ai-demo

# Copy file demo
cp /home/web/Desktop/sqli-bruteforce-attack/ai-ml/demo-unsupervised-ai.py .

# Cấp quyền thực thi
chmod +x demo-unsupervised-ai.py

echo "🔍 Kiểm tra log file..."
if [ -f "/var/ossec/logs/archives/archives.json" ]; then
    echo "✅ Tìm thấy archives.json"
    
    # Đếm số dòng
    total_lines=$(wc -l < /var/ossec/logs/archives/archives.json)
    echo "📊 Tổng số dòng log: $total_lines"
    
    # Đếm số log từ attacks.log
    attacks_count=$(grep -c "attacks.log" /var/ossec/logs/archives/archives.json)
    echo "🎯 Số log từ attacks.log: $attacks_count"
    
    if [ $attacks_count -gt 0 ]; then
        echo ""
        echo "🤖 Chạy Demo AI..."
        echo "=================="
        python3 demo-unsupervised-ai.py
        
        echo ""
        echo "📋 Kết quả Demo:"
        echo "==============="
        if [ -f "ai-detection-results.json" ]; then
            echo "✅ File kết quả: ai-detection-results.json"
            
            # Đếm số bất thường phát hiện
            anomaly_count=$(grep -c '"attack_type"' ai-detection-results.json)
            echo "🚨 Số bất thường phát hiện: $anomaly_count"
            
            # Hiển thị một số kết quả
            echo ""
            echo "🔍 Mẫu kết quả phát hiện:"
            head -20 ai-detection-results.json
        else
            echo "❌ Không tạo được file kết quả"
        fi
    else
        echo "❌ Không có log nào từ attacks.log để phân tích"
        echo "💡 Hãy chạy một số tấn công trên web app trước"
    fi
else
    echo "❌ Không tìm thấy /var/ossec/logs/archives/archives.json"
    echo "💡 Đảm bảo Wazuh đang chạy và có log"
fi

echo ""
echo "🏁 Demo hoàn thành!"
