#!/bin/bash

# 📁 Script copy files lên Ubuntu Wazuh Manager
# Chạy từ Windows với WSL hoặc Git Bash

echo "📁 COPY FILES LÊN UBUNTU WAZUH MANAGER"
echo "======================================"

# Cấu hình
UBUNTU_HOST="192.168.205.128"
UBUNTU_USER="web"
REMOTE_PATH="/home/web/Desktop/sqli-bruteforce-attack/ai-ml/"

# Files cần copy
FILES=(
    "demo-unsupervised-ai.py"
    "run-ubuntu-demo.sh"
    "DEMO-GUIDE.md"
)

echo "🎯 Target: ${UBUNTU_USER}@${UBUNTU_HOST}:${REMOTE_PATH}"
echo ""

# Kiểm tra SSH connection
echo "🔌 Kiểm tra kết nối SSH..."
if ! ssh -o ConnectTimeout=5 ${UBUNTU_USER}@${UBUNTU_HOST} "echo 'SSH OK'" 2>/dev/null; then
    echo "❌ Không thể kết nối SSH đến ${UBUNTU_HOST}"
    echo "💡 Đảm bảo:"
    echo "   - Ubuntu đang chạy"
    echo "   - SSH service đang hoạt động"
    echo "   - IP address đúng"
    echo "   - SSH key đã setup"
    exit 1
fi

echo "✅ SSH connection OK"
echo ""

# Tạo thư mục remote nếu chưa có
echo "📁 Tạo thư mục remote..."
ssh ${UBUNTU_USER}@${UBUNTU_HOST} "mkdir -p ${REMOTE_PATH}"

# Copy từng file
echo "📋 Copying files..."
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   📄 $file"
        scp "$file" ${UBUNTU_USER}@${UBUNTU_HOST}:${REMOTE_PATH}
        
        if [ $? -eq 0 ]; then
            echo "      ✅ OK"
        else
            echo "      ❌ FAILED"
        fi
    else
        echo "   ⚠️  $file - Not found"
    fi
done

echo ""
echo "🔧 Cấp quyền thực thi..."
ssh ${UBUNTU_USER}@${UBUNTU_HOST} "chmod +x ${REMOTE_PATH}*.sh ${REMOTE_PATH}*.py"

echo ""
echo "📋 Kiểm tra files đã copy..."
ssh ${UBUNTU_USER}@${UBUNTU_HOST} "ls -la ${REMOTE_PATH}"

echo ""
echo "🎉 Copy hoàn thành!"
echo ""
echo "📋 Bước tiếp theo:"
echo "1. SSH vào Ubuntu: ssh ${UBUNTU_USER}@${UBUNTU_HOST}"
echo "2. Chạy demo: sudo ${REMOTE_PATH}run-ubuntu-demo.sh"
echo ""
echo "📖 Xem hướng dẫn: cat ${REMOTE_PATH}DEMO-GUIDE.md"