import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { MongoSecurity } from '../mongodb';
import { SecurityEvent } from '../models/SecurityEvent';
import { connectMongoose } from '../mongodb';

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Security headers middleware
export function securityHeaders(request: NextRequest): NextResponse | null {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
  
  return null;
}

// Authentication middleware
export async function authenticate(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { user: null, error: 'No token provided' };
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify session is still active
    await connectMongoose();
    const session = await import('../models/Session').then(m => m.Session);
    const activeSession = await session.findOne({
      token: decoded.sessionToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!activeSession) {
      return { user: null, error: 'Session expired or invalid' };
    }
    
    // Update last activity
    await activeSession.refresh();
    
    return { user: decoded };
  } catch (error) {
    return { user: null, error: 'Invalid token' };
  }
}

// Authorization middleware
export function authorize(roles: string[] = []) {
  return async (request: NextRequest): Promise<{ authorized: boolean; error?: string }> => {
    const { user, error } = await authenticate(request);
    
    if (error) {
      return { authorized: false, error };
    }
    
    if (roles.length > 0 && !roles.includes(user.role)) {
      return { authorized: false, error: 'Insufficient permissions' };
    }
    
    return { authorized: true };
  };
}

// Input validation middleware
export function validateInput(schema: any) {
  return (request: NextRequest): { valid: boolean; data?: any; error?: string } => {
    try {
      const body = request.json ? request.json() : {};
      const sanitizedBody = MongoSecurity.sanitizeInput(body);
      const validated = schema.parse(sanitizedBody);
      return { valid: true, data: validated };
    } catch (error) {
      return { valid: false, error: 'Invalid input data' };
    }
  };
}

// SQL Injection detection
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*(\b=\b|\bLIKE\b)/i,
    /(\bUNION\b).*(\bSELECT\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bWAITFOR\b|\bDELAY\b)/i,
    /(\bBENCHMARK\b|\bSLEEP\b)/i,
    /(\bCHAR\b|\bASCII\b|\bCHR\b)/i,
    /(\bCONCAT\b|\bSUBSTRING\b)/i,
    /(\bINFORMATION_SCHEMA\b|\bSYS\.)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// XSS detection
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

// CSRF token validation
export function validateCSRFToken(request: NextRequest): boolean {
  const csrfToken = request.headers.get('x-csrf-token') || 
                   request.cookies.get('csrf-token')?.value;
  
  if (!csrfToken) {
    return false;
  }
  
  try {
    jwt.verify(csrfToken, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// Security event logging
export async function logSecurityEvent(eventData: {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  userId?: string;
  username?: string;
  details: string;
  riskScore?: number;
  isBlocked?: boolean;
  metadata?: any;
}): Promise<void> {
  try {
    await connectMongoose();
    
    const securityEvent = new SecurityEvent({
      ...eventData,
      timestamp: new Date(),
      statusCode: 200
    });
    
    await securityEvent.save();
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// IP blacklist check
export async function isIPBlacklisted(ip: string): Promise<boolean> {
  try {
    await connectMongoose();
    
    const SecurityEvent = await import('../models/SecurityEvent').then(m => m.SecurityEvent);
    
    // Check if IP has multiple critical events in last 24 hours
    const criticalEvents = await SecurityEvent.countDocuments({
      ip,
      severity: 'critical',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    return criticalEvents >= 5; // Blacklist after 5 critical events
  } catch (error) {
    console.error('Failed to check IP blacklist:', error);
    return false;
  }
}

// Request sanitization
export function sanitizeRequest(request: NextRequest): any {
  const sanitized: any = {};
  
  // Sanitize headers
  const headers: any = {};
  request.headers.forEach((value, key) => {
    headers[key] = MongoSecurity.sanitizeInput(value);
  });
  sanitized.headers = headers;
  
  // Sanitize query parameters
  const url = new URL(request.url);
  const query: any = {};
  url.searchParams.forEach((value, key) => {
    query[key] = MongoSecurity.sanitizeInput(value);
  });
  sanitized.query = query;
  
  return sanitized;
}

// Security middleware wrapper
export function securityMiddleware(options: {
  requireAuth?: boolean;
  allowedRoles?: string[];
  rateLimit?: boolean;
  csrfProtection?: boolean;
  inputValidation?: any;
} = {}) {
  return async (request: NextRequest) => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        // Implement rate limiting logic here
        // This would typically be handled by a reverse proxy or middleware
      }
      
      // IP blacklist check
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
      
      if (await isIPBlacklisted(clientIP)) {
        await logSecurityEvent({
          eventType: 'unauthorized_access',
          severity: 'critical',
          ip: clientIP,
          userAgent: request.headers.get('user-agent') || '',
          endpoint: request.url,
          method: request.method,
          details: 'Blocked request from blacklisted IP',
          riskScore: 100,
          isBlocked: true
        });
        
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      // Authentication check
      if (options.requireAuth) {
        const { user, error } = await authenticate(request);
        if (error) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        // Authorization check
        if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
          await logSecurityEvent({
            eventType: 'unauthorized_access',
            severity: 'medium',
            ip: clientIP,
            userAgent: request.headers.get('user-agent') || '',
            endpoint: request.url,
            method: request.method,
            userId: user.id,
            username: user.username,
            details: 'Attempted access with insufficient permissions',
            riskScore: 50
          });
          
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }
      
      // CSRF protection
      if (options.csrfProtection && request.method !== 'GET') {
        if (!validateCSRFToken(request)) {
          await logSecurityEvent({
            eventType: 'csrf',
            severity: 'high',
            ip: clientIP,
            userAgent: request.headers.get('user-agent') || '',
            endpoint: request.url,
            method: request.method,
            details: 'CSRF token validation failed',
            riskScore: 80,
            isBlocked: true
          });
          
          return NextResponse.json(
            { error: 'CSRF token invalid' },
            { status: 403 }
          );
        }
      }
      
      // Input validation
      if (options.inputValidation) {
        const { valid, error } = validateInput(options.inputValidation)(request);
        if (!valid) {
          await logSecurityEvent({
            eventType: 'suspicious_activity',
            severity: 'medium',
            ip: clientIP,
            userAgent: request.headers.get('user-agent') || '',
            endpoint: request.url,
            method: request.method,
            details: `Invalid input: ${error}`,
            riskScore: 40
          });
          
          return NextResponse.json(
            { error: 'Invalid input data' },
            { status: 400 }
          );
        }
      }
      
      return null; // Continue to next middleware/handler
      
    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
