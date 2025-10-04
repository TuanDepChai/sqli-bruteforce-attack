#!/bin/bash

# Ubuntu Installation Script for SQLi BruteForce Attack Detection
# Usage: chmod +x scripts/ubuntu-install.sh && ./scripts/ubuntu-install.sh

echo "🚀 Installing SQLi BruteForce Attack Detection on Ubuntu..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="sqli-bruteforce-attack"
PROJECT_PATH="/opt/$PROJECT_NAME"
SERVICE_NAME="sqli-bruteforce"

# 1. Update system packages
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18.x
echo -e "${BLUE}📦 Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# 3. Install build tools for better-sqlite3
echo -e "${BLUE}🔧 Installing build tools...${NC}"
sudo apt-get install -y build-essential python3 git curl wget

# 4. Install pnpm globally
echo -e "${BLUE}📦 Installing pnpm...${NC}"
npm install -g pnpm
echo -e "${GREEN}✅ pnpm version: $(pnpm --version)${NC}"

# 5. Create project directory
echo -e "${BLUE}📁 Creating project directory...${NC}"
sudo mkdir -p $PROJECT_PATH
sudo chown -R $USER:$USER $PROJECT_PATH

# 6. Clone repository
echo -e "${BLUE}📥 Cloning repository...${NC}"
cd /opt
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}⚠️ Project directory already exists, updating...${NC}"
    cd $PROJECT_NAME
    git pull origin main
else
    git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
    cd $PROJECT_NAME
fi

# 7. Install project dependencies
echo -e "${BLUE}📦 Installing project dependencies...${NC}"
pnpm install

# 8. Rebuild better-sqlite3 for current environment
echo -e "${BLUE}🔧 Rebuilding better-sqlite3...${NC}"
npm rebuild better-sqlite3

# 9. Create logs directory
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs
chmod 755 logs

# 10. Test database creation
echo -e "${BLUE}🗄️ Testing database creation...${NC}"
node -e "require('./lib/mongodb'); console.log('✅ MongoDB connection ready!')"

# 11. Build application
echo -e "${BLUE}🔨 Building application...${NC}"
pnpm build

# 12. Create systemd service
echo -e "${BLUE}⚙️ Creating systemd service...${NC}"
sudo tee /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=SQLi BruteForce Attack Detection Web
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_PATH
ExecStart=/usr/bin/node $PROJECT_PATH/node_modules/.bin/next start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# 13. Configure log rotation
echo -e "${BLUE}🔄 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/$PROJECT_NAME << EOF
$PROJECT_PATH/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    copytruncate
}
EOF

# 14. Configure firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
sudo ufw allow 3000/tcp
sudo ufw --force enable

# 15. Start application service
echo -e "${BLUE}🚀 Starting application service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# 16. Create test script
echo -e "${BLUE}🧪 Creating test script...${NC}"
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

# Test 3: Valid login
echo "Test 3: Valid login"
curl -X POST http://localhost:3000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"admin123"}' \\
  -s -o /dev/null -w "Status: %{http_code}\\n"

echo "✅ Tests completed! Check logs:"
echo "📝 Attack logs: $PROJECT_PATH/logs/attacks.log"
echo "🤖 AI Analysis: Use logs/attacks.log for machine learning"
EOF

chmod +x $PROJECT_PATH/test-attacks.sh

# 17. Create Wazuh configuration helper
echo -e "${BLUE}🛡️ Creating Wazuh configuration helper...${NC}"
tee $PROJECT_PATH/config-wazuh.sh << EOF
#!/bin/bash
echo "🛡️ Wazuh Agent Configuration Helper"
echo "===================================="

LOG_FILE="$PROJECT_PATH/logs/attacks.log"
echo "Log file: \$LOG_FILE"

if [ ! -f "\$LOG_FILE" ]; then
    echo "⚠️ Warning: Log file does not exist yet"
    echo "Run test script first: ./test-attacks.sh"
    exit 1
fi

echo "✅ Log file found: \$LOG_FILE"
echo ""
echo "📝 Add this to your Wazuh agent configuration:"
echo "File: /var/ossec/etc/ossec.conf"
echo ""
echo "Add these lines inside the <ossec_config> section:"
echo ""
echo "<!-- SQLi BruteForce Attack Logs -->"
echo "<localfile>"
echo "  <log_format>syslog</log_format>"
echo "  <location>\$LOG_FILE</location>"
echo "</localfile>"
echo ""
echo "Then restart Wazuh agent:"
echo "sudo systemctl restart wazuh-agent"
EOF

chmod +x $PROJECT_PATH/config-wazuh.sh

# 18. Verify installation
echo -e "${BLUE}✅ Verifying installation...${NC}"
echo "Application Status:"
sudo systemctl status $SERVICE_NAME --no-pager -l

echo ""
echo "Log Files Status:"
ls -la $PROJECT_PATH/logs/ 2>/dev/null || echo "Log directory will be created on first attack"

echo ""
echo "Network Status:"
sudo netstat -tlnp | grep :3000

echo ""
echo "Database Status:"
if [ -f "$PROJECT_PATH/vulnerable.db" ]; then
    echo "✅ Database: $PROJECT_PATH/vulnerable.db"
    if command -v sqlite3 &> /dev/null; then
        USERS=$(sqlite3 $PROJECT_PATH/vulnerable.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        echo "✅ Users in database: $USERS"
    fi
else
    echo "❌ Database not found - will be created on first run"
fi

# 19. Final instructions
echo ""
echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "🌐 Web Application: http://localhost:3000"
echo "📝 Logs Directory: $PROJECT_PATH/logs/"
echo "🧪 Test Script: $PROJECT_PATH/test-attacks.sh"
echo "🛡️ Wazuh Config: $PROJECT_PATH/config-wazuh.sh"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Test the application: $PROJECT_PATH/test-attacks.sh"
echo "2. Configure Wazuh agent: $PROJECT_PATH/config-wazuh.sh"
echo "3. Check logs: tail -f $PROJECT_PATH/logs/attacks.log"
echo "4. Access web interface: http://localhost:3000"
echo ""
echo -e "${BLUE}🔧 Service management:${NC}"
echo "• Start: sudo systemctl start $SERVICE_NAME"
echo "• Stop: sudo systemctl stop $SERVICE_NAME"
echo "• Restart: sudo systemctl restart $SERVICE_NAME"
echo "• Status: sudo systemctl status $SERVICE_NAME"
echo "• Logs: sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo -e "${GREEN}Ready for AI/ML log analysis! 🚀🤖${NC}"
