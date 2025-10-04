#!/bin/bash

# 🚀 Script tự động tải về và chạy AI trên Ubuntu SIEM
# Chạy trực tiếp trên Ubuntu SIEM (192.168.205.128)

echo "🚀 DEPLOY AI KHÔNG GIÁM SÁT - Ubuntu SIEM"
echo "=========================================="

# Kiểm tra quyền sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Vui lòng chạy với sudo"
    exit 1
fi

# Cấu hình
GITHUB_REPO="https://github.com/TuanDepChai/sqli-bruteforce-attack.git"
WORK_DIR="/opt/ai-detection"
AI_DIR="$WORK_DIR/ai-ml"

echo "📋 Cấu hình:"
echo "   GitHub: $GITHUB_REPO"
echo "   Work Dir: $WORK_DIR"
echo ""

# Cài đặt dependencies
echo "📦 Cài đặt system dependencies..."
apt-get update -qq
apt-get install -y git python3 python3-pip python3-venv

# Tạo thư mục làm việc
echo "📁 Tạo thư mục làm việc..."
mkdir -p $WORK_DIR
cd $WORK_DIR

# Clone repository
echo "📥 Tải về code từ GitHub..."
if [ -d "sqli-bruteforce-attack" ]; then
    echo "   Repository đã tồn tại, cập nhật..."
    cd sqli-bruteforce-attack
    git pull origin main
else
    echo "   Clone repository mới..."
    git clone $GITHUB_REPO
    cd sqli-bruteforce-attack
fi

# Cài đặt Python dependencies
echo "🐍 Cài đặt Python dependencies..."
pip3 install --upgrade pip
pip3 install scikit-learn numpy pandas

# Cấp quyền thực thi
echo "🔧 Cấp quyền thực thi..."
chmod +x $AI_DIR/*.sh
chmod +x $AI_DIR/*.py

echo "✅ Cài đặt hoàn thành!"
echo ""

# Kiểm tra Wazuh
echo "🔍 Kiểm tra Wazuh..."
if systemctl is-active --quiet wazuh-manager; then
    echo "✅ Wazuh Manager đang chạy"
else
    echo "⚠️  Wazuh Manager không chạy, khởi động..."
    systemctl start wazuh-manager
fi

# Kiểm tra log files
echo "📊 Kiểm tra log files..."
if [ -f "/var/ossec/logs/archives/archives.json" ]; then
    echo "✅ Tìm thấy archives.json"
    
    # Đếm số dòng
    total_lines=$(wc -l < /var/ossec/logs/archives/archives.json)
    echo "   Tổng số dòng log: $total_lines"
    
    # Đếm số log từ attacks.log
    attacks_count=$(grep -c "attacks.log" /var/ossec/logs/archives/archives.json)
    echo "   Số log từ attacks.log: $attacks_count"
    
    if [ $attacks_count -gt 0 ]; then
        echo ""
        echo "🤖 Chạy Demo AI..."
        echo "=================="
        
        # Chạy demo
        cd $AI_DIR
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
echo "🎉 Deploy hoàn thành!"
echo ""
echo "📋 Thông tin quan trọng:"
echo "   Work Directory: $WORK_DIR"
echo "   AI Directory: $AI_DIR"
echo "   Results: $AI_DIR/ai-detection-results.json"
echo ""
echo "🔧 Chạy lại demo:"
echo "   cd $AI_DIR && python3 demo-unsupervised-ai.py"
echo ""
echo "📖 Xem hướng dẫn:"
echo "   cat $AI_DIR/DEMO-GUIDE.md"
