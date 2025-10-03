#!/bin/bash

# 🚀 Quick Deploy Script for Ubuntu Wazuh Manager
# One-command deployment of AI Detection System

set -e

echo "🚀 Quick Deploy - AI Detection System"
echo "====================================="

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
WEB_SERVER_IP="192.168.205.100"
WAZUH_MANAGER_IP="192.168.205.128"

print_status "Quick Deploy Configuration:"
print_status "  Web Server: $WEB_SERVER_IP:3000"
print_status "  Wazuh Manager: $WAZUH_MANAGER_IP"
print_status "  AI User: ai-detector"
print_status "  Install Path: /opt/ai-detection"

echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled by user"
    exit 0
fi

# Step 1: System Check
print_status "Step 1: Checking system requirements..."

# Check if Wazuh Manager is running
if systemctl is-active --quiet wazuh-manager; then
    print_success "Wazuh Manager is running"
else
    print_error "Wazuh Manager is not running. Please start it first."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
if [ "$(printf '%s\n' "3.8" "$PYTHON_VERSION" | sort -V | head -n1)" = "3.8" ]; then
    print_success "Python $PYTHON_VERSION is supported"
else
    print_error "Python $PYTHON_VERSION is not supported. Please install Python 3.8+"
    exit 1
fi

# Step 2: Run Setup Script
print_status "Step 2: Running Ubuntu setup script..."
if [ -f "ai-ml/ubuntu-setup.sh" ]; then
    chmod +x ai-ml/ubuntu-setup.sh
    ./ai-ml/ubuntu-setup.sh
else
    print_error "Setup script not found: ai-ml/ubuntu-setup.sh"
    exit 1
fi

# Step 3: Train Model (if logs available)
print_status "Step 3: Training AI model..."

WAZUH_ARCHIVES="/var/ossec/logs/archives/archives.json"
if [ -f "$WAZUH_ARCHIVES" ] && [ -s "$WAZUH_ARCHIVES" ]; then
    print_status "Training model from available logs..."
    sudo -u ai-detector /opt/ai-detection/ai-ml/scripts/train.sh
    
    if [ -f "/opt/ai-detection/ai-ml/models/anomaly_detector.joblib" ]; then
        print_success "Model training completed successfully"
    else
        print_warning "Model training failed or no relevant logs found"
    fi
else
    print_warning "No Wazuh logs available yet. Model will be trained when logs are available."
fi

# Step 4: Start Service
print_status "Step 4: Starting AI detection service..."

if [ -f "/opt/ai-detection/ai-ml/models/anomaly_detector.joblib" ]; then
    sudo systemctl start ai-anomaly-detector
    sleep 5
    
    if systemctl is-active --quiet ai-anomaly-detector; then
        print_success "AI detection service started successfully"
    else
        print_warning "AI detection service failed to start. Check logs:"
        print_warning "  sudo journalctl -u ai-anomaly-detector -n 20"
    fi
else
    print_warning "Cannot start service: Model not trained yet"
    print_warning "Train model first: sudo -u ai-detector /opt/ai-detection/ai-ml/scripts/train.sh"
fi

# Step 5: Verification
print_status "Step 5: System verification..."

echo ""
echo "🔍 Final Verification:"
echo ""

# Check all components
echo "1. Wazuh Manager:"
systemctl is-active wazuh-manager && echo "  ✅ Running" || echo "  ❌ Not running"

echo "2. AI Detection Service:"
systemctl is-active ai-anomaly-detector && echo "  ✅ Running" || echo "  ⚠️ Not running (model may not be trained)"

echo "3. AI Model:"
[ -f "/opt/ai-detection/ai-ml/models/anomaly_detector.joblib" ] && echo "  ✅ Model exists" || echo "  ⚠️ Model not trained yet"

echo "4. Wazuh Archives:"
[ -f "/var/ossec/logs/archives/archives.json" ] && echo "  ✅ Archives exist" || echo "  ⚠️ No archives yet"

echo "5. AI User:"
id ai-detector &>/dev/null && echo "  ✅ User exists" || echo "  ❌ User missing"

# Step 6: Generate Test Attack (Optional)
print_status "Step 6: Testing system (optional)..."

echo ""
read -p "Generate test attack from web server to verify detection? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Generating test attack..."
    
    # Simple curl test to web server
    print_status "Sending test request to web server..."
    curl -s -X POST "http://$WEB_SERVER_IP:3000/api/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"test"}' \
        > /dev/null || true
    
    print_status "Waiting 10 seconds for logs to propagate..."
    sleep 10
    
    # Check if AI detected the attack
    if [ -f "/opt/ai-detection/ai-ml/alerts/alerts_*.jsonl" ]; then
        ALERT_COUNT=$(find /opt/ai-detection/ai-ml/alerts -name "*.jsonl" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
        if [ "$ALERT_COUNT" -gt 0 ]; then
            print_success "Test attack detected! AI system is working."
        else
            print_warning "No alerts generated yet. Check logs for issues."
        fi
    else
        print_warning "No alerts file created yet. System may still be starting."
    fi
fi

# Final Summary
echo ""
echo "🎉 Quick Deploy Completed!"
echo "========================="
echo ""
echo "📊 System Status:"
echo "  Wazuh Manager: $(systemctl is-active wazuh-manager)"
echo "  AI Service: $(systemctl is-active ai-anomaly-detector 2>/dev/null || echo 'not running')"
echo "  AI Model: $([ -f '/opt/ai-detection/ai-ml/models/anomaly_detector.joblib' ] && echo 'trained' || echo 'not trained')"
echo ""
echo "🚀 Next Steps:"
echo ""
if [ -f "/opt/ai-detection/ai-ml/models/anomaly_detector.joblib" ]; then
    echo "✅ System is ready!"
    echo ""
    echo "📊 Monitor system:"
    echo "  /opt/ai-detection/ai-ml/scripts/monitor.sh"
    echo ""
    echo "📋 View logs:"
    echo "  sudo journalctl -u ai-anomaly-detector -f"
    echo "  tail -f /opt/ai-detection/ai-ml/alerts/alerts_*.jsonl"
    echo "  tail -f /var/ossec/logs/alerts/ai_alerts.log"
else
    echo "⚠️ Model needs to be trained first:"
    echo "  sudo -u ai-detector /opt/ai-detection/ai-ml/scripts/train.sh"
    echo "  sudo systemctl start ai-anomaly-detector"
    echo ""
    echo "📊 Then monitor:"
    echo "  /opt/ai-detection/ai-ml/scripts/monitor.sh"
fi
echo ""
echo "🧪 Test system:"
echo "  /opt/ai-detection/ai-ml/scripts/test.sh"
echo ""
echo "🔧 Configuration:"
echo "  /opt/ai-detection/ai-ml/config.json"
echo ""
echo "🛡️ AI Detection System deployment completed!"
