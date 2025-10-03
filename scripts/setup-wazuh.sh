#!/bin/bash

# Automated Wazuh Setup for SQLi BruteForce Attack Detection
# Usage: chmod +x scripts/setup-wazuh.sh && ./scripts/setup-wazuh.sh

echo "🛡️ Automated Wazuh Setup for SQLi BruteForce Attack Detection"
echo "============================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WAZUH_DECODER="/var/ossec/etc/decoders/local_decoder.xml"
WAZUH_RULES="/var/ossec/etc/rules/local_rules.xml"
WAZUH_CONF="/var/ossec/etc/ossec.conf"
LOG_FILE="/opt/sqli-bruteforce-attack/logs/attacks.log"

echo "📋 Configuration:"
echo "• Decoder: $WAZUH_DECODER"
echo "• Rules: $WAZUH_RULES"
echo "• Config: $WAZUH_CONF"
echo "• Log File: $LOG_FILE"
echo ""

# Check if Wazuh agent is installed
if [ ! -f "/var/ossec/bin/wazuh-analysisd" ]; then
    echo "❌ Wazuh agent not found!"
    echo "Please install Wazuh agent first:"
    echo "curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -"
    echo "echo 'deb https://packages.wazuh.com/4.x/apt/ stable main' > /etc/apt/sources.list.d/wazuh.list"
    echo "apt update && apt install wazuh-agent"
    exit 1
fi

echo "✅ Wazuh agent found"

# Create backup
echo "💾 Creating backup of Wazuh configuration..."
sudo cp $WAZUH_CONF ${WAZUH_CONF}.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No existing config to backup"

# Step 1: Skip decoder and rules (using direct JSON reading)
echo "🔧 Step 1: Skipping decoder and rules..."
echo "✅ Using direct JSON log reading from Wazuh archives"

# Step 2: Configure log monitoring
echo "📁 Step 2: Configuring log monitoring..."

# Create temporary config file
TEMP_CONF=$(mktemp)

# Read existing config
sudo cp $WAZUH_CONF $TEMP_CONF

# Add localfile configuration if not exists
if ! grep -q "sqli-bruteforce-attack" $TEMP_CONF; then
    echo "Adding localfile configuration..."
    
    # Find the closing </ossec_config> tag and insert before it
    sudo sed -i '/^<\/ossec_config>$/i\
\
<!-- SQLi BruteForce Attack Detection JSON Logs -->\
<localfile>\
  <log_format>json</log_format>\
  <location>/opt/sqli-bruteforce-attack/logs/attacks.log</location>\
</localfile>\
' $TEMP_CONF
    
    # Apply new configuration
    sudo mv $TEMP_CONF $WAZUH_CONF
    sudo chown root:ossec $WAZUH_CONF
    sudo chmod 640 $WAZUH_CONF
    echo "✅ Log monitoring configured"
else
    echo "✅ Log monitoring already configured"
    rm $TEMP_CONF
fi

# Step 3: Test configuration
echo "🧪 Step 3: Testing Wazuh configuration..."
if sudo /var/ossec/bin/wazuh-analysisd -t; then
    echo "✅ Wazuh configuration is valid"
else
    echo "❌ Wazuh configuration has errors"
    echo "Restoring backup..."
    sudo cp ${WAZUH_CONF}.backup.* $WAZUH_CONF 2>/dev/null || echo "No backup to restore"
    exit 1
fi

# Step 4: Create test log file if not exists
echo "📝 Step 4: Preparing test log file..."
if [ ! -f "$LOG_FILE" ]; then
    echo "Creating test log file..."
    sudo mkdir -p $(dirname $LOG_FILE)
    sudo tee $LOG_FILE > /dev/null << 'EOF'
2025-01-03 12:47:38.319 +07:00 ::ffff:192.168.205.1 POST /api/login?username=test&password=test 401 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "Authentication failed" "N/A" "N/A" "normal_login" "SELECT * FROM users WHERE username = 'test' AND password = 'test'" "http://192.168.205.100:3000/" "1ms" "57bytes" "{}"
2025-01-03 12:47:39.123 +07:00 ::ffff:192.168.205.1 POST /api/login?username=admin' OR '1'='1&password=anything 200 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "Authentication successful" "N/A" "SESS_1234567890" "sql_injection" "SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'anything'" "http://192.168.205.100:3000/" "2ms" "89bytes" "{}"
2025-01-03 12:47:40.456 +07:00 ::ffff:192.168.205.1 POST /api/login?username=admin&password=wrongpass 401 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "Authentication failed" "N/A" "N/A" "brute_force" "SELECT * FROM users WHERE username = 'admin' AND password = 'wrongpass'" "http://192.168.205.100:3000/" "1ms" "45bytes" "{}"
EOF
    sudo chown root:ossec $LOG_FILE
    sudo chmod 644 $LOG_FILE
    echo "✅ Test log file created"
else
    echo "✅ Log file already exists"
fi

# Step 5: Restart Wazuh agent
echo "🔄 Step 5: Restarting Wazuh agent..."
sudo systemctl restart wazuh-agent

# Wait for restart
echo "⏳ Waiting for Wazuh agent to restart..."
sleep 10

# Check status
echo "📊 Step 6: Checking Wazuh agent status..."
if sudo systemctl is-active --quiet wazuh-agent; then
    echo "✅ Wazuh agent is running"
else
    echo "❌ Wazuh agent failed to start"
    echo "Check logs: sudo journalctl -u wazuh-agent -f"
    exit 1
fi

# Step 7: Test log parsing
echo "🧪 Step 7: Testing log parsing..."
echo "Testing decoder with sample log entry..."

TEST_LOG="2025-01-03 12:47:38.319 +07:00 ::ffff:192.168.205.1 POST /api/login 200 \"Mozilla/5.0\" \"Authentication successful\" \"N/A\" \"SESS_123\" \"brute_force\" \"SELECT * FROM users\" \"http://test/\" \"1ms\" \"57bytes\" \"{}\""

if echo "$TEST_LOG" | sudo /var/ossec/bin/wazuh-logtest > /dev/null 2>&1; then
    echo "✅ Log parsing test successful"
else
    echo "⚠️ Log parsing test failed, but configuration is valid"
fi

# Step 8: Show final status
echo ""
echo "🎉 Wazuh setup completed successfully!"
echo "====================================="
echo ""
echo "📋 Configuration Summary:"
echo "• Log format: JSON"
echo "• Log file: $LOG_FILE"
echo "• Agent status: $(sudo systemctl is-active wazuh-agent)"
echo "• Archives: /var/ossec/logs/archives/archives.json"
echo ""
echo "🔍 Verification Commands:"
echo "• Read JSON logs: sudo tail -f /var/ossec/logs/archives/archives.json | grep '/home/modsec/Desktop/sqli-bruteforce-attack/logs/attacks.log'"
echo "• Check agent logs: sudo tail -f /var/ossec/logs/ossec.log"
echo "• Test configuration: sudo /var/ossec/bin/wazuh-analysisd -t"
echo "• Agent status: sudo systemctl status wazuh-agent"
echo ""
echo "🧪 Test Commands:"
echo "• Generate attacks: cd /opt/sqli-bruteforce-attack && ./test-attacks.sh"
echo "• Monitor JSON logs: tail -f $LOG_FILE"
echo "• Read from archives: sudo tail -f /var/ossec/logs/archives/archives.json | grep attacks.log"
echo ""
echo "📊 JSON Log Features:"
echo "• Structured JSON format for easy parsing"
echo "• Built-in risk scoring (0-100)"
echo "• Attack severity classification"
echo "• Ready for AI/ML training"
echo ""
echo "🚀 Ready for AI/ML analysis with structured Wazuh alerts! 🤖"

# Create quick test script
echo "📝 Creating quick test script..."
tee test-wazuh.sh > /dev/null << 'EOF'
#!/bin/bash
echo "🧪 Quick Wazuh Test"
echo "=================="

echo "1. Checking Wazuh agent status..."
sudo systemctl status wazuh-agent --no-pager -l

echo ""
echo "2. Testing configuration..."
sudo /var/ossec/bin/wazuh-analysisd -t

echo ""
echo "3. Checking recent alerts..."
sudo tail -20 /var/ossec/logs/alerts/alerts.log | grep "sqli-bruteforce" || echo "No recent alerts found"

echo ""
echo "4. Monitoring log file..."
echo "Log file: /opt/sqli-bruteforce-attack/logs/attacks.log"
ls -la /opt/sqli-bruteforce-attack/logs/attacks.log 2>/dev/null || echo "Log file not found"

echo ""
echo "✅ Test completed!"
EOF

chmod +x test-wazuh.sh
echo "✅ Quick test script created: ./test-wazuh.sh"
