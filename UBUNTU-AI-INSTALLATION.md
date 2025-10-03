# 🛡️ Hướng dẫn Cài đặt AI Detection trên Ubuntu Wazuh Manager

## 📋 Tổng quan

Hướng dẫn chi tiết cài đặt hệ thống AI không giám sát trên Ubuntu Wazuh Manager (192.168.205.128) để phát hiện SQLi và Brute Force attacks từ logs của web server (192.168.205.100:3000).

## 🎯 Mục tiêu

- Cài đặt AI detection system trên Wazuh Manager
- Tích hợp với Wazuh SIEM hiện có
- Phát hiện anomalies từ logs của web server
- Real-time monitoring và alerting

## 🔧 Yêu cầu hệ thống

### Ubuntu Server Requirements:
- **OS**: Ubuntu 20.04+ hoặc 22.04 LTS
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **CPU**: 2 cores (khuyến nghị 4 cores)
- **Disk**: 20GB free space
- **Network**: Kết nối đến web server (192.168.205.100)

### Software Requirements:
- **Python**: 3.8+
- **Wazuh Manager**: Đã cài đặt và chạy
- **Git**: Để clone repository
- **Systemd**: Để chạy service

## 🚀 Bước 1: Chuẩn bị Ubuntu Server

### 1.1 Cập nhật hệ thống

```bash
# Đăng nhập vào Ubuntu Wazuh Manager
ssh root@192.168.205.128

# Cập nhật package list
sudo apt update && sudo apt upgrade -y

# Cài đặt các package cần thiết
sudo apt install -y python3 python3-pip python3-venv git curl wget htop
```

### 1.2 Kiểm tra Wazuh Manager

```bash
# Kiểm tra Wazuh Manager status
sudo systemctl status wazuh-manager

# Kiểm tra Wazuh logs
sudo tail -f /var/ossec/logs/ossec.log

# Kiểm tra archives directory
ls -la /var/ossec/logs/archives/
```

### 1.3 Tạo user cho AI system

```bash
# Tạo user chuyên dụng cho AI system
sudo useradd -m -s /bin/bash ai-detector
sudo usermod -aG ossec ai-detector

# Tạo home directory
sudo mkdir -p /opt/ai-detection
sudo chown ai-detector:ai-detector /opt/ai-detection
```

## 📥 Bước 2: Download và Setup AI System

### 2.1 Clone repository

```bash
# Chuyển sang user ai-detector
sudo su - ai-detector

# Clone repository từ web server hoặc GitHub
cd /opt/ai-detection
git clone <repository-url> .

# Hoặc copy từ web server
# scp -r user@192.168.205.100:/path/to/sqli-bruteforce-attack/ai-ml ./ai-ml
```

### 2.2 Setup Python environment

```bash
# Tạo virtual environment
python3 -m venv /opt/ai-detection/venv
source /opt/ai-detection/venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install scikit-learn numpy pandas scipy joblib regex python-json-logger
```

### 2.3 Cấu hình permissions

```bash
# Set permissions cho ai-detector user
sudo chown -R ai-detector:ai-detector /opt/ai-detection
sudo chmod -R 755 /opt/ai-detection

# Tạo directories cần thiết
mkdir -p /opt/ai-detection/ai-ml/{models,data,alerts,logs,scripts}
mkdir -p /opt/ai-detection/ai-ml/data/{training,testing,processed}
```

## 🔧 Bước 3: Cấu hình Wazuh Integration

### 3.1 Kiểm tra Wazuh archives

```bash
# Kiểm tra Wazuh archives file
ls -la /var/ossec/logs/archives/archives.json

# Kiểm tra permissions
sudo -u ai-detector test -r /var/ossec/logs/archives/archives.json && echo "Readable" || echo "Not readable"

# Nếu không readable, thêm ai-detector vào ossec group
sudo usermod -aG ossec ai-detector
```

### 3.2 Tạo Wazuh custom rules (optional)

```bash
# Tạo custom rules cho AI alerts
sudo tee /var/ossec/etc/rules/ai_anomaly_rules.xml > /dev/null <<EOF
<group name="ai,anomaly,">
  <rule id="100100" level="12">
    <decoded_as>json</decoded_as>
    <field name="source">ai_anomaly_detector</field>
    <description>AI Detected SQL Injection Attack</description>
    <group>attack,sqli,</group>
  </rule>
  
  <rule id="100101" level="10">
    <decoded_as>json</decoded_as>
    <field name="source">ai_anomaly_detector</field>
    <field name="attack_type">brute_force</field>
    <description>AI Detected Brute Force Attack</description>
    <group>attack,brute_force,</group>
  </rule>
  
  <rule id="100102" level="8">
    <decoded_as>json</decoded_as>
    <field name="source">ai_anomaly_detector</field>
    <field name="attack_type">credential_stuffing</field>
    <description>AI Detected Credential Stuffing Attack</description>
    <group>attack,credential_stuffing,</group>
  </rule>
</group>
EOF

# Set permissions
sudo chown root:ossec /var/ossec/etc/rules/ai_anomaly_rules.xml
sudo chmod 640 /var/ossec/etc/rules/ai_anomaly_rules.xml

# Restart Wazuh Manager
sudo systemctl restart wazuh-manager
```

## 🎓 Bước 4: Training AI Model

### 4.1 Chuẩn bị training data

```bash
# Chuyển sang ai-detector user
sudo su - ai-detector
source /opt/ai-detection/venv/bin/activate

# Kiểm tra Wazuh logs
cd /opt/ai-detection
python3 ai-ml/wazuh-log-processor.py --archives-path /var/ossec/logs/archives/archives.json --limit 1000 --output-dir ai-ml/data/processed
```

### 4.2 Train AI model

```bash
# Train model từ Wazuh logs
python3 ai-ml/train-model.py \
    --use-wazuh \
    --wazuh-archives /var/ossec/logs/archives/archives.json \
    --contamination 0.1 \
    --limit 5000 \
    --evaluate \
    --output-dir ai-ml/models

# Kiểm tra model đã được tạo
ls -la ai-ml/models/
```

### 4.3 Test model

```bash
# Test model với sample data
python3 ai-ml/scripts/test.sh

# Test manual
python3 -c "
from anomaly_detector import CyberSecurityAnomalyDetector
detector = CyberSecurityAnomalyDetector()
detector.load_model('ai-ml/models/anomaly_detector.joblib')
print('Model loaded successfully!')
"
```

## 🚀 Bước 5: Deploy Real-time Detection

### 5.1 Tạo systemd service

```bash
# Tạo service file
sudo tee /etc/systemd/system/ai-anomaly-detector.service > /dev/null <<EOF
[Unit]
Description=AI Anomaly Detection Service
After=network.target wazuh-manager.service
Wants=wazuh-manager.service

[Service]
Type=simple
User=ai-detector
Group=ai-detector
WorkingDirectory=/opt/ai-detection
Environment=PATH=/opt/ai-detection/venv/bin
ExecStart=/opt/ai-detection/venv/bin/python ai-ml/real-time-detector.py --model-path ai-ml/models/anomaly_detector.joblib --archives-path /var/ossec/logs/archives/archives.json
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload
```

### 5.2 Enable và start service

```bash
# Enable service
sudo systemctl enable ai-anomaly-detector

# Start service
sudo systemctl start ai-anomaly-detector

# Check status
sudo systemctl status ai-anomaly-detector
```

### 5.3 Kiểm tra logs

```bash
# View service logs
sudo journalctl -u ai-anomaly-detector -f

# Check AI logs
tail -f /opt/ai-detection/ai-ml/logs/*.log

# Check alerts
tail -f /opt/ai-detection/ai-ml/alerts/alerts_*.jsonl
```

## 📊 Bước 6: Monitoring và Testing

### 6.1 Tạo monitoring script

```bash
# Tạo monitoring script
sudo su - ai-detector
cat > /opt/ai-detection/ai-ml/scripts/monitor.sh <<'EOF'
#!/bin/bash

echo "🛡️ AI Anomaly Detection System Status"
echo "====================================="

# Service status
echo "🔧 Service Status:"
if systemctl is-active --quiet ai-anomaly-detector; then
    echo "  ✅ Service is running"
else
    echo "  ❌ Service is not running"
fi

# Model status
echo ""
echo "🧠 Model Status:"
if [ -f "/opt/ai-detection/ai-ml/models/anomaly_detector.joblib" ]; then
    echo "  ✅ Model file exists"
    echo "  📅 Model modified: $(stat -c %y /opt/ai-detection/ai-ml/models/anomaly_detector.joblib)"
else
    echo "  ❌ Model file not found"
fi

# Recent alerts
echo ""
echo "🚨 Recent Alerts:"
ALERT_COUNT=$(find /opt/ai-detection/ai-ml/alerts -name "*.jsonl" -type f -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
if [ "$ALERT_COUNT" -gt 0 ]; then
    echo "  📊 Total alerts: $ALERT_COUNT"
    echo "  📈 Recent alerts (last 5):"
    find /opt/ai-detection/ai-ml/alerts -name "alerts_*.jsonl" -type f -exec tail -5 {} + 2>/dev/null
else
    echo "  📊 No alerts found yet"
fi

# Wazuh integration
echo ""
echo "🛡️ Wazuh Integration:"
if [ -f "/var/ossec/logs/alerts/ai_alerts.log" ]; then
    WAZUH_COUNT=$(wc -l < /var/ossec/logs/alerts/ai_alerts.log 2>/dev/null || echo "0")
    echo "  ✅ Wazuh integration active"
    echo "  📊 Wazuh alerts: $WAZUH_COUNT"
else
    echo "  ⚠️ Wazuh integration not active yet"
fi

# Recent service logs
echo ""
echo "📋 Recent Service Logs:"
sudo journalctl -u ai-anomaly-detector --no-pager -n 10 --since "1 hour ago" 2>/dev/null || echo "  No recent logs found"
EOF

chmod +x /opt/ai-detection/ai-ml/scripts/monitor.sh
```

### 6.2 Test system

```bash
# Run monitoring script
/opt/ai-detection/ai-ml/scripts/monitor.sh

# Test với sample data
cd /opt/ai-detection
source venv/bin/activate
python3 ai-ml/anomaly-detector.py
```

## 🔍 Bước 7: Verification và Troubleshooting

### 7.1 Kiểm tra toàn bộ system

```bash
# Check all components
echo "🔍 System Verification Checklist:"
echo ""

# 1. Wazuh Manager
echo "1. Wazuh Manager:"
sudo systemctl is-active wazuh-manager && echo "  ✅ Running" || echo "  ❌ Not running"

# 2. Wazuh Archives
echo "2. Wazuh Archives:"
[ -f "/var/ossec/logs/archives/archives.json" ] && echo "  ✅ Archives exist" || echo "  ❌ Archives missing"

# 3. AI Service
echo "3. AI Detection Service:"
sudo systemctl is-active ai-anomaly-detector && echo "  ✅ Running" || echo "  ❌ Not running"

# 4. AI Model
echo "4. AI Model:"
[ -f "/opt/ai-detection/ai-ml/models/anomaly_detector.joblib" ] && echo "  ✅ Model exists" || echo "  ❌ Model missing"

# 5. Python Environment
echo "5. Python Environment:"
[ -d "/opt/ai-detection/venv" ] && echo "  ✅ Virtual env exists" || echo "  ❌ Virtual env missing"

# 6. Permissions
echo "6. Permissions:"
sudo -u ai-detector test -r /var/ossec/logs/archives/archives.json && echo "  ✅ Readable" || echo "  ❌ Not readable"
```

### 7.2 Troubleshooting common issues

#### Issue 1: Service không start
```bash
# Check logs
sudo journalctl -u ai-anomaly-detector -n 50

# Check permissions
sudo -u ai-detector ls -la /opt/ai-detection/ai-ml/models/

# Check Python environment
sudo -u ai-detector /opt/ai-detection/venv/bin/python --version
```

#### Issue 2: Model không load
```bash
# Retrain model
sudo su - ai-detector
source /opt/ai-detection/venv/bin/activate
cd /opt/ai-detection
python3 ai-ml/train-model.py --use-wazuh --limit 1000
```

#### Issue 3: Không có logs từ web server
```bash
# Check Wazuh agent connection
sudo tail -f /var/ossec/logs/ossec.log | grep "192.168.205.100"

# Check agent status
sudo /var/ossec/bin/agent_control -l | grep "192.168.205.100"

# Check archives
sudo tail -f /var/ossec/logs/archives/archives.json | grep "attacks.log"
```

## 📈 Bước 8: Performance Tuning

### 8.1 System optimization

```bash
# Increase file limits
echo "ai-detector soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "ai-detector hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize Python performance
echo "export PYTHONUNBUFFERED=1" | sudo tee -a /opt/ai-detection/venv/bin/activate
echo "export OMP_NUM_THREADS=4" | sudo tee -a /opt/ai-detection/venv/bin/activate
```

### 8.2 Monitoring setup

```bash
# Create log rotation
sudo tee /etc/logrotate.d/ai-anomaly-detector > /dev/null <<EOF
/opt/ai-detection/ai-ml/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ai-detector ai-detector
    postrotate
        systemctl reload ai-anomaly-detector.service 2>/dev/null || true
    endscript
}

/opt/ai-detection/ai-ml/alerts/*.jsonl {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 644 ai-detector ai-detector
}
EOF
```

## 🎯 Bước 9: Production Deployment

### 9.1 Security hardening

```bash
# Firewall rules
sudo ufw allow from 192.168.205.0/24 to any port 22
sudo ufw allow from 192.168.205.0/24 to any port 1514
sudo ufw enable

# SSH hardening
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### 9.2 Backup strategy

```bash
# Create backup script
sudo su - ai-detector
cat > /opt/ai-detection/backup.sh <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/ai-detection/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup model
cp ai-ml/models/anomaly_detector.joblib $BACKUP_DIR/model_$DATE.joblib

# Backup configuration
cp ai-ml/config.json $BACKUP_DIR/config_$DATE.json

# Keep only last 7 days
find $BACKUP_DIR -name "*.joblib" -mtime +7 -delete
find $BACKUP_DIR -name "*.json" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/ai-detection/backup.sh

# Add to crontab
echo "0 2 * * * /opt/ai-detection/backup.sh" | crontab -
```

## ✅ Bước 10: Final Verification

### 10.1 Complete system test

```bash
# Run complete verification
echo "🎯 Final System Verification"
echo "============================"

# 1. Check all services
sudo systemctl status wazuh-manager ai-anomaly-detector --no-pager

# 2. Check AI model
sudo su - ai-detector -c "source /opt/ai-detection/venv/bin/activate && cd /opt/ai-detection && python3 -c 'from anomaly_detector import CyberSecurityAnomalyDetector; d = CyberSecurityAnomalyDetector(); d.load_model(\"ai-ml/models/anomaly_detector.joblib\"); print(\"✅ Model loaded successfully\")'"

# 3. Check real-time processing
sudo journalctl -u ai-anomaly-detector --since "5 minutes ago" --no-pager

# 4. Check alerts generation
find /opt/ai-detection/ai-ml/alerts -name "*.jsonl" -exec wc -l {} + 2>/dev/null | tail -1

# 5. Check Wazuh integration
ls -la /var/ossec/logs/alerts/ai_alerts.log 2>/dev/null || echo "Wazuh alerts file not created yet"
```

### 10.2 Performance monitoring

```bash
# System resources
echo "📊 System Resources:"
free -h
df -h /opt/ai-detection
ps aux | grep -E "(wazuh|ai-anomaly)" | grep -v grep

# AI system performance
echo "🧠 AI System Performance:"
sudo journalctl -u ai-anomaly-detector --since "1 hour ago" | grep -E "(processed|anomaly|alert)" | tail -10
```

## 🎉 Hoàn thành!

### ✅ Checklist hoàn thành:

- [x] Ubuntu server setup và cập nhật
- [x] Python environment và dependencies
- [x] AI system download và setup
- [x] Wazuh integration configuration
- [x] AI model training
- [x] Real-time detection service
- [x] Monitoring và alerting
- [x] Security hardening
- [x] Backup strategy
- [x] Performance optimization

### 🚀 System đã sẵn sàng:

```bash
# Quick status check
/opt/ai-detection/ai-ml/scripts/monitor.sh

# View real-time logs
sudo journalctl -u ai-anomaly-detector -f

# Check alerts
tail -f /opt/ai-detection/ai-ml/alerts/alerts_*.jsonl
```

### 📊 Monitoring Commands:

```bash
# Service status
sudo systemctl status ai-anomaly-detector

# View logs
sudo journalctl -u ai-anomaly-detector -f

# Check alerts
tail -f /opt/ai-detection/ai-ml/alerts/alerts_*.jsonl

# Wazuh alerts
tail -f /var/ossec/logs/alerts/ai_alerts.log

# System monitoring
/opt/ai-detection/ai-ml/scripts/monitor.sh
```

Hệ thống AI detection đã được cài đặt thành công trên Ubuntu Wazuh Manager và sẵn sàng phát hiện SQLi và Brute Force attacks từ web server logs!
