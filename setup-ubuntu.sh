#!/bin/bash

echo "🚀 Setting up SQLi BruteForce WEB on Ubuntu..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Get GitHub repository URL
echo ""
print_header "GitHub Repository Setup"
echo "Please provide your GitHub repository URL:"
echo "Example: https://github.com/your-username/sqli-bruteforce-attack.git"
echo ""
read -p "GitHub URL: " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    print_error "GitHub URL is required!"
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Git
print_status "Installing Git..."
sudo apt install git -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Install pnpm
print_status "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
else
    print_warning "pnpm already installed: $(pnpm --version)"
fi

# Install build tools
print_status "Installing build tools..."
sudo apt-get install -y build-essential python3

# Clone repository
print_status "Cloning repository from GitHub..."
if [ -d "sqli-bruteforce-attack" ]; then
    print_warning "Directory 'sqli-bruteforce-attack' already exists. Removing..."
    rm -rf sqli-bruteforce-attack
fi

git clone "$GITHUB_URL"
if [ $? -ne 0 ]; then
    print_error "Failed to clone repository. Please check the URL and try again."
    exit 1
fi

# Navigate to project directory
cd sqli-bruteforce-attack

# Install dependencies
print_status "Installing project dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install
else
    npm install
fi

# Rebuild better-sqlite3 for Ubuntu
print_status "Rebuilding better-sqlite3 for Ubuntu..."
npm rebuild better-sqlite3

# Create logs directory if it doesn't exist
mkdir -p logs

# Set permissions
chmod +x package.json

# Install PM2 for production (optional)
echo ""
read -p "Do you want to install PM2 for production deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Configure firewall
echo ""
read -p "Do you want to open port 3000 in firewall? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Configuring firewall..."
    sudo ufw allow 3000
    sudo ufw --force enable
fi

# Test database connection
print_status "Testing database connection..."
node -e "
const { getDatabase, closeDatabase } = require('./lib/db');
try {
    const db = getDatabase();
    console.log('✅ Database connection successful!');
    closeDatabase();
} catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
}
"

print_status "Setup completed successfully!"
echo ""
echo "🎉 Ready to run the application!"
echo ""
echo "To start the development server:"
echo "  cd sqli-bruteforce-attack"
echo "  npm run dev"
echo ""
echo "To start with PM2 (if installed):"
echo "  pm2 start npm --name 'sqli-bruteforce' -- run dev"
echo ""
echo "Access the application at:"
echo "  http://localhost:3000"
echo "  http://your-ubuntu-ip:3000 (if firewall configured)"
echo ""
echo "Admin dashboard:"
echo "  http://localhost:3000/admin"
echo ""
echo "📝 Check the logs directory for attack logs!"
echo ""
echo "🕐 Timestamps are set to Vietnam timezone (UTC+7)"
