#!/bin/bash

# 🛡️ AI/ML Setup Script for Cybersecurity Anomaly Detection
# Setup script để cài đặt và cấu hình AI detection system

set -e

echo "🛡️ AI/ML Setup for Cybersecurity Anomaly Detection"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
   print_error "This script should not be run as root"
   exit 1
fi

# Check Python version
print_status "Checking Python version..."
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
    print_success "Python $python_version is supported"
else
    print_error "Python $python_version is not supported. Please install Python 3.8 or higher"
    exit 1
fi

# Create directories
print_status "Creating AI/ML directories..."
mkdir -p ai-ml/{models,data,alerts,logs,scripts}
mkdir -p ai-ml/data/{training,testing,processed}

print_success "Directories created successfully"

# Install Python dependencies
print_status "Installing Python dependencies..."

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3 first"
    exit 1
fi

# Upgrade pip
python3 -m pip install --upgrade pip

# Install requirements
if [ -f "ai-ml/requirements.txt" ]; then
    print_status "Installing requirements from ai-ml/requirements.txt..."
    pip3 install -r ai-ml/requirements.txt
    print_success "Python dependencies installed successfully"
else
    print_warning "requirements.txt not found, installing basic dependencies..."
    pip3 install scikit-learn numpy pandas scipy joblib regex python-json-logger
    print_success "Basic dependencies installed"
fi

# Make Python scripts executable
print_status "Making Python scripts executable..."
chmod +x ai-ml/*.py
print_success "Scripts made executable"

# Create systemd service file for real-time detection
print_status "Creating systemd service for real-time detection..."

SERVICE_FILE="/etc/systemd/system/ai-anomaly-detector.service"
SERVICE_USER=$(whoami)
PROJECT_PATH=$(pwd)

sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=AI Anomaly Detection Service
After=network.target wazuh-agent.service
Wants=wazuh-agent.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$PROJECT_PATH
ExecStart=/usr/bin/python3 $PROJECT_PATH/ai-ml/real-time-detector.py --model-path $PROJECT_PATH/ai-ml/models/anomaly_detector.joblib
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service created at $SERVICE_FILE"

# Create configuration file
print_status "Creating configuration file..."

CONFIG_FILE="ai-ml/config.json"
cat > $CONFIG_FILE <<EOF
{
    "model": {
        "contamination": 0.1,
        "anomaly_threshold": 0.5,
        "max_features": 1.0,
        "n_estimators": 200
    },
    "monitoring": {
        "wazuh_archives_path": "/var/ossec/logs/archives/archives.json",
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

print_success "Configuration file created at $CONFIG_FILE"

# Create log rotation configuration
print_status "Creating log rotation configuration..."

LOGROTATE_FILE="/etc/logrotate.d/ai-anomaly-detector"
sudo tee $LOGROTATE_FILE > /dev/null <<EOF
$PROJECT_PATH/ai-ml/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
    postrotate
        systemctl reload ai-anomaly-detector.service 2>/dev/null || true
    endscript
}

$PROJECT_PATH/ai-ml/alerts/*.jsonl {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
}
EOF

print_success "Log rotation configured"

# Create training script
print_status "Creating training script..."

TRAINING_SCRIPT="ai-ml/scripts/train.sh"
cat > $TRAINING_SCRIPT <<'EOF'
#!/bin/bash

# AI Model Training Script
set -e

echo "🎓 Training AI Model for Anomaly Detection"
echo "=========================================="

# Configuration
MODEL_OUTPUT="ai-ml/models/anomaly_detector_$(date +%Y%m%d_%H%M%S).joblib"
CONTAMINATION=0.1
WAZUH_ARCHIVES="/var/ossec/logs/archives/archives.json"

# Check if Wazuh archives exist
if [ ! -f "$WAZUH_ARCHIVES" ]; then
    echo "❌ Wazuh archives not found at $WAZUH_ARCHIVES"
    echo "Please ensure Wazuh is installed and running"
    exit 1
fi

# Create models directory
mkdir -p ai-ml/models

echo "📊 Training model from Wazuh logs..."
echo "Model will be saved to: $MODEL_OUTPUT"

# Train model
python3 ai-ml/train-model.py \
    --use-wazuh \
    --wazuh-archives "$WAZUH_ARCHIVES" \
    --contamination $CONTAMINATION \
    --model-output "$MODEL_OUTPUT" \
    --evaluate \
    --output-dir ai-ml/models

# Create symlink to latest model
LATEST_MODEL="ai-ml/models/anomaly_detector.joblib"
if [ -f "$MODEL_OUTPUT" ]; then
    ln -sf "$(basename "$MODEL_OUTPUT")" "$LATEST_MODEL"
    echo "✅ Model trained successfully: $MODEL_OUTPUT"
    echo "📝 Latest model symlink: $LATEST_MODEL"
else
    echo "❌ Model training failed"
    exit 1
fi

echo "🚀 Model is ready for deployment!"
EOF

chmod +x $TRAINING_SCRIPT
print_success "Training script created at $TRAINING_SCRIPT"

# Create deployment script
print_status "Creating deployment script..."

DEPLOY_SCRIPT="ai-ml/scripts/deploy.sh"
cat > $DEPLOY_SCRIPT <<'EOF'
#!/bin/bash

# AI Model Deployment Script
set -e

echo "🚀 Deploying AI Anomaly Detection System"
echo "========================================"

# Configuration
MODEL_PATH="ai-ml/models/anomaly_detector.joblib"
SERVICE_NAME="ai-anomaly-detector"

# Check if model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo "❌ Model not found at $MODEL_PATH"
    echo "Please train a model first: ./ai-ml/scripts/train.sh"
    exit 1
fi

# Check if service file exists
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
    echo "❌ Service file not found. Please run setup.sh first"
    exit 1
fi

echo "📊 Model found: $MODEL_PATH"

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Enable service
echo "⚙️ Enabling service..."
sudo systemctl enable $SERVICE_NAME

# Start service
echo "🚀 Starting AI anomaly detection service..."
sudo systemctl start $SERVICE_NAME

# Check status
echo "📊 Checking service status..."
sudo systemctl status $SERVICE_NAME --no-pager

echo "✅ AI Anomaly Detection System deployed successfully!"
echo ""
echo "📋 Useful commands:"
echo "  Check status: sudo systemctl status $SERVICE_NAME"
echo "  View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Stop service: sudo systemctl stop $SERVICE_NAME"
echo "  Restart service: sudo systemctl restart $SERVICE_NAME"
EOF

chmod +x $DEPLOY_SCRIPT
print_success "Deployment script created at $DEPLOY_SCRIPT"

# Create monitoring script
print_status "Creating monitoring script..."

MONITOR_SCRIPT="ai-ml/scripts/monitor.sh"
cat > $MONITOR_SCRIPT <<'EOF'
#!/bin/bash

# AI System Monitoring Script
echo "📊 AI Anomaly Detection System Status"
echo "====================================="

SERVICE_NAME="ai-anomaly-detector"

# Check service status
echo "🔧 Service Status:"
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "  ✅ Service is running"
else
    echo "  ❌ Service is not running"
fi

if systemctl is-enabled --quiet $SERVICE_NAME; then
    echo "  ✅ Service is enabled"
else
    echo "  ❌ Service is not enabled"
fi

# Check model file
echo ""
echo "🧠 Model Status:"
MODEL_PATH="ai-ml/models/anomaly_detector.joblib"
if [ -f "$MODEL_PATH" ]; then
    echo "  ✅ Model file exists"
    echo "  📁 Model path: $MODEL_PATH"
    echo "  📅 Model modified: $(stat -c %y "$MODEL_PATH")"
else
    echo "  ❌ Model file not found"
fi

# Check recent alerts
echo ""
echo "🚨 Recent Alerts:"
ALERTS_DIR="ai-ml/alerts"
if [ -d "$ALERTS_DIR" ]; then
    ALERT_COUNT=$(find "$ALERTS_DIR" -name "*.jsonl" -type f -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
    if [ "$ALERT_COUNT" -gt 0 ]; then
        echo "  📊 Total alerts: $ALERT_COUNT"
        echo "  📁 Alerts directory: $ALERTS_DIR"
        
        # Show recent alerts
        RECENT_ALERTS=$(find "$ALERTS_DIR" -name "alerts_*.jsonl" -type f -exec tail -5 {} + 2>/dev/null | wc -l)
        echo "  📈 Recent alerts (last 5): $RECENT_ALERTS"
    else
        echo "  📊 No alerts found yet"
    fi
else
    echo "  ❌ Alerts directory not found"
fi

# Check Wazuh integration
echo ""
echo "🛡️ Wazuh Integration:"
WAZUH_ALERTS="/var/ossec/logs/alerts/ai_alerts.log"
if [ -f "$WAZUH_ALERTS" ]; then
    WAZUH_COUNT=$(wc -l < "$WAZUH_ALERTS" 2>/dev/null || echo "0")
    echo "  ✅ Wazuh integration active"
    echo "  📊 Wazuh alerts: $WAZUH_COUNT"
else
    echo "  ⚠️ Wazuh integration not active yet"
fi

# Show recent logs
echo ""
echo "📋 Recent Service Logs:"
sudo journalctl -u $SERVICE_NAME --no-pager -n 10 --since "1 hour ago" 2>/dev/null || echo "  No recent logs found"

echo ""
echo "🔍 For real-time monitoring:"
echo "  sudo journalctl -u $SERVICE_NAME -f"
echo "  tail -f ai-ml/alerts/alerts_*.jsonl"
EOF

chmod +x $MONITOR_SCRIPT
print_success "Monitoring script created at $MONITOR_SCRIPT"

# Create test script
print_status "Creating test script..."

TEST_SCRIPT="ai-ml/scripts/test.sh"
cat > $TEST_SCRIPT <<'EOF'
#!/bin/bash

# AI System Test Script
echo "🧪 Testing AI Anomaly Detection System"
echo "======================================"

MODEL_PATH="ai-ml/models/anomaly_detector.joblib"

# Check if model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo "❌ Model not found. Please train a model first:"
    echo "   ./ai-ml/scripts/train.sh"
    exit 1
fi

echo "🧠 Testing AI model..."

# Test model loading
python3 -c "
from anomaly_detector import CyberSecurityAnomalyDetector
import json

print('Loading model...')
detector = CyberSecurityAnomalyDetector()
detector.load_model('$MODEL_PATH')

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
    'query': 'SELECT * FROM users WHERE username = \'admin\' AND password = \'123456\''
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

chmod +x $TEST_SCRIPT
print_success "Test script created at $TEST_SCRIPT"

# Create README
print_status "Creating README..."

README_FILE="ai-ml/README.md"
cat > $README_FILE <<'EOF'
# 🛡️ AI-Powered Cybersecurity Anomaly Detection

Hệ thống phát hiện anomaly sử dụng AI không giám sát (Isolation Forest) để detect SQLi và Brute Force attacks từ Wazuh logs.

## 📋 Features

- **AI không giám sát**: Sử dụng Isolation Forest để học từ traffic sạch
- **Real-time detection**: Monitor Wazuh logs real-time
- **Multi-attack detection**: SQLi, Brute Force, Credential Stuffing
- **Wazuh integration**: Tích hợp với SIEM Wazuh
- **Automated alerts**: Gửi alerts đến multiple systems

## 🚀 Quick Start

### 1. Setup
```bash
# Run setup script
./ai-ml/setup.sh
```

### 2. Train Model
```bash
# Train AI model từ Wazuh logs
./ai-ml/scripts/train.sh
```

### 3. Deploy
```bash
# Deploy real-time detection service
./ai-ml/scripts/deploy.sh
```

### 4. Monitor
```bash
# Check system status
./ai-ml/scripts/monitor.sh

# View real-time logs
sudo journalctl -u ai-anomaly-detector -f
```

## 📊 Architecture

```
Wazuh Archives → Log Processor → Feature Engineering → Isolation Forest → Real-time Detector → Alerts
```

## 🔧 Configuration

Edit `ai-ml/config.json` để customize:

- Model parameters (contamination, thresholds)
- Monitoring settings
- Alert configurations
- Output destinations

## 📈 Monitoring

### Service Status
```bash
sudo systemctl status ai-anomaly-detector
```

### View Alerts
```bash
tail -f ai-ml/alerts/alerts_*.jsonl
```

### Wazuh Integration
```bash
tail -f /var/ossec/logs/alerts/ai_alerts.log
```

## 🧪 Testing

```bash
# Test AI model
./ai-ml/scripts/test.sh

# Test with sample data
python3 ai-ml/anomaly-detector.py
```

## 📁 Directory Structure

```
ai-ml/
├── models/           # Trained AI models
├── data/            # Training/testing data
├── alerts/          # Generated alerts
├── logs/            # System logs
├── scripts/         # Utility scripts
├── anomaly-detector.py      # Main AI detector
├── wazuh-log-processor.py   # Log processor
├── real-time-detector.py    # Real-time monitoring
├── train-model.py           # Training script
└── config.json             # Configuration
```

## 🎯 Attack Detection

### SQL Injection
- Parameter manipulation patterns
- SQL keyword detection
- Query complexity analysis
- Error-based injection

### Brute Force
- Rapid successive attempts
- Dictionary password attacks
- Automated tool detection
- User enumeration

### Features Used
- Request frequency
- Payload size analysis
- Response time patterns
- User agent analysis
- IP reputation
- Temporal patterns
- Statistical anomalies

## 🔍 Troubleshooting

### Model not loading
```bash
# Check model file
ls -la ai-ml/models/anomaly_detector.joblib

# Retrain model
./ai-ml/scripts/train.sh
```

### Service not starting
```bash
# Check logs
sudo journalctl -u ai-anomaly-detector -n 50

# Check Wazuh archives
ls -la /var/ossec/logs/archives/archives.json
```

### No alerts generated
```bash
# Check anomaly threshold
grep "anomaly_threshold" ai-ml/config.json

# Test with sample data
./ai-ml/scripts/test.sh
```

## 📚 Advanced Usage

### Custom Training
```bash
python3 ai-ml/train-model.py \
    --logs-file custom_logs.json \
    --contamination 0.05 \
    --evaluate
```

### Batch Processing
```bash
python3 ai-ml/wazuh-log-processor.py \
    --archives-path /var/ossec/logs/archives/archives.json \
    --limit 10000 \
    --output-dir ai-ml/data/processed
```

### Real-time Detection
```bash
python3 ai-ml/real-time-detector.py \
    --model-path ai-ml/models/anomaly_detector.joblib \
    --anomaly-threshold 0.3 \
    --rate-limit 20
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check logs: `sudo journalctl -u ai-anomaly-detector`
- Monitor alerts: `tail -f ai-ml/alerts/alerts_*.jsonl`
- Test model: `./ai-ml/scripts/test.sh`
EOF

print_success "README created at $README_FILE"

# Final setup
print_status "Finalizing setup..."

# Set proper permissions
chmod -R 755 ai-ml/
chown -R $(whoami):$(whoami) ai-ml/

print_success "Permissions set correctly"

# Summary
echo ""
echo "🎉 AI/ML Setup Completed Successfully!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "  1. Train AI model: ./ai-ml/scripts/train.sh"
echo "  2. Deploy service: ./ai-ml/scripts/deploy.sh"
echo "  3. Monitor system: ./ai-ml/scripts/monitor.sh"
echo ""
echo "📁 Created Files:"
echo "  ✅ AI/ML modules and scripts"
echo "  ✅ Systemd service: /etc/systemd/system/ai-anomaly-detector.service"
echo "  ✅ Configuration: ai-ml/config.json"
echo "  ✅ Utility scripts: ai-ml/scripts/"
echo "  ✅ Documentation: ai-ml/README.md"
echo ""
echo "🔧 Configuration:"
echo "  - Model contamination: 0.1 (10% expected anomalies)"
echo "  - Anomaly threshold: 0.5"
echo "  - Rate limiting: 10 alerts/minute"
echo "  - Wazuh integration: Enabled"
echo ""
echo "📊 Monitoring:"
echo "  - Service logs: sudo journalctl -u ai-anomaly-detector -f"
echo "  - Alerts: tail -f ai-ml/alerts/alerts_*.jsonl"
echo "  - Wazuh alerts: tail -f /var/ossec/logs/alerts/ai_alerts.log"
echo ""
echo "🚀 Ready to deploy AI-powered anomaly detection!"
