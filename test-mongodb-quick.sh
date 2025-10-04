#!/bin/bash

echo "🧪 MONGODB QUICK TEST"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test 1: Check if MongoDB service is running
print_test "Checking MongoDB service status..."
if sudo systemctl is-active --quiet mongod; then
    print_success "MongoDB service is running"
else
    print_error "MongoDB service is not running"
    echo "Try: sudo systemctl start mongod"
    exit 1
fi

# Test 2: Check MongoDB version
print_test "Checking MongoDB version..."
if command -v mongod &> /dev/null; then
    VERSION=$(mongod --version | head -n 1)
    print_success "MongoDB installed: $VERSION"
else
    print_error "MongoDB not found"
    echo "Try: sudo apt install mongodb-org"
    exit 1
fi

# Test 3: Test MongoDB connection
print_test "Testing MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB connection successful"
else
    print_error "MongoDB connection failed"
    echo "Check logs: sudo journalctl -u mongod -f"
    exit 1
fi

# Test 4: Test database operations
print_test "Testing database operations..."
RESULT=$(mongosh --eval "
use secure-app;
db.test.insertOne({message: 'Test successful', timestamp: new Date()});
db.test.find().count();
" 2>/dev/null | tail -n 1)

if [[ "$RESULT" =~ ^[0-9]+$ ]] && [ "$RESULT" -gt 0 ]; then
    print_success "Database operations working"
else
    print_error "Database operations failed"
    exit 1
fi

# Test 5: Check port
print_test "Checking MongoDB port..."
if sudo netstat -tlnp | grep -q ":27017"; then
    print_success "MongoDB listening on port 27017"
else
    print_error "MongoDB not listening on port 27017"
    exit 1
fi

# Test 6: Check data directory
print_test "Checking data directory..."
if [ -d "/var/lib/mongodb" ]; then
    print_success "Data directory exists: /var/lib/mongodb"
else
    print_error "Data directory not found"
    exit 1
fi

# Test 7: Check log directory
print_test "Checking log directory..."
if [ -d "/var/log/mongodb" ]; then
    print_success "Log directory exists: /var/log/mongodb"
else
    print_error "Log directory not found"
    exit 1
fi

echo ""
echo "🎉 ALL TESTS PASSED!"
echo "===================="
echo ""
echo "✅ MongoDB is installed and working correctly"
echo "✅ Service is running on port 27017"
echo "✅ Database operations are working"
echo "✅ Ready for web application"
echo ""
echo "📋 MongoDB Information:"
echo "- Version: $(mongod --version | head -n 1)"
echo "- Status: $(sudo systemctl is-active mongod)"
echo "- Port: 27017"
echo "- Data: /var/lib/mongodb"
echo "- Logs: /var/log/mongodb/mongod.log"
echo ""
echo "🚀 Next steps:"
echo "1. npm run generate-keys"
echo "2. Create .env.local"
echo "3. npm run dev"
echo ""
