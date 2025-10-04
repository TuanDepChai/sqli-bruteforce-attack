import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { logSecurityEvent, detectSQLInjection, detectXSS } from '@/lib/security/middleware';
import { z } from 'zod';

// Registration validation schema
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
          'Password must contain at least one uppercase letter, lowercase letter, number, and special character'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export async function POST(request: NextRequest) {
  try {
    await connectMongoose();
    
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Parse request body
    const body = await request.json();
    const sanitizedBody = {
      username: body.username?.toString().trim(),
      email: body.email?.toString().trim().toLowerCase(),
      password: body.password?.toString(),
      confirmPassword: body.confirmPassword?.toString(),
      termsAccepted: Boolean(body.termsAccepted)
    };
    
    // Validate input
    const validation = registerSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      await logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'low',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/register',
        method: 'POST',
        details: 'Invalid registration input format',
        riskScore: 20,
        metadata: { errors: validation.error.errors }
      });
      
      return NextResponse.json(
        { error: 'Invalid input format', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { username, email, password } = validation.data;
    
    // Security checks
    if (detectSQLInjection(username) || detectSQLInjection(email)) {
      await logSecurityEvent({
        eventType: 'sql_injection',
        severity: 'critical',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/register',
        method: 'POST',
        details: `SQL injection attempt in registration: ${username}`,
        riskScore: 95,
        isBlocked: true,
        metadata: { username, email }
      });
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }
    
    if (detectXSS(username) || detectXSS(email)) {
      await logSecurityEvent({
        eventType: 'xss',
        severity: 'critical',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/register',
        method: 'POST',
        details: `XSS attempt in registration: ${username}`,
        riskScore: 95,
        isBlocked: true,
        metadata: { username, email }
      });
      
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      const conflictField = existingUser.username === username ? 'username' : 'email';
      
      await logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: 'low',
        ip: clientIP,
        userAgent,
        endpoint: '/api/auth/register',
        method: 'POST',
        details: `Registration attempt with existing ${conflictField}: ${conflictField === 'username' ? username : email}`,
        riskScore: 15
      });
      
      return NextResponse.json(
        { error: `${conflictField === 'username' ? 'Username' : 'Email'} already exists` },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      role: 'user',
      isActive: true,
      isVerified: false
    });
    
    await newUser.save();
    
    // Log successful registration
    await logSecurityEvent({
      eventType: 'login_attempt',
      severity: 'low',
      ip: clientIP,
      userAgent,
      endpoint: '/api/auth/register',
      method: 'POST',
      userId: newUser._id,
      username: newUser.username,
      details: 'User registration successful',
      riskScore: 5
    });
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    await logSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'medium',
      ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      endpoint: '/api/auth/register',
      method: 'POST',
      details: `Registration error: ${error}`,
      riskScore: 50
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
