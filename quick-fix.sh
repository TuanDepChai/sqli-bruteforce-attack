#!/bin/bash

echo "🔧 QUICK FIX FOR UBUNTU"
echo "========================"
echo ""

# Fix lib/models/User.ts
echo "Fixing User model exports..."
cat > lib/models/User.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'security_analyst';
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isAccountLocked(): boolean;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'security_analyst'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  twoFactorSecret: {
    type: String
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.twoFactorSecret;
      delete ret.__v;
      return ret;
    }
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Check if model already exists
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Named export
export { User };

// Default export for compatibility
export default User;
EOF

# Fix lib/mongodb.ts
echo "Fixing MongoDB connection..."
cat > lib/mongodb.ts << 'EOF'
import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-app';
const MONGODB_DB = process.env.MONGODB_DB || 'secure-app';

// Connection pool
let cached = global as any;

if (!cached.mongo) {
  cached.mongo = { conn: null, promise: null };
}

// MongoDB client connection with security
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.mongo.conn) {
    return cached.mongo.conn;
  }

  if (!cached.mongo.promise) {
    cached.mongo.promise = MongoClient.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      authSource: 'admin',
    }).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  }

  cached.mongo.conn = await cached.mongo.promise;
  return cached.mongo.conn;
}

// Mongoose connection for models
export async function connectMongoose(): Promise<void> {
  if (mongoose.connections[0].readyState) {
    return;
  }

  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    authSource: 'admin',
  });
}

// Security middleware for MongoDB operations
export class MongoSecurity {
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove potential injection patterns
      return input.replace(/[${}]/g, '');
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }

  static validateObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Database indexes for security
export async function createSecurityIndexes(db: Db): Promise<void> {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 });
    await db.collection('users').createIndex({ lastLogin: 1 });
    
    // Security events indexes
    await db.collection('security_events').createIndex({ timestamp: 1 });
    await db.collection('security_events').createIndex({ ip: 1, timestamp: 1 });
    await db.collection('security_events').createIndex({ eventType: 1, timestamp: 1 });
    await db.collection('security_events').createIndex({ userId: 1, timestamp: 1 });
    
    // Login attempts indexes
    await db.collection('login_attempts').createIndex({ ip: 1, timestamp: 1 });
    await db.collection('login_attempts').createIndex({ username: 1, timestamp: 1 });
    await db.collection('login_attempts').createIndex({ success: 1, timestamp: 1 });
    
    // Sessions indexes
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    console.log('✅ Security indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating security indexes:', error);
  }
}

// Default export for compatibility
export default connectMongoose
EOF

echo "✅ All fixes applied!"
echo ""
echo "Now restart the server with:"
echo "npm run dev"
