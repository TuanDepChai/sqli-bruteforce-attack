#!/bin/bash

echo "🐧 UBUNTU MONGODB SETUP SCRIPT"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use sudo when needed."
    exit 1
fi

print_status "Starting Ubuntu MongoDB setup..."

# Step 1: Update system
print_status "Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
print_success "System packages updated"

# Step 2: Install MongoDB
print_status "Step 2: Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
print_success "MongoDB installed"

# Step 3: Start and enable MongoDB
print_status "Step 3: Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod --no-pager -l
print_success "MongoDB service started and enabled"

# Step 4: Configure MongoDB
print_status "Step 4: Configuring MongoDB..."
sudo mkdir -p /var/log/mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb /var/lib/mongodb

# Create basic config
sudo tee /etc/mongod.conf > /dev/null <<EOF
# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF

sudo systemctl restart mongod
print_success "MongoDB configured"

# Step 5: Install Node.js
print_status "Step 5: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js $(node --version) installed"

# Step 6: Test MongoDB connection
print_status "Step 6: Testing MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB connection test passed"
else
    print_error "MongoDB connection test failed"
    exit 1
fi

# Step 7: Install project dependencies
print_status "Step 7: Installing project dependencies..."
if [ -f "package.json" ]; then
    npm install
    npm install mongodb mongoose bcryptjs
    print_success "Project dependencies installed"
else
    print_warning "package.json not found. Please run this script from project directory."
fi

# Step 8: Create environment file
print_status "Step 8: Creating environment configuration..."
if [ -f "env.example" ]; then
    cp env.example .env.local
    print_success "Environment file created (.env.local)"
else
    print_warning "env.example not found. Creating basic .env.local..."
    cat > .env.local <<EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secure-app
MONGODB_DB=secure-app

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-must-be-32-chars-minimum
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Application Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Security Headers
SECURITY_HEADERS=true
RATE_LIMITING=true
CORS_ORIGIN=http://localhost:3000
EOF
    print_success "Basic environment file created"
fi

# Step 9: Create test script
print_status "Step 9: Creating MongoDB test script..."
cat > test-mongodb-ubuntu.js <<'EOF'
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/secure-app';

async function testConnection() {
  let client;
  try {
    console.log('🔌 Testing MongoDB connection on Ubuntu...');
    
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db('secure-app');
    await db.admin().ping();
    console.log('✅ Database ping successful!');
    
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections`);
    
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Ubuntu MongoDB test'
    });
    console.log('✅ Insert test successful:', result.insertedId);
    
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Delete test successful');
    
    console.log('🎉 All tests passed! MongoDB is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testConnection();
EOF

# Step 10: Create setup script
print_status "Step 10: Creating database setup script..."
cat > setup-mongodb-ubuntu.js <<'EOF'
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/secure-app';

async function setupDatabase() {
  let client;
  try {
    console.log('🚀 Setting up MongoDB on Ubuntu...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('secure-app');
    
    // Create collections
    console.log('📊 Creating collections...');
    await db.createCollection('users');
    await db.createCollection('securityevents');
    await db.createCollection('sessions');
    await db.createCollection('blocked_ips');
    
    // Create indexes
    console.log('📈 Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('securityevents').createIndex({ timestamp: 1 });
    await db.collection('securityevents').createIndex({ ip: 1, timestamp: 1 });
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    
    // Create default users
    console.log('👤 Creating default users...');
    
    const adminPassword = await bcrypt.hash('Admin123!@#', 12);
    await db.collection('users').insertOne({
      username: 'admin',
      email: 'admin@secure-app.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const securityPassword = await bcrypt.hash('Security123!@#', 12);
    await db.collection('users').insertOne({
      username: 'security',
      email: 'security@secure-app.com',
      password: securityPassword,
      role: 'security_analyst',
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Default users created:');
    console.log('   admin / Admin123!@#');
    console.log('   security / Security123!@#');
    
    console.log('🎉 MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

setupDatabase();
EOF

# Step 11: Run tests
print_status "Step 11: Running MongoDB tests..."
if node test-mongodb-ubuntu.js; then
    print_success "MongoDB connection test passed"
else
    print_error "MongoDB connection test failed"
    exit 1
fi

# Step 12: Setup database
print_status "Step 12: Setting up database..."
if node setup-mongodb-ubuntu.js; then
    print_success "Database setup completed"
else
    print_error "Database setup failed"
    exit 1
fi

# Final summary
echo ""
echo "🎉 UBUNTU MONGODB SETUP COMPLETED!"
echo "=================================="
echo ""
print_success "MongoDB is running on port 27017"
print_success "Database 'secure-app' is ready"
print_success "Default users created:"
echo "   - admin / Admin123!@#"
echo "   - security / Security123!@#"
echo ""
print_status "Next steps:"
echo "1. Run: npm run dev"
echo "2. Access: http://localhost:3000"
echo "3. Login with: admin / Admin123!@#"
echo ""
print_status "Useful commands:"
echo "- Check MongoDB status: sudo systemctl status mongod"
echo "- View MongoDB logs: sudo tail -f /var/log/mongodb/mongod.log"
echo "- Connect to MongoDB: mongosh"
echo "- Test connection: node test-mongodb-ubuntu.js"
echo ""
print_warning "Remember to change default passwords in production!"
echo ""
