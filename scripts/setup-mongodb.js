#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-app';
const MONGODB_DB = process.env.MONGODB_DB || 'secure-app';

async function setupDatabase() {
  console.log('🚀 Setting up MongoDB database...');
  
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
    
    // Create collections with validation
    console.log('📊 Creating collections...');
    
    // Users collection
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'password', 'role'],
          properties: {
            username: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_]+$'
            },
            email: {
              bsonType: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
            },
            password: {
              bsonType: 'string',
              minLength: 8
            },
            role: {
              bsonType: 'string',
              enum: ['user', 'admin', 'security_analyst']
            },
            isActive: {
              bsonType: 'bool'
            },
            isVerified: {
              bsonType: 'bool'
            },
            loginAttempts: {
              bsonType: 'int',
              minimum: 0
            }
          }
        }
      }
    });
    
    // Security events collection
    await db.createCollection('securityevents', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['eventType', 'severity', 'ip', 'userAgent', 'endpoint', 'method', 'statusCode', 'timestamp'],
          properties: {
            eventType: {
              bsonType: 'string',
              enum: ['login_attempt', 'sql_injection', 'brute_force', 'xss', 'csrf', 'unauthorized_access', 'suspicious_activity']
            },
            severity: {
              bsonType: 'string',
              enum: ['low', 'medium', 'high', 'critical']
            },
            ip: {
              bsonType: 'string',
              pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
            },
            userAgent: {
              bsonType: 'string',
              maxLength: 500
            },
            endpoint: {
              bsonType: 'string',
              maxLength: 200
            },
            method: {
              bsonType: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
            },
            statusCode: {
              bsonType: 'int',
              minimum: 100,
              maximum: 599
            },
            timestamp: {
              bsonType: 'date'
            },
            riskScore: {
              bsonType: 'number',
              minimum: 0,
              maximum: 100
            },
            isBlocked: {
              bsonType: 'bool'
            }
          }
        }
      }
    });
    
    // Sessions collection
    await db.createCollection('sessions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['token', 'userId', 'ip', 'userAgent', 'createdAt', 'expiresAt', 'isActive'],
          properties: {
            token: {
              bsonType: 'string'
            },
            userId: {
              bsonType: 'objectId'
            },
            ip: {
              bsonType: 'string',
              pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
            },
            userAgent: {
              bsonType: 'string',
              maxLength: 500
            },
            createdAt: {
              bsonType: 'date'
            },
            expiresAt: {
              bsonType: 'date'
            },
            isActive: {
              bsonType: 'bool'
            }
          }
        }
      }
    });
    
    console.log('✅ Collections created with validation');
    
    // Create indexes for performance and security
    console.log('📈 Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 });
    await db.collection('users').createIndex({ lastLogin: 1 });
    
    // Security events indexes
    await db.collection('securityevents').createIndex({ timestamp: 1 });
    await db.collection('securityevents').createIndex({ ip: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ eventType: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ userId: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ severity: 1, timestamp: 1 });
    await db.collection('securityevents').createIndex({ riskScore: -1, timestamp: -1 });
    await db.collection('securityevents').createIndex({ isBlocked: 1, timestamp: -1 });
    
    // Sessions indexes
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('sessions').createIndex({ isActive: 1 });
    await db.collection('sessions').createIndex({ lastActivity: 1 });
    
    console.log('✅ Indexes created');
    
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
      
      console.log('✅ Default admin user created (username: admin, password: Admin123!@#)');
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
      
      console.log('✅ Security analyst user created (username: security, password: Security123!@#)');
    } else {
      console.log('ℹ️  Security analyst user already exists');
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run setup
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
