#!/bin/bash

# 🚀 SQLi BruteForce Attack - Complete Ubuntu Setup
# One script to setup everything automatically

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🚀 SQLi BruteForce Attack Setup${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

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
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. It will ask for sudo when needed."
    exit 1
fi

print_header

# Update system packages
print_status "Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common

# Install Node.js (Latest LTS)
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install MongoDB
print_status "Installing MongoDB..."
if ! command -v mongod &> /dev/null; then
    # Import MongoDB GPG key
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    
    # Create MongoDB repository
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update and install MongoDB
    sudo apt update
    sudo apt install -y mongodb-org
    
    # Start and enable MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    print_success "MongoDB installed and started"
else
    print_success "MongoDB already installed"
    sudo systemctl start mongod
fi

# Install project dependencies
print_status "Installing project dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_success "Dependencies installed"
else
    print_error "package.json not found. Please run this script from the project directory."
    exit 1
fi

# Setup MongoDB database
print_status "Setting up MongoDB database..."
if [ -f "scripts/setup-mongodb.js" ]; then
    npm run setup-db
    print_success "Database setup completed"
else
    print_warning "Database setup script not found. You may need to setup manually."
fi

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
touch logs/attacks.log
chmod 664 logs/attacks.log

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/sqli-bruteforce.service > /dev/null << EOF
[Unit]
Description=SQLi BruteForce Attack Training Platform
After=network.target mongod.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable sqli-bruteforce.service

# Create startup script
print_status "Creating startup script..."
cat > start-app.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Get LAN IP address
LAN_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LAN_IP" ]; then
    LAN_IP=$(ip route get 1 | awk '{print $7; exit}')
fi

echo "🚀 Starting SQLi BruteForce Attack Training Platform..."
echo ""
echo "📱 Access URLs:"
echo "   Local:  http://localhost:3000"
echo "   LAN:    http://$LAN_IP:3000"
echo ""
echo "🔐 Admin Dashboard:"
echo "   Local:  http://localhost:3000/admin"
echo "   LAN:    http://$LAN_IP:3000/admin"
echo ""
echo "📊 Login: admin / Admin123!@#"
echo ""
echo "💡 To access from other devices in LAN:"
echo "   Use the LAN URL: http://$LAN_IP:3000"
echo ""

# Start with host binding for LAN access
HOST=0.0.0.0 npm run dev
EOF

chmod +x start-app.sh

# Test MongoDB connection
print_status "Testing MongoDB connection..."
if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB connection successful"
else
    print_warning "MongoDB connection test failed. Please check MongoDB status."
fi

# Get LAN IP for final instructions
LAN_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LAN_IP" ]; then
    LAN_IP=$(ip route get 1 | awk '{print $7; exit}')
fi

# Final instructions
echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}📋 Next Steps:${NC}"
echo "1. Start the application:"
echo "   ${YELLOW}./start-app.sh${NC} (development mode)"
echo "   ${YELLOW}sudo systemctl start sqli-bruteforce${NC} (production service)"
echo ""
echo "2. Access the application:"
echo "   ${YELLOW}Local:  http://localhost:3000${NC}"
echo "   ${YELLOW}LAN:    http://$LAN_IP:3000${NC}"
echo "   ${YELLOW}Admin:  http://$LAN_IP:3000/admin${NC}"
echo ""
echo "3. Default credentials:"
echo "   ${YELLOW}Username: admin${NC}"
echo "   ${YELLOW}Password: Admin123!@#${NC}"
echo ""
echo "4. Monitor logs:"
echo "   ${YELLOW}tail -f logs/attacks.log${NC}"
echo "   ${YELLOW}sudo journalctl -u sqli-bruteforce -f${NC} (service logs)"
echo ""
echo -e "${CYAN}🔧 Service Management:${NC}"
echo "   Start:   ${YELLOW}sudo systemctl start sqli-bruteforce${NC}"
echo "   Stop:    ${YELLOW}sudo systemctl stop sqli-bruteforce${NC}"
echo "   Status:  ${YELLOW}sudo systemctl status sqli-bruteforce${NC}"
echo "   Restart: ${YELLOW}sudo systemctl restart sqli-bruteforce${NC}"
echo ""
echo -e "${GREEN}✅ Ready to use!${NC}"
echo ""
echo -e "${BLUE}💡 Quick Start:${NC}"
echo "   ${YELLOW}./start-app.sh${NC}"
echo ""
echo -e "${PURPLE}🌐 LAN Access:${NC}"
echo "   ${YELLOW}Other devices can access: http://$LAN_IP:3000${NC}"
echo ""