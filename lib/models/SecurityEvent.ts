import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityEvent extends Document {
  eventType?: 'login_attempt' | 'sql_injection' | 'brute_force' | 'xss' | 'csrf' | 'unauthorized_access' | 'suspicious_activity' | 'security_event';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userAgent?: string;
  userId?: string;
  username?: string;
  endpoint?: string;
  method?: string;
  payload?: any;
  response?: any;
  statusCode?: number;
  timestamp: Date;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  riskScore?: number;
  isBlocked?: boolean;
  details?: string;
  metadata?: any;
  // Attack logging fields
  usernameAttempt?: string;
  passwordAttempt?: string;
  attackType?: string;
  sqlQuery?: string;
  success?: boolean;
  errorMessage?: string;
  requestMethod?: string;
  requestHeaders?: string;
  geoLocation?: string;
  deviceFingerprint?: string;
  sessionId?: string;
  referer?: string;
  responseTimeMs?: number;
  payloadSize?: number;
  additionalData?: string;
  serverResponse?: string;
  description?: string;
}

const securityEventSchema = new Schema<ISecurityEvent>({
  eventType: {
    type: String,
    enum: ['login_attempt', 'sql_injection', 'brute_force', 'xss', 'csrf', 'unauthorized_access', 'suspicious_activity', 'security_event']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String,
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
    maxlength: 200
  },
  method: {
    type: String,
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
    maxlength: 1000
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  // Attack logging fields
  usernameAttempt: String,
  passwordAttempt: String,
  attackType: String,
  sqlQuery: String,
  success: Boolean,
  errorMessage: String,
  requestMethod: String,
  requestHeaders: String,
  geoLocation: String,
  deviceFingerprint: String,
  sessionId: String,
  referer: String,
  responseTimeMs: Number,
  payloadSize: Number,
  additionalData: String,
  serverResponse: String,
  description: String
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

// Named export
export { SecurityEvent };

// Default export for compatibility
export default SecurityEvent;
