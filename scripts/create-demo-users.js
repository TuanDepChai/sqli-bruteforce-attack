#!/usr/bin/env node

const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-app';
const MONGODB_DB = process.env.MONGODB_DB || 'secure-app';

async function createDemoUsers() {
  console.log('🎭 Creating demo users with plain text passwords...');
  
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Demo users with plain text passwords (for SQL injection demo)
    const demoUsers = [
      { username: 'admin', email: 'admin@secure-app.com', password: 'Admin123!@#', role: 'admin' },
      { username: 'security', email: 'security@secure-app.com', password: 'Security123!@#', role: 'security_analyst' },
      { username: 'john', email: 'john@secure-app.com', password: 'John123!@#', role: 'user' },
      { username: 'sarah', email: 'sarah@secure-app.com', password: 'Sarah123!@#', role: 'user' },
      { username: 'mike', email: 'mike@secure-app.com', password: 'Mike123!@#', role: 'user' },
      { username: 'emma', email: 'emma@secure-app.com', password: 'Emma123!@#', role: 'user' },
      { username: 'alex', email: 'alex@secure-app.com', password: 'Alex123!@#', role: 'user' },
      { username: 'lisa', email: 'lisa@secure-app.com', password: 'Lisa123!@#', role: 'user' },
      { username: 'david', email: 'david@secure-app.com', password: 'David123!@#', role: 'user' },
      { username: 'test', email: 'test@secure-app.com', password: 'Test123!@#', role: 'user' }
    ];
    
    // Clear existing users and create demo users
    console.log('🗑️  Clearing existing users...');
    await db.collection('users').deleteMany({});
    
    console.log('👤 Creating demo users...');
    for (const userData of demoUsers) {
      await db.collection('users').insertOne({
        username: userData.username,
        email: userData.email,
        password: userData.password, // Plain text for demo
        role: userData.role,
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Demo user created: ${userData.username} / ${userData.password}`);
    }
    
    console.log('🎉 Demo users created successfully!');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS FOR DEMO:');
    console.log('');
    console.log('🔐 ADMIN USERS:');
    console.log('   admin / Admin123!@#');
    console.log('   security / Security123!@#');
    console.log('');
    console.log('👥 REGULAR USERS:');
    console.log('   john / John123!@#');
    console.log('   sarah / Sarah123!@#');
    console.log('   mike / Mike123!@#');
    console.log('   emma / Emma123!@#');
    console.log('   alex / Alex123!@#');
    console.log('   lisa / Lisa123!@#');
    console.log('   david / David123!@#');
    console.log('   test / Test123!@#');
    console.log('');
    console.log('⚠️  WARNING: These are plain text passwords for DEMO ONLY!');
    console.log('   In production, always use bcrypt hashed passwords.');
    
  } catch (error) {
    console.error('❌ Failed to create demo users:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run setup
if (require.main === module) {
  createDemoUsers().catch(console.error);
}

module.exports = { createDemoUsers };
