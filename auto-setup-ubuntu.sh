#!/bin/bash

echo "🚀 AUTO SETUP UBUNTU - MỘT LỆNH XONG TẤT CẢ"
echo "==========================================="
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use sudo when needed."
    exit 1
fi

print_status "Starting complete auto setup..."

# Step 1: Update system
print_status "Step 1/8: Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
print_success "System updated"

# Step 2: Install MongoDB
print_status "Step 2/8: Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
print_success "MongoDB installed"

# Step 3: Start MongoDB
print_status "Step 3/8: Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod
print_success "MongoDB service started"

# Step 4: Install Node.js
print_status "Step 4/8: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js $(node --version) installed"

# Step 5: Install project dependencies
print_status "Step 5/8: Installing project dependencies..."
npm install
npm install mongodb mongoose bcryptjs
print_success "Dependencies installed"

# Step 6: Generate environment keys
print_status "Step 6/8: Generating secure environment keys..."
# Generate JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# Generate NextAuth Secret
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# Create .env.local with generated keys
cat > .env.local << EOF
# Database Configuration - AUTO GENERATED
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security Configuration - AUTO GENERATED
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application Configuration - AUTO GENERATED
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Security Headers - AUTO GENERATED
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000

# AI/ML Configuration - AUTO GENERATED
AI_MODEL_PATH=/opt/ai-detection
WAZUH_LOG_PATH=/var/ossec/logs/archives/archives.json

# Email Configuration - AUTO GENERATED (can be empty)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com

# Monitoring - AUTO GENERATED
MONITORING_ENABLED=true
LOG_LEVEL=info
EOF

print_success "Environment keys generated and saved to .env.local"

# Step 7: Setup database
print_status "Step 7/8: Setting up database with collections and users..."
cat > setup-db-auto.js << 'EOF'
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/secure-app';

async function setupDatabase() {
  let client;
  try {
    console.log('🚀 Setting up database...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('secure-app');
    
    // Create collections
    await db.createCollection('users');
    await db.createCollection('securityevents');
    await db.createCollection('sessions');
    await db.createCollection('blocked_ips');
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('securityevents').createIndex({ timestamp: 1 });
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    
    // Create multiple default users
    const users = [
      {
        username: 'admin',
        email: 'admin@secure-app.com',
        password: 'Admin123!@#',
        role: 'admin',
        isActive: true,
        isVerified: true,
        description: 'System Administrator'
      },
      {
        username: 'security',
        email: 'security@secure-app.com',
        password: 'Security123!@#',
        role: 'security_analyst',
        isActive: true,
        isVerified: true,
        description: 'Security Analyst'
      },
      {
        username: 'john',
        email: 'john@secure-app.com',
        password: 'John123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - John'
      },
      {
        username: 'sarah',
        email: 'sarah@secure-app.com',
        password: 'Sarah123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - Sarah'
      },
      {
        username: 'mike',
        email: 'mike@secure-app.com',
        password: 'Mike123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - Mike'
      },
      {
        username: 'emma',
        email: 'emma@secure-app.com',
        password: 'Emma123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - Emma'
      },
      {
        username: 'alex',
        email: 'alex@secure-app.com',
        password: 'Alex123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - Alex'
      },
      {
        username: 'lisa',
        email: 'lisa@secure-app.com',
        password: 'Lisa123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - Lisa'
      },
      {
        username: 'david',
        email: 'david@secure-app.com',
        password: 'David123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Regular User - David'
      },
      {
        username: 'test',
        email: 'test@secure-app.com',
        password: 'Test123!@#',
        role: 'user',
        isActive: true,
        isVerified: true,
        description: 'Test User'
      }
    ];
    
    console.log('👥 Creating multiple users...');
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await db.collection('users').insertOne({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        loginAttempts: 0,
        twoFactorEnabled: false,
        description: user.description,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('✅ Database setup completed');
    console.log('✅ Multiple users created:');
    console.log('   🔑 ADMIN USERS:');
    console.log('   - admin / Admin123!@# (System Administrator)');
    console.log('   - security / Security123!@# (Security Analyst)');
    console.log('   👥 REGULAR USERS:');
    console.log('   - john / John123!@# (Regular User)');
    console.log('   - sarah / Sarah123!@# (Regular User)');
    console.log('   - mike / Mike123!@# (Regular User)');
    console.log('   - emma / Emma123!@# (Regular User)');
    console.log('   - alex / Alex123!@# (Regular User)');
    console.log('   - lisa / Lisa123!@# (Regular User)');
    console.log('   - david / David123!@# (Regular User)');
    console.log('   - test / Test123!@# (Test User)');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

setupDatabase();
EOF

node setup-db-auto.js
rm setup-db-auto.js
print_success "Database setup completed"

# Step 8: Final test
print_status "Step 8/8: Running final tests..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB connection test passed"
else
    print_error "MongoDB connection test failed"
    exit 1
fi

# Final summary
echo ""
echo "🎉 AUTO SETUP COMPLETED SUCCESSFULLY!"
echo "====================================="
echo ""
print_success "✅ MongoDB installed and running on port 27017"
print_success "✅ Node.js $(node --version) installed"
print_success "✅ Project dependencies installed"
print_success "✅ Environment keys generated automatically"
print_success "✅ Database 'secure-app' created with collections"
print_success "✅ Default users created"
print_success "✅ All tests passed"
echo ""
print_warning "📋 Login credentials for all users:"
echo ""
echo "   🔑 ADMIN USERS:"
echo "   - admin / Admin123!@# (System Administrator)"
echo "   - security / Security123!@# (Security Analyst)"
echo ""
echo "   👥 REGULAR USERS:"
echo "   - john / John123!@#"
echo "   - sarah / Sarah123!@#"
echo "   - mike / Mike123!@#"
echo "   - emma / Emma123!@#"
echo "   - alex / Alex123!@#"
echo "   - lisa / Lisa123!@#"
echo "   - david / David123!@#"
echo "   - test / Test123!@#"
echo ""
# Step 9: Auto-start development server
print_status "Step 9/9: Starting development server..."
print_warning "🚀 Starting web application on http://localhost:3000"
print_warning "📋 You can login with any of the users above"
echo ""
print_warning "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
