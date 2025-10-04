#!/bin/bash

echo "🔄 UPDATE AND RUN SCRIPT"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[DONE]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Update from GitHub
print_status "Step 1: Updating from GitHub..."
git pull origin main
if [ $? -eq 0 ]; then
    print_success "Code updated from GitHub"
else
    print_warning "Git pull failed, continuing with current code..."
fi

# Step 2: Install dependencies if needed
print_status "Step 2: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 3: Check MongoDB
print_status "Step 3: Checking MongoDB..."
if systemctl is-active --quiet mongod; then
    print_success "MongoDB is running"
else
    print_status "Starting MongoDB..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
    print_success "MongoDB started"
fi

# Step 4: Check database
print_status "Step 4: Checking database..."
if [ -f ".env.local" ]; then
    print_success "Environment file exists"
else
    print_status "Creating environment file..."
    # Generate basic environment
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    
    cat > .env.local << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Security Headers
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000
EOF
    print_success "Environment file created"
fi

# Step 5: Start the server
print_status "Step 5: Starting web server..."
print_warning "🚀 Starting web application on http://localhost:3000"
print_warning "📋 You can login with any of these users:"
echo ""
echo "🔑 ADMIN USERS:"
echo "   - admin / Admin123!@#"
echo "   - security / Security123!@#"
echo ""
echo "👥 REGULAR USERS:"
echo "   - john / John123!@#"
echo "   - sarah / Sarah123!@#"
echo "   - mike / Mike123!@#"
echo "   - emma / Emma123!@#"
echo "   - alex / Alex123!@#"
echo "   - lisa / Lisa123!@#"
echo "   - david / David123!@#"
echo "   - test / Test123!@#"
echo ""
print_warning "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
