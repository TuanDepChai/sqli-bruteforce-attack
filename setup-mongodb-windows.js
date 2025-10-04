#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-app';
const MONGODB_DB = process.env.MONGODB_DB || 'secure-app';

console.log('🚀 Setting up MongoDB for Windows...');
console.log('📋 Configuration:');
console.log(`   MongoDB URI: ${MONGODB_URI}`);
console.log(`   Database: ${MONGODB_DB}`);
console.log('');

async function setupDatabase() {
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db(MONGODB_DB);
    
    // Test connection
    await db.admin().ping();
    console.log('✅ Database ping successful!');
    
    // Create collections
    console.log('📊 Creating collections...');
    
    // Users collection
    await db.createCollection('users');
    console.log('✅ Users collection created');
    
    // Security events collection
    await db.createCollection('securityevents');
    console.log('✅ Security events collection created');
    
    // Sessions collection
    await db.createCollection('sessions');
    console.log('✅ Sessions collection created');
    
    // Blocked IPs collection
    await db.createCollection('blocked_ips');
    console.log('✅ Blocked IPs collection created');
    
    // Create indexes for performance
    console.log('📈 Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 });
    console.log('✅ Users indexes created');
    
    // Security events indexes
    await db.collection('securityevents').createIndex({ timestamp: 1 });
    await db.collection('securityevents').createIndex({ ip: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ eventType: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ severity: 1, timestamp: 1 });
    console.log('✅ Security events indexes created');
    
    // Sessions indexes
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✅ Sessions indexes created');
    
    // Create default admin user
    console.log('👤 Creating default admin user...');
    
    const adminExists = await db.collection('users').findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
      
      await db.collection('users').insertOne({
        username: 'admin',
        email: 'admin@secure-app.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: Admin123!@#');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create security analyst user
    console.log('🔍 Creating security analyst user...');
    
    const analystExists = await db.collection('users').findOne({ username: 'security' });
    if (!analystExists) {
      const hashedPassword = await bcrypt.hash('Security123!@#', 12);
      
      await db.collection('users').insertOne({
        username: 'security',
        email: 'security@secure-app.com',
        password: hashedPassword,
        role: 'security_analyst',
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Security analyst user created');
      console.log('   Username: security');
      console.log('   Password: Security123!@#');
    } else {
      console.log('ℹ️  Security analyst user already exists');
    }
    
    // Test data insertion
    console.log('🧪 Testing data insertion...');
    
    const testEvent = {
      eventType: 'login_attempt',
      severity: 'low',
      ip: '127.0.0.1',
      userAgent: 'MongoDB Setup Test',
      endpoint: '/api/test',
      method: 'POST',
      statusCode: 200,
      timestamp: new Date(),
      riskScore: 10,
      isBlocked: false,
      details: 'MongoDB setup test event'
    };
    
    await db.collection('securityevents').insertOne(testEvent);
    console.log('✅ Test data inserted successfully');
    
    console.log('');
    console.log('🎉 MongoDB setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Start MongoDB service: mongod');
    console.log('2. Run the application: npm run dev');
    console.log('3. Access: http://localhost:3000');
    console.log('4. Login with admin/Admin123!@#');
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Check if mongod service is started');
    console.log('3. Verify connection string in .env.local');
    console.log('4. Try: mongosh to test MongoDB connection');
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run setup
setupDatabase().catch(console.error);
