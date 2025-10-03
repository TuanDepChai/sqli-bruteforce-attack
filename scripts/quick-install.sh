#!/bin/bash

# Quick Ubuntu Installation Script
# Usage: curl -sSL https://raw.githubusercontent.com/TuanDepChai/sqli-bruteforce-attack/main/scripts/quick-install.sh | bash

echo "🚀 Quick Installation for SQLi BruteForce Attack Detection..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3 git

# Install pnpm
npm install -g pnpm

# Clone and setup project
cd /opt
sudo git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
sudo chown -R $USER:$USER sqli-bruteforce-attack
cd sqli-bruteforce-attack

# Install dependencies
pnpm install
npm rebuild better-sqlite3

# Create logs directory
mkdir -p logs
chmod 755 logs

# Test database creation
node -e "require('./lib/db').getDatabase(); console.log('✅ Database created!')"

# Build application
pnpm build

# Create systemd service
sudo tee /etc/systemd/system/sqli-bruteforce.service << EOF
[Unit]
Description=SQLi BruteForce Attack Detection Web
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/sqli-bruteforce-attack
ExecStart=/usr/bin/node /opt/sqli-bruteforce-attack/node_modules/.bin/next start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Start service
sudo systemctl daemon-reload
sudo systemctl enable sqli-bruteforce
sudo systemctl start sqli-bruteforce

# Create test script
tee test-attacks.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing SQLi BruteForce Attack Detection..."

# Test normal login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -s -o /dev/null -w "Normal login: %{http_code}\n"

# Test SQL injection
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}' \
  -s -o /dev/null -w "SQL injection: %{http_code}\n"

echo "✅ Tests completed!"
echo "📝 Check logs: tail -f logs/attacks.log"
EOF

chmod +x test-attacks.sh

echo ""
echo "🎉 Installation completed!"
echo "🌐 Web App: http://localhost:3000"
echo "🧪 Test: ./test-attacks.sh"
echo "📝 Logs: tail -f logs/attacks.log"
echo ""
echo "🛡️ For Wazuh configuration:"
echo "sudo nano /var/ossec/etc/ossec.conf"
echo "Add: <localfile><log_format>syslog</log_format><location>$(pwd)/logs/attacks.log</location></localfile>"
echo "sudo systemctl restart wazuh-agent"
