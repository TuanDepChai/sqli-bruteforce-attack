import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';
import { authenticate, logSecurityEvent } from '@/lib/security/middleware';

export async function POST(request: NextRequest) {
  try {
    await connectMongoose();
    
    const { user, error } = await authenticate(request);
    if (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Find and invalidate session
    const session = await Session.findOne({
      token: user.sessionToken,
      isActive: true
    });
    
    if (session) {
      await session.invalidate();
    }
    
    // Log logout event
    await logSecurityEvent({
      eventType: 'login_attempt',
      severity: 'low',
      ip: clientIP,
      userAgent,
      endpoint: '/api/auth/logout',
      method: 'POST',
      userId: user.userId,
      username: user.username,
      details: 'User logout',
      riskScore: 5
    });
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear cookies
    response.cookies.delete('auth-token');
    response.cookies.delete('csrf-token');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
