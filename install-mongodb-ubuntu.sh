#!/bin/bash

echo "🐧 MONGODB INSTALLATION FOR UBUNTU"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use sudo when needed."
    exit 1
fi

print_status "Starting MongoDB installation..."

# Step 1: Update system
print_status "Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System updated"

# Step 2: Install dependencies
print_status "Step 2: Installing dependencies..."
sudo apt install -y wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
print_success "Dependencies installed"

# Step 3: Add MongoDB repository
print_status "Step 3: Adding MongoDB repository..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
print_success "MongoDB repository added"

# Step 4: Install MongoDB
print_status "Step 4: Installing MongoDB..."
sudo apt install -y mongodb-org
print_success "MongoDB installed"

# Step 5: Start and enable MongoDB
print_status "Step 5: Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
if sudo systemctl is-active --quiet mongod; then
    print_success "MongoDB service is running"
else
    print_error "Failed to start MongoDB service"
    exit 1
fi

# Step 6: Test MongoDB
print_status "Step 6: Testing MongoDB..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB is working correctly"
else
    print_error "MongoDB test failed"
    exit 1
fi

# Step 7: Show MongoDB info
print_status "Step 7: MongoDB Information..."
echo "MongoDB Version: $(mongod --version | head -n 1)"
echo "MongoDB Status: $(sudo systemctl is-active mongod)"
echo "MongoDB Port: 27017"
echo "MongoDB Data: /var/lib/mongodb"
echo "MongoDB Logs: /var/log/mongodb/mongod.log"

# Step 8: Create test database
print_status "Step 8: Creating test database..."
mongosh --eval "
use secure-app;
db.test.insertOne({message: 'MongoDB is working!', timestamp: new Date()});
print('Test database created successfully');
"

print_success "Test database created"

echo ""
echo "🎉 MONGODB INSTALLATION COMPLETED!"
echo "=================================="
echo ""
print_success "MongoDB is installed and running on port 27017"
print_success "Test database 'secure-app' created"
echo ""
print_status "Useful commands:"
echo "- Check status: sudo systemctl status mongod"
echo "- Start MongoDB: sudo systemctl start mongod"
echo "- Stop MongoDB: sudo systemctl stop mongod"
echo "- Restart MongoDB: sudo systemctl restart mongod"
echo "- View logs: sudo tail -f /var/log/mongodb/mongod.log"
echo "- Connect to MongoDB: mongosh"
echo ""
print_status "Next steps:"
echo "1. Run: npm run generate-keys"
echo "2. Create .env.local file"
echo "3. Run: npm run dev"
echo ""
