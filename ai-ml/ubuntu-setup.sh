#!/bin/bash

# 🛡️ Ubuntu AI Detection Setup Script
# Automated setup script for Ubuntu Wazuh Manager

set -e

echo "🛡️ Ubuntu AI Detection System Setup"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as regular user."
   exit 1
fi

# Configuration
AI_USER="ai-detector"
AI_HOME="/opt/ai-detection"
WAZUH_ARCHIVES="/var/ossec/logs/archives/archives.json"
WEB_SERVER_IP="192.168.205.100"

print_status "Starting Ubuntu AI Detection Setup..."
print_status "Target: Ubuntu Wazuh Manager"
print_status "AI User: $AI_USER"
print_status "Installation Path: $AI_HOME"

# Step 1: System Update
print_status "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl wget htop

print_success "System packages updated"

# Step 2: Check Wazuh Manager
print_status "Step 2: Checking Wazuh Manager..."
if systemctl is-active --quiet wazuh-manager; then
    print_success "Wazuh Manager is running"
else
    print_error "Wazuh Manager is not running. Please start it first."
    exit 1
fi

# Step 3: Create AI User
print_status "Step 3: Creating AI detection user..."
if id "$AI_USER" &>/dev/null; then
    print_warning "User $AI_USER already exists"
else
    sudo useradd -m -s /bin/bash $AI_USER
    sudo usermod -aG ossec $AI_USER
    print_success "User $AI_USER created"
fi

# Step 4: Setup Directory Structure
print_status "Step 4: Setting up directory structure..."
sudo mkdir -p $AI_HOME
sudo chown $AI_USER:$AI_USER $AI_HOME

# Create subdirectories
sudo -u $AI_USER mkdir -p $AI_HOME/ai-ml/{models,data,alerts,logs,scripts}
sudo -u $AI_USER mkdir -p $AI_HOME/ai-ml/data/{training,testing,processed}

print_success "Directory structure created"

# Step 5: Copy AI System Files
print_status "Step 5: Copying AI system files..."

# Check if we're in the right directory
if [ ! -f "ai-ml/anomaly-detector.py" ]; then
    print_error "AI system files not found. Please run this script from the project root directory."
    exit 1
fi

# Copy AI files
sudo cp -r ai-ml/* $AI_HOME/ai-ml/
sudo chown -R $AI_USER:$AI_USER $AI_HOME

print_success "AI system files copied"

# Step 6: Setup Python Environment
print_status "Step 6: Setting up Python environment..."
sudo -u $AI_USER python3 -m venv $AI_HOME/venv
sudo -u $AI_USER $AI_HOME/venv/bin/pip install --upgrade pip
sudo -u $AI_USER $AI_HOME/venv/bin/pip install scikit-learn numpy pandas scipy joblib regex python-json-logger

print_success "Python environment setup completed"

# Step 7: Check Wazuh Archives Access
print_status "Step 7: Checking Wazuh archives access..."
if [ -f "$WAZUH_ARCHIVES" ]; then
    print_success "Wazuh archives file found"
    
    # Check permissions
    if sudo -u $AI_USER test -r "$WAZUH_ARCHIVES"; then
        print_success "AI user can read Wazuh archives"
    else
        print_warning "AI user cannot read Wazuh archives. Fixing permissions..."
        sudo usermod -aG ossec $AI_USER
        sudo chmod 644 "$WAZUH_ARCHIVES"
    fi
else
    print_warning "Wazuh archives file not found. This is normal if no logs have been processed yet."
fi

# Step 8: Create Wazuh Custom Rules
print_status "Step 8: Creating Wazuh custom rules..."
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

sudo chown root:ossec /var/ossec/etc/rules/ai_anomaly_rules.xml
sudo chmod 640 /var/ossec/etc/rules/ai_anomaly_rules.xml

print_success "Wazuh custom rules created"

# Step 9: Create Configuration File
print_status "Step 9: Creating configuration file..."
sudo -u $AI_USER tee $AI_HOME/ai-ml/config.json > /dev/null <<EOF
{
    "model": {
        "contamination": 0.1,
        "anomaly_threshold": 0.5,
        "max_features": 1.0,
        "n_estimators": 200
    },
    "monitoring": {
        "wazuh_archives_path": "$WAZUH_ARCHIVES",
        "log_interval": 1,
        "queue_size": 1000
    },
    "alerts": {
        "rate_limit_window": 60,
        "rate_limit_count": 10,
        "severity_threshold": {
            "high": 0.7,
            "medium": 0.5,
            "low": 0.3
        }
    },
    "output": {
        "alerts_dir": "ai-ml/alerts",
        "logs_dir": "ai-ml/logs",
        "wazuh_integration": true,
        "external_siem": false
    }
}
EOF

print_success "Configuration file created"

# Step 10: Create Utility Scripts
print_status "Step 10: Creating utility scripts..."

# Training script
sudo -u $AI_USER tee $AI_HOME/ai-ml/scripts/train.sh > /dev/null <<EOF
#!/bin/bash

echo "🎓 Training AI Model for Anomaly Detection"
echo "=========================================="

cd $AI_HOME
source venv/bin/activate

MODEL_OUTPUT="ai-ml/models/anomaly_detector_\$(date +%Y%m%d_%H%M%S).joblib"
CONTAMINATION=0.1

echo "📊 Training model from Wazuh logs..."
echo "Model will be saved to: \$MODEL_OUTPUT"

python3 ai-ml/train-model.py \\
    --use-wazuh \\
    --wazuh-archives "$WAZUH_ARCHIVES" \\
    --contamination \$CONTAMINATION \\
    --model-output "\$MODEL_OUTPUT" \\
    --evaluate \\
    --output-dir ai-ml/models

LATEST_MODEL="ai-ml/models/anomaly_detector.joblib"
if [ -f "\$MODEL_OUTPUT" ]; then
    ln -sf "\$(basename "\$MODEL_OUTPUT")" "\$LATEST_MODEL"
    echo "✅ Model trained successfully: \$MODEL_OUTPUT"
    echo "📝 Latest model symlink: \$LATEST_MODEL"
else
    echo "❌ Model training failed"
    exit 1
fi

echo "🚀 Model is ready for deployment!"
EOF

# Monitoring script
sudo -u $AI_USER tee $AI_HOME/ai-ml/scripts/monitor.sh > /dev/null <<EOF
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

if systemctl is-enabled --quiet ai-anomaly-detector; then
    echo "  ✅ Service is enabled"
else
    echo "  ❌ Service is not enabled"
fi

# Model status
echo ""
echo "🧠 Model Status:"
MODEL_PATH="$AI_HOME/ai-ml/models/anomaly_detector.joblib"
if [ -f "\$MODEL_PATH" ]; then
    echo "  ✅ Model file exists"
    echo "  📁 Model path: \$MODEL_PATH"
    echo "  📅 Model modified: \$(stat -c %y "\$MODEL_PATH")"
else
    echo "  ❌ Model file not found"
fi

# Recent alerts
echo ""
echo "🚨 Recent Alerts:"
ALERTS_DIR="$AI_HOME/ai-ml/alerts"
if [ -d "\$ALERTS_DIR" ]; then
    ALERT_COUNT=\$(find "\$ALERTS_DIR" -name "*.jsonl" -type f -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print \$1}')
    if [ "\$ALERT_COUNT" -gt 0 ]; then
        echo "  📊 Total alerts: \$ALERT_COUNT"
        echo "  📁 Alerts directory: \$ALERTS_DIR"
        
        # Show recent alerts
        RECENT_ALERTS=\$(find "\$ALERTS_DIR" -name "alerts_*.jsonl" -type f -exec tail -5 {} + 2>/dev/null | wc -l)
        echo "  📈 Recent alerts (last 5): \$RECENT_ALERTS"
    else
        echo "  📊 No alerts found yet"
    fi
else
    echo "  ❌ Alerts directory not found"
fi

# Wazuh integration
echo ""
echo "🛡️ Wazuh Integration:"
WAZUH_ALERTS="/var/ossec/logs/alerts/ai_alerts.log"
if [ -f "\$WAZUH_ALERTS" ]; then
    WAZUH_COUNT=\$(wc -l < "\$WAZUH_ALERTS" 2>/dev/null || echo "0")
    echo "  ✅ Wazuh integration active"
    echo "  📊 Wazuh alerts: \$WAZUH_COUNT"
else
    echo "  ⚠️ Wazuh integration not active yet"
fi

# Show recent logs
echo ""
echo "📋 Recent Service Logs:"
sudo journalctl -u ai-anomaly-detector --no-pager -n 10 --since "1 hour ago" 2>/dev/null || echo "  No recent logs found"

echo ""
echo "🔍 For real-time monitoring:"
echo "  sudo journalctl -u ai-anomaly-detector -f"
echo "  tail -f $AI_HOME/ai-ml/alerts/alerts_*.jsonl"
EOF

# Test script
sudo -u $AI_USER tee $AI_HOME/ai-ml/scripts/test.sh > /dev/null <<EOF
#!/bin/bash

echo "🧪 Testing AI Anomaly Detection System"
echo "======================================"

MODEL_PATH="$AI_HOME/ai-ml/models/anomaly_detector.joblib"

# Check if model exists
if [ ! -f "\$MODEL_PATH" ]; then
    echo "❌ Model not found. Please train a model first:"
    echo "   $AI_HOME/ai-ml/scripts/train.sh"
    exit 1
fi

echo "🧠 Testing AI model..."

cd $AI_HOME
source venv/bin/activate

# Test model loading
python3 -c "
from anomaly_detector import CyberSecurityAnomalyDetector
import json

print('Loading model...')
detector = CyberSecurityAnomalyDetector()
detector.load_model('$AI_HOME/ai-ml/models/anomaly_detector.joblib')

print('✅ Model loaded successfully')

# Test with sample data
sample_data = {
    'timestamp': '2025-10-03T22:17:17.460+0700',
    'method': 'POST',
    'url': '/api/login?username=admin&password=123456',
    'username': 'admin',
    'password': '123456',
    'ip': '192.168.205.1',
    'success': False,
    'user_agent': 'PythonBruteForce/1.0',
    'referer': 'direct',
    'status_code': 200,
    'query': 'SELECT * FROM users WHERE username = \\'admin\\' AND password = \\'123456\\''
}

print('Testing prediction...')
result = detector.predict(sample_data)

print('✅ Prediction successful')
print(f'Attack Type: {result[\"attack_type\"]}')
print(f'Is Anomaly: {result[\"is_anomaly\"]}')
print(f'Anomaly Score: {result[\"anomaly_score\"]:.3f}')
print(f'Confidence: {result[\"confidence\"]:.3f}')
print(f'Explanation: {result[\"explanation\"]}')
"

echo ""
echo "✅ AI model test completed successfully!"
EOF

# Make scripts executable
sudo -u $AI_USER chmod +x $AI_HOME/ai-ml/scripts/*.sh

print_success "Utility scripts created"

# Step 11: Create Systemd Service
print_status "Step 11: Creating systemd service..."
sudo tee /etc/systemd/system/ai-anomaly-detector.service > /dev/null <<EOF
[Unit]
Description=AI Anomaly Detection Service
After=network.target wazuh-manager.service
Wants=wazuh-manager.service

[Service]
Type=simple
User=$AI_USER
Group=$AI_USER
WorkingDirectory=$AI_HOME
Environment=PATH=$AI_HOME/venv/bin
ExecStart=$AI_HOME/venv/bin/python ai-ml/real-time-detector.py --model-path ai-ml/models/anomaly_detector.joblib --archives-path $WAZUH_ARCHIVES
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

print_success "Systemd service created"

# Step 12: Setup Log Rotation
print_status "Step 12: Setting up log rotation..."
sudo tee /etc/logrotate.d/ai-anomaly-detector > /dev/null <<EOF
$AI_HOME/ai-ml/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $AI_USER $AI_USER
    postrotate
        systemctl reload ai-anomaly-detector.service 2>/dev/null || true
    endscript
}

$AI_HOME/ai-ml/alerts/*.jsonl {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 644 $AI_USER $AI_USER
}
EOF

print_success "Log rotation configured"

# Step 13: Train Initial Model
print_status "Step 13: Training initial AI model..."
print_warning "This may take a few minutes depending on available logs..."

# Check if we have logs to train on
if [ -f "$WAZUH_ARCHIVES" ] && [ -s "$WAZUH_ARCHIVES" ]; then
    sudo -u $AI_USER bash $AI_HOME/ai-ml/scripts/train.sh
    
    if [ -f "$AI_HOME/ai-ml/models/anomaly_detector.joblib" ]; then
        print_success "Initial model training completed"
    else
        print_warning "Model training failed or no logs available yet"
        print_warning "You can train the model later when logs are available"
    fi
else
    print_warning "No Wazuh logs available yet. Model will be trained when logs are available."
fi

# Step 14: Final Setup
print_status "Step 14: Final setup..."

# Enable service (but don't start yet - wait for model)
sudo systemctl enable ai-anomaly-detector

# Set file limits
echo "$AI_USER soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "$AI_USER hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Restart Wazuh Manager to load new rules
sudo systemctl restart wazuh-manager

print_success "Final setup completed"

# Step 15: Verification
print_status "Step 15: System verification..."

echo ""
echo "🔍 System Verification Checklist:"
echo ""

# 1. Wazuh Manager
echo "1. Wazuh Manager:"
sudo systemctl is-active wazuh-manager && echo "  ✅ Running" || echo "  ❌ Not running"

# 2. Wazuh Archives
echo "2. Wazuh Archives:"
[ -f "$WAZUH_ARCHIVES" ] && echo "  ✅ Archives exist" || echo "  ⚠️ Archives not found yet (normal)"

# 3. AI User
echo "3. AI User:"
id $AI_USER &>/dev/null && echo "  ✅ User exists" || echo "  ❌ User missing"

# 4. AI Files
echo "4. AI System Files:"
[ -f "$AI_HOME/ai-ml/anomaly-detector.py" ] && echo "  ✅ Files exist" || echo "  ❌ Files missing"

# 5. Python Environment
echo "5. Python Environment:"
[ -d "$AI_HOME/venv" ] && echo "  ✅ Virtual env exists" || echo "  ❌ Virtual env missing"

# 6. AI Model
echo "6. AI Model:"
[ -f "$AI_HOME/ai-ml/models/anomaly_detector.joblib" ] && echo "  ✅ Model exists" || echo "  ⚠️ Model not trained yet"

# 7. Service
echo "7. AI Service:"
sudo systemctl is-enabled ai-anomaly-detector && echo "  ✅ Service enabled" || echo "  ❌ Service not enabled"

# 8. Permissions
echo "8. Permissions:"
sudo -u $AI_USER test -r "$WAZUH_ARCHIVES" 2>/dev/null && echo "  ✅ Readable" || echo "  ⚠️ Not readable (will be fixed when logs exist)"

print_success "System verification completed"

# Final Summary
echo ""
echo "🎉 Ubuntu AI Detection System Setup Completed!"
echo "=============================================="
echo ""
echo "📋 Setup Summary:"
echo "  ✅ System packages updated"
echo "  ✅ AI user created: $AI_USER"
echo "  ✅ AI system installed: $AI_HOME"
echo "  ✅ Python environment configured"
echo "  ✅ Wazuh integration configured"
echo "  ✅ Systemd service created"
echo "  ✅ Log rotation configured"
echo "  ✅ Utility scripts created"
echo ""
echo "🚀 Next Steps:"
echo ""
if [ -f "$AI_HOME/ai-ml/models/anomaly_detector.joblib" ]; then
    echo "  1. Start AI service: sudo systemctl start ai-anomaly-detector"
    echo "  2. Monitor service: sudo journalctl -u ai-anomaly-detector -f"
    echo "  3. Check alerts: tail -f $AI_HOME/ai-ml/alerts/alerts_*.jsonl"
else
    echo "  1. Train AI model: $AI_HOME/ai-ml/scripts/train.sh"
    echo "  2. Start AI service: sudo systemctl start ai-anomaly-detector"
    echo "  3. Monitor service: sudo journalctl -u ai-anomaly-detector -f"
fi
echo ""
echo "📊 Monitoring Commands:"
echo "  System status: $AI_HOME/ai-ml/scripts/monitor.sh"
echo "  Test model: $AI_HOME/ai-ml/scripts/test.sh"
echo "  Service logs: sudo journalctl -u ai-anomaly-detector -f"
echo "  Wazuh alerts: tail -f /var/ossec/logs/alerts/ai_alerts.log"
echo ""
echo "🔧 Configuration:"
echo "  Config file: $AI_HOME/ai-ml/config.json"
echo "  Model path: $AI_HOME/ai-ml/models/anomaly_detector.joblib"
echo "  Wazuh archives: $WAZUH_ARCHIVES"
echo ""
echo "🛡️ AI Detection System is ready for deployment!"
