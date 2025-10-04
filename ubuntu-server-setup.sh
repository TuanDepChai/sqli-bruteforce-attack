#!/bin/bash

# 🖥️ Ubuntu Server Setup Script
# For headless server deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🖥️ Ubuntu Server Setup - SQLi BruteForce Attack Training Platform${NC}"
echo ""

# Function to install required packages
install_packages() {
    echo -e "${BLUE}📦 Installing required packages...${NC}"
    
    sudo apt-get update
    sudo apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        nginx \
        ufw \
        certbot \
        python3-certbot-nginx
}

# Function to install Node.js
install_nodejs() {
    echo -e "${BLUE}📦 Installing Node.js...${NC}"
    
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
}

# Function to install MongoDB
install_mongodb() {
    echo -e "${BLUE}📦 Installing MongoDB...${NC}"
    
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    sudo systemctl start mongod
    sudo systemctl enable mongod
}

# Function to setup application
setup_application() {
    echo -e "${BLUE}🔧 Setting up application...${NC}"
    
    # Clone repository
    if [ ! -d "sqli-bruteforce-attack" ]; then
        git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
    fi
    
    cd sqli-bruteforce-attack
    
    # Install dependencies
    npm install
    
    # Create environment file
    cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app
NODE_ENV=production
NEXTAUTH_URL=http://$(curl -s ifconfig.me)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
LOG_LEVEL=info
LOG_FILE=logs/attacks.log
EOF

    # Setup database
    npm run setup-db
    
    # Build application
    npm run build
}

# Function to setup Nginx
setup_nginx() {
    echo -e "${BLUE}🌐 Setting up Nginx...${NC}"
    
    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me)
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/sqli-bruteforce << EOF
server {
    listen 80;
    server_name $SERVER_IP;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable site
    sudo ln -s /etc/nginx/sites-available/sqli-bruteforce /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
}

# Function to setup systemd service
setup_systemd() {
    echo -e "${BLUE}⚙️ Setting up systemd service...${NC}"
    
    CURRENT_USER=$(whoami)
    CURRENT_DIR=$(pwd)
    
    sudo tee /etc/systemd/system/sqli-bruteforce.service << EOF
[Unit]
Description=SQLi BruteForce Attack Training Platform
After=network.target mongod.service

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable sqli-bruteforce.service
}

# Function to setup firewall
setup_firewall() {
    echo -e "${BLUE}🔥 Setting up firewall...${NC}"
    
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 3000
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    sudo systemctl start sqli-bruteforce.service
    sudo systemctl start nginx
}

# Function to show final information
show_final_info() {
    SERVER_IP=$(curl -s ifconfig.me)
    
    echo ""
    echo -e "${GREEN}🎉 Server setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Access Information:${NC}"
    echo "   URL: ${YELLOW}http://$SERVER_IP${NC}"
    echo "   Admin: ${YELLOW}http://$SERVER_IP/admin${NC}"
    echo ""
    echo -e "${BLUE}🔑 Default Credentials:${NC}"
    echo "   Username: ${YELLOW}admin${NC}"
    echo "   Password: ${YELLOW}Admin123!@#${NC}"
    echo ""
    echo -e "${BLUE}🔧 Service Management:${NC}"
    echo "   Status:  ${YELLOW}sudo systemctl status sqli-bruteforce${NC}"
    echo "   Logs:    ${YELLOW}sudo journalctl -u sqli-bruteforce -f${NC}"
    echo "   Restart: ${YELLOW}sudo systemctl restart sqli-bruteforce${NC}"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo "   Application logs: ${YELLOW}tail -f logs/attacks.log${NC}"
    echo "   System logs:      ${YELLOW}sudo journalctl -u sqli-bruteforce -f${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready for production use!${NC}"
}

# Main function
main() {
    install_packages
    install_nodejs
    install_mongodb
    setup_application
    setup_nginx
    setup_systemd
    setup_firewall
    start_services
    show_final_info
}

# Run main function
main "$@"
