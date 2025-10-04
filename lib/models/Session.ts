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

// Check if model already exists
const Session = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);

// Named export
export { Session };

// Default export for compatibility
export default Session;
