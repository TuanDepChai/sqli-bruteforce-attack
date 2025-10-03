#!/bin/bash

# Web Server Deployment Script for SQLi BruteForce Attack Detection
# Web Server: 192.168.205.100
# Wazuh Agent: Already installed

echo "🔧 Setting up Web Server for SQLi BruteForce Attack Detection with Wazuh log collection..."

# Configuration
PROJECT_PATH="/opt/sqli-bruteforce-attack"
WEB_SERVER_IP="192.168.205.100"

# 1. Install Node.js and Dependencies
echo "📦 Installing Node.js and dependencies..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3 git

# Install pnpm
npm install -g pnpm

# 2. Clone and Setup Project
echo "📥 Setting up project..."
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
sudo chown -R $USER:$USER /opt/sqli-bruteforce-attack
cd /opt/sqli-bruteforce-attack

# Install project dependencies
pnpm install
npm rebuild better-sqlite3

# 3. Build Application
echo "🔨 Building application..."
pnpm build

# 4. Create Systemd Service
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/sqli-bruteforce.service << EOF
[Unit]
Description=SQLi BruteForce Attack Detection Web
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_PATH
ExecStart=/usr/bin/node $PROJECT_PATH/node_modules/.bin/next start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# 5. Create Log Directory and Set Permissions
echo "📁 Setting up log directories..."
sudo mkdir -p /var/log/sqli-bruteforce
sudo chown -R www-data:www-data $PROJECT_PATH/logs/
sudo chown -R www-data:www-data /var/log/sqli-bruteforce
sudo chmod -R 755 $PROJECT_PATH/logs/

# 6. Configure Log Rotation
echo "🔄 Setting up log rotation..."
sudo tee /etc/logrotate.d/sqli-bruteforce << EOF
$PROJECT_PATH/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    copytruncate
}
EOF

# 7. Configure Firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 3000/tcp
sudo ufw --force enable

# 8. Start Application Service
echo "🚀 Starting application..."
sudo systemctl daemon-reload
sudo systemctl enable sqli-bruteforce
sudo systemctl start sqli-bruteforce

# 9. Configure Wazuh Agent for Log Monitoring
echo "🛡️ Configuring Wazuh agent for log monitoring..."
echo "Note: Wazuh agent is already installed. You need to configure it manually to monitor these log files:"
echo ""
echo "Log files to monitor:"
echo "  - $PROJECT_PATH/logs/attacks.log"
echo "  - $PROJECT_PATH/logs/sql_injection.log"
echo "  - $PROJECT_PATH/logs/brute_force.log"
echo "  - $PROJECT_PATH/logs/critical-attacks.log"
echo "  - $PROJECT_PATH/logs/security-events.log"
echo ""
echo "Add these to your Wazuh agent configuration:"
echo "  <localfile>"
echo "    <log_format>syslog</log_format>"
echo "    <location>$PROJECT_PATH/logs/attacks.log</location>"
echo "  </localfile>"

# 10. Create Wazuh Configuration Template
echo "📋 Creating Wazuh configuration template..."
tee $PROJECT_PATH/wazuh-agent-config.xml << EOF
<!-- Wazuh Agent Configuration for SQLi BruteForce Attack Detection -->
<!-- Add this to your Wazuh agent configuration file -->

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/attacks.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/sql_injection.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/brute_force.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/critical-attacks.log</location>
</localfile>

<localfile>
  <log_format>syslog</log_format>
  <location>$PROJECT_PATH/logs/security-events.log</location>
</localfile>
EOF

echo "✅ Wazuh configuration template created at: $PROJECT_PATH/wazuh-agent-config.xml"

# 11. Create Test Script
echo "🧪 Creating test script..."
tee $PROJECT_PATH/test-attacks.sh << EOF
#!/bin/bash
echo "🧪 Testing SQLi BruteForce Attack Detection..."

# Test 1: Normal failed login
echo "Test 1: Normal failed login"
curl -X POST http://localhost:3000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"wrongpassword"}' \\
  -s -o /dev/null -w "Status: %{http_code}\\n"

sleep 2

# Test 2: SQL Injection OR 1=1
echo "Test 2: SQL Injection OR 1=1"
curl -X POST http://localhost:3000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}' \\
  -s -o /dev/null -w "Status: %{http_code}\\n"

sleep 2

# Test 3: SQL Injection UNION SELECT
echo "Test 3: SQL Injection UNION SELECT"
curl -X POST http://localhost:3000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin'\'' UNION SELECT 1,2,3--","password":"anything"}' \\
  -s -o /dev/null -w "Status: %{http_code}\\n"

sleep 2

# Test 4: Valid login
echo "Test 4: Valid login"
curl -X POST http://localhost:3000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"admin123"}' \\
  -s -o /dev/null -w "Status: %{http_code}\\n"

echo "✅ Tests completed! Check logs:"
echo "📝 Attack logs: $PROJECT_PATH/logs/attacks.log"
echo "🛡️ Wazuh logs: Check Wazuh manager dashboard"
EOF

chmod +x $PROJECT_PATH/test-attacks.sh

# 12. Verify Installation
echo "✅ Verifying installation..."
echo "Application Status:"
sudo systemctl status sqli-bruteforce --no-pager -l

echo "Wazuh Agent Status:"
sudo systemctl status wazuh-agent --no-pager -l || echo "Wazuh agent status check failed - please check manually"

echo "Log Files:"
ls -la $PROJECT_PATH/logs/

echo "Network Status:"
sudo netstat -tlnp | grep :3000

echo "🎉 Web Server deployment completed!"
echo "🌐 Web App: http://$WEB_SERVER_IP:3000"
echo "📝 Logs: $PROJECT_PATH/logs/"
echo "🛡️ Wazuh Config: $PROJECT_PATH/wazuh-agent-config.xml"
echo "🧪 Test: $PROJECT_PATH/test-attacks.sh"
echo ""
echo "📋 Next steps:"
echo "1. Configure Wazuh agent to monitor log files"
echo "2. Copy configuration from: $PROJECT_PATH/wazuh-agent-config.xml"
echo "3. Restart Wazuh agent: sudo systemctl restart wazuh-agent"
echo "4. Run test script: $PROJECT_PATH/test-attacks.sh"
echo "5. Check Wazuh manager for incoming logs"
