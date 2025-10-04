#!/bin/bash

# 🚀 SQLi BruteForce Attack - Ubuntu Setup Script
# Professional Security Training Platform Setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_warning "Node.js already installed: $NODE_VERSION"
        return
    fi
    
    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    if command_exists node; then
        print_success "Node.js installed successfully: $(node --version)"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
}

# Function to install MongoDB
install_mongodb() {
    print_status "Installing MongoDB..."
    
    if command_exists mongod; then
        print_warning "MongoDB already installed"
        return
    fi
    
    # Import MongoDB public GPG key
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    
    # Create MongoDB list file
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package database
    sudo apt-get update
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
    # Start MongoDB service
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Verify installation
    if command_exists mongod; then
        print_success "MongoDB installed successfully"
    else
        print_error "Failed to install MongoDB"
        exit 1
    fi
}

# Function to install Git
install_git() {
    print_status "Installing Git..."
    
    if command_exists git; then
        print_warning "Git already installed: $(git --version)"
        return
    fi
    
    sudo apt-get update
    sudo apt-get install -y git
    
    if command_exists git; then
        print_success "Git installed successfully: $(git --version)"
    else
        print_error "Failed to install Git"
        exit 1
    fi
}

# Function to install curl and wget
install_basic_tools() {
    print_status "Installing basic tools..."
    
    sudo apt-get update
    sudo apt-get install -y curl wget build-essential
    
    print_success "Basic tools installed successfully"
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository..."
    
    if [ -d "sqli-bruteforce-attack" ]; then
        print_warning "Repository already exists, updating..."
        cd sqli-bruteforce-attack
        git pull origin main
    else
        git clone https://github.com/TuanDepChai/sqli-bruteforce-attack.git
        cd sqli-bruteforce-attack
    fi
    
    print_success "Repository ready"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    npm install
    
    print_success "Dependencies installed successfully"
}

# Function to setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB database..."
    
    # Run MongoDB setup script
    npm run setup-db
    
    print_success "MongoDB database setup completed"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Application Configuration
NODE_ENV=production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Security Configuration
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/attacks.log
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Function to create logs directory
create_logs_directory() {
    print_status "Creating logs directory..."
    
    mkdir -p logs
    touch logs/attacks.log
    
    print_success "Logs directory created"
}

# Function to setup systemd service
setup_service() {
    print_status "Setting up systemd service..."
    
    # Get current user and working directory
    CURRENT_USER=$(whoami)
    CURRENT_DIR=$(pwd)
    
    # Create systemd service file
    sudo tee /etc/systemd/system/sqli-bruteforce.service > /dev/null << EOF
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

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable sqli-bruteforce.service
    
    print_success "Systemd service created and enabled"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start MongoDB if not running
    sudo systemctl start mongod
    
    # Build the application
    npm run build
    
    # Create a simple start script
    cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm run dev
EOF
    chmod +x start.sh
    
    print_success "Services started successfully"
}

# Function to show final instructions
show_final_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Start the application:"
    echo "   ${YELLOW}./start.sh${NC} (recommended)"
    echo "   ${YELLOW}npm run dev${NC} (for development)"
    echo "   ${YELLOW}npm start${NC} (for production)"
    echo ""
    echo "2. Access the application:"
    echo "   ${YELLOW}http://localhost:3000${NC}"
    echo ""
    echo "3. Admin dashboard:"
    echo "   ${YELLOW}http://localhost:3000/admin${NC}"
    echo ""
    echo "4. Default credentials:"
    echo "   ${YELLOW}Username: admin${NC}"
    echo "   ${YELLOW}Password: Admin123!@#${NC}"
    echo ""
    echo "5. Monitor logs:"
    echo "   ${YELLOW}npm run logs${NC}"
    echo ""
    echo -e "${BLUE}🔧 Service Management:${NC}"
    echo "   Start:   ${YELLOW}sudo systemctl start sqli-bruteforce${NC}"
    echo "   Stop:    ${YELLOW}sudo systemctl stop sqli-bruteforce${NC}"
    echo "   Status:  ${YELLOW}sudo systemctl status sqli-bruteforce${NC}"
    echo "   Logs:    ${YELLOW}sudo journalctl -u sqli-bruteforce -f${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready to use!${NC}"
}

# Main installation function
main() {
    echo -e "${GREEN}🚀 SQLi BruteForce Attack - Ubuntu Setup${NC}"
    echo -e "${BLUE}Professional Security Training Platform${NC}"
    echo ""
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root"
        exit 1
    fi
    
    # Update system packages
    print_status "Updating system packages..."
    sudo apt-get update
    
    # Install basic tools
    install_basic_tools
    
    # Install Git
    install_git
    
    # Install Node.js
    install_nodejs
    
    # Install MongoDB
    install_mongodb
    
    # Clone repository
    clone_repository
    
    # Install dependencies
    install_dependencies
    
    # Create environment file
    create_env_file
    
    # Create logs directory
    create_logs_directory
    
    # Setup MongoDB
    setup_mongodb
    
    # Setup systemd service
    setup_service
    
    # Start services
    start_services
    
    # Show final instructions
    show_final_instructions
}

# Run main function
main "$@"
