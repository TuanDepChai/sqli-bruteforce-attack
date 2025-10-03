#!/bin/bash

# Configure Wazuh agent to monitor attack logs
# Usage: ./scripts/config-wazuh-agent.sh

echo "🛡️ Configuring Wazuh agent to monitor attack logs..."

# Get current directory (where logs are)
PROJECT_PATH=$(pwd)
LOG_FILE="$PROJECT_PATH/logs/attacks.log"

echo "Project path: $PROJECT_PATH"
echo "Log file: $LOG_FILE"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️ Warning: Log file $LOG_FILE does not exist yet"
    echo "Start the web application first to generate logs"
    echo "Run: npm run dev"
    exit 1
fi

echo "✅ Log file found: $LOG_FILE"

# Create Wazuh configuration snippet
echo ""
echo "📝 Add this configuration to your Wazuh agent:"
echo ""
echo "File: /var/ossec/etc/ossec.conf"
echo ""
echo "Add these lines inside the <ossec_config> section:"
echo ""
echo "<!-- SQLi BruteForce Attack Logs -->"
echo "<localfile>"
echo "  <log_format>syslog</log_format>"
echo "  <location>$LOG_FILE</location>"
echo "</localfile>"
echo ""

# Create a backup and show current config
echo "🔧 Current Wazuh agent configuration:"
if [ -f "/var/ossec/etc/ossec.conf" ]; then
    echo "✅ Wazuh agent config file found"
    
    # Check if already configured
    if grep -q "sqli-bruteforce-attack" /var/ossec/etc/ossec.conf; then
        echo "⚠️ Already configured for SQLi BruteForce logs"
    else
        echo "❌ Not configured yet"
    fi
    
    echo ""
    echo "📋 To configure manually:"
    echo "1. Edit config file: sudo nano /var/ossec/etc/ossec.conf"
    echo "2. Add the configuration above"
    echo "3. Restart Wazuh agent: sudo systemctl restart wazuh-agent"
    echo "4. Check status: sudo systemctl status wazuh-agent"
    
else
    echo "❌ Wazuh agent config file not found"
    echo "Make sure Wazuh agent is installed"
fi

echo ""
echo "🧪 To test log generation:"
echo "1. Start web app: npm run dev"
echo "2. Generate logs: ./scripts/generate-logs.sh"
echo "3. Monitor logs: tail -f $LOG_FILE"
echo "4. Check Wazuh manager for incoming logs"
