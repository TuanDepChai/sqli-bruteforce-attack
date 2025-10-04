#!/bin/bash

echo "🔧 FIXING MONGODB EXPORTS ON UBUNTU"
echo "===================================="
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

# Step 1: Fix lib/mongodb.ts
print_status "Step 1: Fixing lib/mongodb.ts..."
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
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      authSource: 'admin',
      // Security options
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    };

    cached.mongo.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
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
    ssl: process.env.NODE_ENV === 'production',
    sslValidate: process.env.NODE_ENV === 'production',
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
print_success "lib/mongodb.ts fixed"

# Step 2: Fix lib/models/User.ts
print_status "Step 2: Fixing lib/models/User.ts..."
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
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(password: string) {
        // Password must contain at least one uppercase, lowercase, number, and special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    }
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

// Indexes for security
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
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

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export const User = mongoose.model<IUser>('User', userSchema);

// Default export for compatibility
export default User;
EOF
print_success "lib/models/User.ts fixed"

# Step 3: Fix lib/models/SecurityEvent.ts
print_status "Step 3: Fixing lib/models/SecurityEvent.ts..."
cat > lib/models/SecurityEvent.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityEvent extends Document {
  eventType: 'login_attempt' | 'sql_injection' | 'brute_force' | 'xss' | 'csrf' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  userId?: string;
  username?: string;
  endpoint: string;
  method: string;
  payload?: any;
  response?: any;
  statusCode: number;
  timestamp: Date;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  riskScore: number;
  isBlocked: boolean;
  details: string;
  metadata?: any;
}

const securityEventSchema = new Schema<ISecurityEvent>({
  eventType: {
    type: String,
    required: true,
    enum: ['login_attempt', 'sql_injection', 'brute_force', 'xss', 'csrf', 'unauthorized_access', 'suspicious_activity']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  ip: {
    type: String,
    required: true,
    match: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  },
  userAgent: {
    type: String,
    required: true,
    maxlength: 500
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    trim: true
  },
  endpoint: {
    type: String,
    required: true,
    maxlength: 200
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
  },
  payload: {
    type: Schema.Types.Mixed
  },
  response: {
    type: Schema.Types.Mixed
  },
  statusCode: {
    type: Number,
    required: true,
    min: 100,
    max: 599
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  details: {
    type: String,
    required: true,
    maxlength: 1000
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
securityEventSchema.index({ eventType: 1, timestamp: -1 });
securityEventSchema.index({ ip: 1, timestamp: -1 });
securityEventSchema.index({ severity: 1, timestamp: -1 });
securityEventSchema.index({ userId: 1, timestamp: -1 });
securityEventSchema.index({ riskScore: -1, timestamp: -1 });
securityEventSchema.index({ isBlocked: 1, timestamp: -1 });

// TTL index to automatically delete old events after 90 days
securityEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const SecurityEvent = mongoose.model<ISecurityEvent>('SecurityEvent', securityEventSchema);

// Default export for compatibility
export default SecurityEvent;
EOF
print_success "lib/models/SecurityEvent.ts fixed"

# Step 4: Fix lib/models/Session.ts
print_status "Step 4: Fixing lib/models/Session.ts..."
cat > lib/models/Session.ts << 'EOF'
import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface ISession extends Document {
  token: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  refreshToken?: string;
  refreshExpiresAt?: Date;
}

const sessionSchema = new Schema<ISession>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true,
    match: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  },
  userAgent: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true
  },
  refreshExpiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
});

// Indexes for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ lastActivity: 1 });

// Static method to create a new session
sessionSchema.statics.createSession = async function(userId: string, ip: string, userAgent: string, deviceInfo?: any, location?: any) {
  const token = crypto.randomBytes(32).toString('hex');
  const refreshToken = crypto.randomBytes(32).toString('hex');
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const session = new this({
    token,
    userId,
    ip,
    userAgent,
    expiresAt,
    refreshExpiresAt,
    refreshToken,
    deviceInfo,
    location
  });
  
  return session.save();
};

// Method to refresh session
sessionSchema.methods.refresh = async function() {
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend by 24 hours
  return this.save();
};

// Method to invalidate session
sessionSchema.methods.invalidate = async function() {
  this.isActive = false;
  return this.save();
};

export const Session = mongoose.model<ISession>('Session', sessionSchema);

// Default export for compatibility
export default Session;
EOF
print_success "lib/models/Session.ts fixed"

# Step 5: Fix lib/db.ts
print_status "Step 5: Fixing lib/db.ts..."
cat > lib/db.ts << 'EOF'
// MongoDB Database Connection
// This file is now replaced by lib/mongodb.ts
// All database operations should use MongoDB models from lib/models/

export { default as dbConnect } from './mongodb'
export { default as User } from './models/User'
export { default as SecurityEvent } from './models/SecurityEvent'
export { default as Session } from './models/Session'

// Legacy compatibility - redirect to MongoDB
export function getDatabase() {
  console.warn('⚠️  getDatabase() is deprecated. Use MongoDB models instead.')
  return null
}

export function closeDatabase() {
  console.warn('⚠️  closeDatabase() is deprecated. MongoDB handles connections automatically.')
}
EOF
print_success "lib/db.ts fixed"

print_success "All MongoDB export issues fixed!"
echo ""
print_warning "Now restart the server with:"
echo "npm run dev"
echo ""
