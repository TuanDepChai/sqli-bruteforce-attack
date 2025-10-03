#!/bin/bash

# Wazuh Configuration Helper for SQLi BruteForce Attack Detection
# This script helps configure Wazuh agent to properly parse the logs

echo "🛡️ Wazuh Configuration Helper for SQLi BruteForce Attack Detection"
echo "=================================================================="

# Configuration
WAZUH_CONF="/var/ossec/etc/ossec.conf"
DECODER_FILE="wazuh-decoder.xml"
RULES_FILE="wazuh-rules.xml"
LOG_FILE="/opt/sqli-bruteforce-attack/logs/attacks.log"

echo "📋 Configuration Details:"
echo "• Wazuh Config: $WAZUH_CONF"
echo "• Decoder File: $DECODER_FILE"
echo "• Rules File: $RULES_FILE"
echo "• Log File: $LOG_FILE"
echo ""

# Check if Wazuh agent is installed
if [ ! -f "$WAZUH_CONF" ]; then
    echo "❌ Wazuh agent not found at $WAZUH_CONF"
    echo "Please install Wazuh agent first:"
    echo "curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -"
    echo "echo 'deb https://packages.wazuh.com/4.x/apt/ stable main' > /etc/apt/sources.list.d/wazuh.list"
    echo "apt update && apt install wazuh-agent"
    exit 1
fi

echo "✅ Wazuh agent found"

# Create backup of original config
echo "💾 Creating backup of Wazuh configuration..."
sudo cp $WAZUH_CONF ${WAZUH_CONF}.backup.$(date +%Y%m%d_%H%M%S)

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️ Log file not found: $LOG_FILE"
    echo "Creating test log entry..."
    mkdir -p $(dirname $LOG_FILE)
    echo "2025-01-03 12:47:38.319 +07:00 ::ffff:192.168.205.1 POST /api/login?username=test&password=test 401 \"Mozilla/5.0\" \"Authentication failed\" \"N/A\" \"N/A\" \"normal_login\" \"SELECT * FROM users WHERE username = 'test' AND password = 'test'\" \"http://192.168.205.100:3000/\" \"1ms\" \"57bytes\" \"{}\"" > $LOG_FILE
    echo "✅ Test log entry created"
fi

echo "✅ Log file found: $LOG_FILE"

# Add decoder configuration
echo "🔧 Adding decoder configuration..."
DECODER_CONFIG="
<!-- SQLi BruteForce Attack Detection Decoder -->
<decoder name=\"sqli-bruteforce\">
  <prematch>^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d{3} \\+07:00</prematch>
  <regex>^(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d{3} \\+07:00) ::ffff:(\\d+\\.\\d+\\.\\d+\\.\\d+) (\\w+) (\\S+) (\\d+) \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\"$</regex>
  <order>timestamp, srcip, method, uri, status_code, user_agent, login_message, error_message, session_token, attack_type, sql_query, referer, response_time, payload_size, request_headers</order>
</decoder>"

# Add rules configuration
echo "🛡️ Adding rules configuration..."
RULES_CONFIG="
<!-- SQLi BruteForce Attack Detection Rules -->
<rule id=\"100001\" level=\"12\">
  <decoded_as>sqli-bruteforce</decoded_as>
  <field name=\"attack_type\">sql_injection</field>
  <description>SQL Injection attack detected</description>
  <group>attack,sql_injection,</group>
</rule>

<rule id=\"100002\" level=\"10\">
  <decoded_as>sqli-bruteforce</decoded_as>
  <field name=\"attack_type\">brute_force</field>
  <description>Brute Force attack detected</description>
  <group>attack,brute_force,</group>
</rule>

<rule id=\"100003\" level=\"11\">
  <decoded_as>sqli-bruteforce</decoded_as>
  <field name=\"attack_type\">credential_stuffing</field>
  <description>Credential Stuffing attack detected</description>
  <group>attack,credential_stuffing,</group>
</rule>

<rule id=\"100004\" level=\"5\">
  <decoded_as>sqli-bruteforce</decoded_as>
  <field name=\"status_code\">401</field>
  <description>Failed login attempt</description>
  <group>authentication,failed_login,</group>
</rule>

<rule id=\"100005\" level=\"3\">
  <decoded_as>sqli-bruteforce</decoded_as>
  <field name=\"status_code\">200</field>
  <field name=\"login_message\">Authentication successful</field>
  <description>Successful authentication</description>
  <group>authentication,successful_login,</group>
</rule>"

# Create temporary files with new configuration
TEMP_CONF=$(mktemp)
echo "📝 Creating new Wazuh configuration..."

# Read original config and add new sections
sudo cp $WAZUH_CONF $TEMP_CONF

# Add localfile configuration if not exists
if ! grep -q "sqli-bruteforce-attack" $TEMP_CONF; then
    echo "📁 Adding localfile configuration..."
    # Find the closing </ossec_config> tag and insert before it
    sudo sed -i '/^<\/ossec_config>$/i\
\
<!-- SQLi BruteForce Attack Detection Logs -->\
<localfile>\
  <log_format>syslog</log_format>\
  <location>/opt/sqli-bruteforce-attack/logs/attacks.log</location>\
</localfile>\
' $TEMP_CONF
fi

# Add decoder configuration
echo "🔧 Adding decoder configuration..."
if ! grep -q "sqli-bruteforce.*decoder" $TEMP_CONF; then
    sudo sed -i '/^<\/ossec_config>$/i\
\
'"$DECODER_CONFIG"'\
' $TEMP_CONF
fi

# Add rules configuration
echo "🛡️ Adding rules configuration..."
if ! grep -q "sqli-bruteforce.*rule" $TEMP_CONF; then
    sudo sed -i '/^<\/ossec_config>$/i\
\
'"$RULES_CONFIG"'\
' $TEMP_CONF
fi

# Apply new configuration
echo "💾 Applying new configuration..."
sudo mv $TEMP_CONF $WAZUH_CONF

# Set proper permissions
sudo chown root:ossec $WAZUH_CONF
sudo chmod 640 $WAZUH_CONF

echo "✅ Configuration updated successfully!"
echo ""

# Show configuration summary
echo "📋 Configuration Summary:"
echo "• Log file monitored: $LOG_FILE"
echo "• Decoder: sqli-bruteforce"
echo "• Rules: 100001-100005 (SQLi, BruteForce, Auth)"
echo ""

# Test configuration
echo "🧪 Testing Wazuh configuration..."
if sudo /var/ossec/bin/wazuh-logtest -t; then
    echo "✅ Wazuh configuration is valid"
else
    echo "❌ Wazuh configuration has errors"
    echo "Restoring backup..."
    sudo cp ${WAZUH_CONF}.backup.* $WAZUH_CONF
    exit 1
fi

# Restart Wazuh agent
echo "🔄 Restarting Wazuh agent..."
sudo systemctl restart wazuh-agent

# Wait for restart
sleep 5

# Check status
echo "📊 Checking Wazuh agent status..."
if sudo systemctl is-active --quiet wazuh-agent; then
    echo "✅ Wazuh agent is running"
else
    echo "❌ Wazuh agent failed to start"
    echo "Check logs: sudo journalctl -u wazuh-agent -f"
    exit 1
fi

echo ""
echo "🎉 Wazuh configuration completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Generate test logs: cd /opt/sqli-bruteforce-attack && ./test-attacks.sh"
echo "2. Check Wazuh alerts: sudo tail -f /var/ossec/logs/alerts/alerts.log"
echo "3. Monitor in Wazuh dashboard"
echo ""
echo "🔍 Useful Commands:"
echo "• Check Wazuh agent status: sudo systemctl status wazuh-agent"
echo "• View alerts: sudo tail -f /var/ossec/logs/alerts/alerts.log"
echo "• Test configuration: sudo /var/ossec/bin/wazuh-logtest -t"
echo "• View agent logs: sudo tail -f /var/ossec/logs/ossec.log"
echo ""
echo "🛡️ Ready for AI/ML analysis with properly parsed logs! 🚀"

