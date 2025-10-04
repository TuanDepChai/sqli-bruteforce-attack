@echo off
REM 🚀 Script chạy toàn bộ Demo AI từ Windows
REM Tự động copy files và chạy demo trên Ubuntu

echo 🚀 DEMO AI KHÔNG GIÁM SÁT - Wazuh Integration
echo ==============================================

REM Cấu hình
set UBUNTU_HOST=192.168.205.128
set UBUNTU_USER=web
set REMOTE_PATH=/home/web/Desktop/sqli-bruteforce-attack/ai-ml/

echo.
echo 📋 Bước 1: Copy files lên Ubuntu...
echo ===================================

REM Copy files
echo 📄 demo-unsupervised-ai.py
scp demo-unsupervised-ai.py %UBUNTU_USER%@%UBUNTU_HOST%:%REMOTE_PATH%

echo 📄 run-ubuntu-demo.sh
scp run-ubuntu-demo.sh %UBUNTU_USER%@%UBUNTU_HOST%:%REMOTE_PATH%

echo 📄 DEMO-GUIDE.md
scp DEMO-GUIDE.md %UBUNTU_USER%@%UBUNTU_HOST%:%REMOTE_PATH%

echo.
echo 🔧 Cấp quyền thực thi...
ssh %UBUNTU_USER%@%UBUNTU_HOST% "chmod +x %REMOTE_PATH%*.sh %REMOTE_PATH%*.py"

echo.
echo 🚀 Bước 2: Chạy Demo trên Ubuntu...
echo ===================================
ssh %UBUNTU_USER%@%UBUNTU_HOST% "sudo %REMOTE_PATH%run-ubuntu-demo.sh"

echo.
echo 🎉 Demo hoàn thành!
echo.
echo 📋 Kết quả có thể xem tại:
echo   - ai-detection-results.json (kết quả demo)
echo.
echo 📖 Hướng dẫn chi tiết: DEMO-GUIDE.md
echo.
pause