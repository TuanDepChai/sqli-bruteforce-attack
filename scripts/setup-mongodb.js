#!/usr/bin/env node

const { MongoClient } = require('mongodb');

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
    
    // Create collections with validation (skip if already exists)
    console.log('📊 Creating collections...');
    
    // Users collection
    try {
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
      console.log('✅ Users collection created');
    } catch (error) {
      if (error.code === 48) { // NamespaceExists
        console.log('ℹ️  Users collection already exists');
      } else {
        throw error;
      }
    }
    
    // Security events collection
    try {
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
      console.log('✅ Security events collection created');
    } catch (error) {
      if (error.code === 48) { // NamespaceExists
        console.log('ℹ️  Security events collection already exists');
      } else {
        throw error;
      }
    }
    
    // Sessions collection
    try {
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
      console.log('✅ Sessions collection created');
    } catch (error) {
      if (error.code === 48) { // NamespaceExists
        console.log('ℹ️  Sessions collection already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Collections created with validation');
    
    // Create indexes for performance and security
    console.log('📈 Creating indexes...');
    
    // Helper function to create index safely
    const createIndexSafe = async (collection, index, options = {}) => {
      try {
        await collection.createIndex(index, options);
        return true;
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`ℹ️  Index already exists: ${JSON.stringify(index)}`);
          return false;
        } else {
          throw error;
        }
      }
    };
    
    // Users indexes (skip unique indexes - handled by Mongoose schema)
    await createIndexSafe(db.collection('users'), { createdAt: 1 });
    await createIndexSafe(db.collection('users'), { lastLogin: 1 });
    
    // Security events indexes
    await createIndexSafe(db.collection('securityevents'), { timestamp: 1 });
    await createIndexSafe(db.collection('securityevents'), { ip: 1, timestamp: 1 });
    await createIndexSafe(db.collection('securityevents'), { eventType: 1, timestamp: 1 });
    await createIndexSafe(db.collection('securityevents'), { userId: 1, timestamp: 1 });
    await createIndexSafe(db.collection('securityevents'), { severity: 1, timestamp: 1 });
    await createIndexSafe(db.collection('securityevents'), { riskScore: -1, timestamp: -1 });
    await createIndexSafe(db.collection('securityevents'), { isBlocked: 1, timestamp: -1 });
    
    // Sessions indexes
    await createIndexSafe(db.collection('sessions'), { token: 1 }, { unique: true });
    await createIndexSafe(db.collection('sessions'), { userId: 1 });
    await createIndexSafe(db.collection('sessions'), { expiresAt: 1 }, { expireAfterSeconds: 0 });
    await createIndexSafe(db.collection('sessions'), { isActive: 1 });
    await createIndexSafe(db.collection('sessions'), { lastActivity: 1 });
    
    console.log('✅ Indexes created/verified');
    
    // Create default users
    console.log('👤 Creating default users...');
    
    const users = [
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
    
    // Clear existing users first
    console.log('🗑️  Clearing existing users...');
    await db.collection('users').deleteMany({});
    
    for (const userData of users) {
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
      
      console.log(`✅ User created: ${userData.username} / ${userData.password}`);
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
