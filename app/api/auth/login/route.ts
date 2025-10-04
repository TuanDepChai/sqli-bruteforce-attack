import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Session } from '@/lib/models/Session';
import { SecurityEvent } from '@/lib/models/SecurityEvent';
import { securityMiddleware, logSecurityEvent, detectSQLInjection, detectXSS } from '@/lib/security/middleware';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';

// Input validation schema
const loginSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  captcha: z.string().optional(),
  rememberMe: z.boolean().optional()
});

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

export async function POST(request: NextRequest) {
  try {
    await connectMongoose();
    
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Check rate limiting
    const now = Date.now();
    const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
    
    if (attempts.lockedUntil && attempts.lockedUntil > now) {
      await logSecurityEvent({
        eventType: 'brute_force',
        severity: 'critical',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: 'Login attempt from rate-limited IP',
        riskScore: 100,
        isBlocked: true
      });
      
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Reset counter if window has passed (15 minutes)
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      attempts.count = 0;
    }
    
    // Parse and validate request body
    const body = await request.json();
    const sanitizedBody = {
      username: body.username?.toString().trim(),
      password: body.password?.toString(),
      captcha: body.captcha?.toString(),
      rememberMe: Boolean(body.rememberMe)
    };
    
    // Validate input
    const validation = loginSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      await logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'medium',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: 'Invalid login input format',
        riskScore: 30
      });
      
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }
    
    const { username, password, rememberMe } = validation.data;
    
    // Security checks
    if (detectSQLInjection(username) || detectSQLInjection(password)) {
      await logSecurityEvent({
        eventType: 'sql_injection',
        severity: 'critical',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: `SQL injection attempt in login: ${username}`,
        riskScore: 95,
        isBlocked: true,
        metadata: { username, payload: { username, password } }
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (detectXSS(username) || detectXSS(password)) {
      await logSecurityEvent({
        eventType: 'xss',
        severity: 'critical',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: `XSS attempt in login: ${username}`,
        riskScore: 95,
        isBlocked: true,
        metadata: { username, payload: { username, password } }
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Find user
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });
    
    if (!user) {
      attempts.count++;
      attempts.lastAttempt = now;
      
      // Lock IP after 5 failed attempts
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_TIME;
      }
      
      loginAttempts.set(clientIP, attempts);
      
      await logSecurityEvent({
        eventType: 'brute_force',
        severity: 'high',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: `Failed login attempt for non-existent user: ${username}`,
        riskScore: 70,
        metadata: { username, attemptCount: attempts.count }
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      await logSecurityEvent({
        eventType: 'brute_force',
        severity: 'critical',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        userId: user._id,
        username: user.username,
        details: 'Login attempt on locked account',
        riskScore: 90,
        isBlocked: true
      });
      
      return NextResponse.json(
        { error: 'Account is temporarily locked. Please try again later.' },
        { status: 423 }
      );
    }
    
    // Check if account is active
    if (!user.isActive) {
      await logSecurityEvent({
        eventType: 'unauthorized_access',
        severity: 'high',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        userId: user._id,
        username: user.username,
        details: 'Login attempt on inactive account',
        riskScore: 80,
        isBlocked: true
      });
      
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }
    
    // Verify password
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      
      attempts.count++;
      attempts.lastAttempt = now;
      
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_TIME;
      }
      
      loginAttempts.set(clientIP, attempts);
      
      await logSecurityEvent({
        eventType: 'brute_force',
        severity: 'high',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/login',
        method: 'POST',
        userId: user._id,
        username: user.username,
        details: `Failed login attempt with incorrect password`,
        riskScore: 75,
        metadata: { attemptCount: attempts.count, userLoginAttempts: user.loginAttempts }
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Successful login
    await user.resetLoginAttempts();
    
    // Reset IP attempt counter
    loginAttempts.delete(clientIP);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpires = new Date(now + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    
    const session = await Session.createSession(
      user._id,
      clientIP,
      userAgent,
      {
        browser: extractBrowser(userAgent),
        os: extractOS(userAgent),
        device: extractDevice(userAgent)
      }
    );
    
    // Generate JWT token
    const jwtPayload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionToken: session.token,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(sessionExpires.getTime() / 1000)
    };
    
    const token = jwt.sign(jwtPayload, JWT_SECRET);
    
    // Generate CSRF token
    const csrfToken = jwt.sign(
      { type: 'csrf', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Log successful login
    await logSecurityEvent({
      eventType: 'login_attempt',
      severity: 'low',
      ip: clientIP,
      userAgent,
      endpoint: '/api/auth/login',
      method: 'POST',
      userId: user._id,
      username: user.username,
      details: 'Successful login',
      riskScore: 10
    });
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        twoFactorEnabled: user.twoFactorEnabled
      },
      session: {
        expiresAt: sessionExpires
      }
    });
    
    // Set secure cookies
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/'
    });
    
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    
    await logSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'medium',
      ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      endpoint: '/api/auth/login',
      method: 'POST',
      details: `Login error: ${error}`,
      riskScore: 50
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility functions for user agent parsing
function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function extractOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function extractDevice(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}
