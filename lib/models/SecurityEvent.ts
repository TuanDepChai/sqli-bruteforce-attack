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

// Check if model already exists
const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>('SecurityEvent', securityEventSchema);

// Default export for compatibility
export default SecurityEvent;
