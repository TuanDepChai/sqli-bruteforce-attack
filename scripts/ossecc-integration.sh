#!/bin/bash

# OSSEC Integration Script for SQLi BruteForce Attack Detection
# Web Server: 192.168.205.100
# OSSEC Server: [OSSEC_SERVER_IP]

echo "🔧 Setting up OSSEC integration for SQLi BruteForce Attack Detection..."

# Configuration
PROJECT_PATH="/opt/sqli-bruteforce-attack"
OSSEC_SERVER_IP="${OSSEC_SERVER_IP:-192.168.205.128}"  # Set this to your OSSEC server IP
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

# 9. Install and Configure OSSEC Agent
echo "🛡️ Installing OSSEC agent..."
cd /tmp
wget -q https://github.com/ossec/ossec-hids/archive/refs/tags/3.7.0.tar.gz
tar -xzf 3.7.0.tar.gz
cd ossec-hids-3.7.0

# Install OSSEC agent
sudo ./install.sh << EOF
agent
$OSSEC_SERVER_IP
y
y
y
y
EOF

# 10. Configure OSSEC Agent for Log Monitoring
echo "📝 Configuring OSSEC agent..."
sudo tee -a /var/ossec/etc/ossec.conf << EOF

<!-- SQLi BruteForce Attack Logs -->
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

# 11. Copy Custom OSSEC Rules
echo "📋 Installing custom OSSEC rules..."
sudo cp $PROJECT_PATH/ossec-decoder.xml /var/ossec/etc/decoders/ 2>/dev/null || echo "Decoder file not found, will create custom rules"
sudo cp $PROJECT_PATH/ossec-rules.xml /var/ossec/etc/rules/ 2>/dev/null || echo "Rules file not found, will create custom rules"

# 12. Create Custom OSSEC Rules
echo "📋 Creating custom OSSEC rules..."
sudo tee /var/ossec/etc/rules/sqli-bruteforce_rules.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<group name="sqli-bruteforce,">

  <!-- SQL Injection Detection -->
  <rule id="100001" level="10">
    <if_sid>1002</if_sid>
    <regex>sql_injection</regex>
    <description>SQL Injection attempt detected</description>
    <group>sql_injection,</group>
  </rule>

  <!-- SQL Injection with UNION SELECT -->
  <rule id="100002" level="12">
    <if_sid>100001</if_sid>
    <regex>UNION SELECT</regex>
    <description>SQL Injection with UNION SELECT detected</description>
    <group>sql_injection,high_severity,</group>
  </rule>

  <!-- SQL Injection with OR 1=1 -->
  <rule id="100003" level="11">
    <if_sid>100001</if_sid>
    <regex>OR 1=1</regex>
    <description>SQL Injection with OR 1=1 detected</description>
    <group>sql_injection,medium_severity,</group>
  </rule>

  <!-- Brute Force Detection -->
  <rule id="100004" level="8">
    <if_sid>1002</if_sid>
    <regex>brute_force</regex>
    <description>Brute force attack attempt detected</description>
    <group>brute_force,</group>
  </rule>

  <!-- Multiple Failed Login Attempts -->
  <rule id="100005" level="9">
    <if_sid>100004</if_sid>
    <frequency>5</frequency>
    <timeframe>300</timeframe>
    <same_source_ip />
    <description>Multiple brute force attempts from same IP</description>
    <group>brute_force,multiple_attempts,</group>
  </rule>

  <!-- Authentication Failure -->
  <rule id="100006" level="5">
    <if_sid>1002</if_sid>
    <regex>401</regex>
    <description>Authentication failed</description>
    <group>authentication_failure,</group>
  </rule>

  <!-- Database Error -->
  <rule id="100007" level="12">
    <if_sid>1002</if_sid>
    <regex>500</regex>
    <description>Database error - Potential exploitation</description>
    <group>database_error,critical,</group>
  </rule>

  <!-- Successful Authentication -->
  <rule id="100008" level="3">
    <if_sid>1002</if_sid>
    <regex>200</regex>
    <description>Successful authentication</description>
    <group>authentication_success,</group>
  </rule>

</group>
EOF

# 13. Create Custom OSSEC Decoder
echo "📋 Creating custom OSSEC decoder..."
sudo tee /var/ossec/etc/decoders/sqli-bruteforce_decoder.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<decoder name="sqli-bruteforce">
  <program_name>^sqli-bruteforce</program_name>
</decoder>

<decoder name="sqli-bruteforce-log">
  <parent>sqli-bruteforce</parent>
  <regex type="pcre2">^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [+-]\d{2}:\d{2}) (\S+) (\w+) (\S+) (\S+) (\d{3}) "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)" "([^"]*)"$</regex>
  <order>timestamp, srcip, method, uri, query_string, status_code, user_agent, message, error, session_token, attack_type, sql_query, referer, response_time, payload_size, headers</order>
  <fts>timestamp, srcip, method, uri, status_code, user_agent, message, attack_type</fts>
</decoder>
EOF

# 14. Start OSSEC Agent
echo "🛡️ Starting OSSEC agent..."
sudo /var/ossec/bin/ossec-control start

# 15. Create Test Script
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
echo "🛡️ OSSEC logs: /var/ossec/logs/alerts/alerts.log"
EOF

chmod +x $PROJECT_PATH/test-attacks.sh

# 16. Verify Installation
echo "✅ Verifying installation..."
echo "Application Status:"
sudo systemctl status sqli-bruteforce --no-pager -l

echo "OSSEC Agent Status:"
sudo /var/ossec/bin/ossec-control status

echo "Log Files:"
ls -la $PROJECT_PATH/logs/

echo "Network Status:"
sudo netstat -tlnp | grep :3000

echo "🎉 OSSEC integration completed!"
echo "🌐 Web App: http://$WEB_SERVER_IP:3000"
echo "📝 Logs: $PROJECT_PATH/logs/"
echo "🛡️ OSSEC: /var/ossec/"
echo "🧪 Test: $PROJECT_PATH/test-attacks.sh"
echo ""
echo "📋 Next steps:"
echo "1. Configure OSSEC server to accept agent from $WEB_SERVER_IP"
echo "2. Run test script: $PROJECT_PATH/test-attacks.sh"
echo "3. Check OSSEC alerts: sudo tail -f /var/ossec/logs/alerts/alerts.log"
