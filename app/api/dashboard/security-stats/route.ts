import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { SecurityEvent } from '@/lib/models/SecurityEvent';
import { Session } from '@/lib/models/Session';
import { User } from '@/lib/models/User';
import { authenticate, authorize } from '@/lib/security/middleware';

export async function GET(request: NextRequest) {
  try {
    await connectMongoose();
    
    // Authentication and authorization
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { authorized, error: authzError } = await authorize(['admin', 'security_analyst'])(request);
    if (authzError) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get security statistics
    const [
      totalEvents,
      recentEvents,
      criticalEvents,
      blockedEvents,
      eventsByType,
      eventsBySeverity,
      topIPs,
      topEndpoints,
      activeSessions,
      totalUsers,
      recentLogins
    ] = await Promise.all([
      // Total security events
      SecurityEvent.countDocuments(),
      
      // Events in last 24 hours
      SecurityEvent.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      
      // Critical events in last 24 hours
      SecurityEvent.countDocuments({ 
        severity: 'critical', 
        timestamp: { $gte: oneDayAgo } 
      }),
      
      // Blocked events in last 24 hours
      SecurityEvent.countDocuments({ 
        isBlocked: true, 
        timestamp: { $gte: oneDayAgo } 
      }),
      
      // Events by type (last 7 days)
      SecurityEvent.aggregate([
        { $match: { timestamp: { $gte: oneWeekAgo } } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Events by severity (last 7 days)
      SecurityEvent.aggregate([
        { $match: { timestamp: { $gte: oneWeekAgo } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Top attacking IPs (last 7 days)
      SecurityEvent.aggregate([
        { $match: { timestamp: { $gte: oneWeekAgo } } },
        { $group: { 
          _id: '$ip', 
          count: { $sum: 1 },
          criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          lastSeen: { $max: '$timestamp' }
        } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top targeted endpoints (last 7 days)
      SecurityEvent.aggregate([
        { $match: { timestamp: { $gte: oneWeekAgo } } },
        { $group: { _id: '$endpoint', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Active sessions
      Session.countDocuments({ 
        isActive: true, 
        expiresAt: { $gt: now } 
      }),
      
      // Total users
      User.countDocuments({ isActive: true }),
      
      // Recent successful logins (last 24 hours)
      SecurityEvent.countDocuments({ 
        eventType: 'login_attempt',
        severity: 'low',
        timestamp: { $gte: oneDayAgo }
      })
    ]);
    
    // Get hourly attack trends (last 24 hours)
    const hourlyTrends = await SecurityEvent.aggregate([
      { $match: { timestamp: { $gte: oneDayAgo } } },
      { $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          eventType: '$eventType'
        },
        count: { $sum: 1 }
      } },
      { $sort: { '_id.hour': 1 } }
    ]);
    
    // Get geographical distribution of attacks (if location data available)
    const geoDistribution = await SecurityEvent.aggregate([
      { $match: { 
        timestamp: { $gte: oneWeekAgo },
        'location.country': { $exists: true }
      } },
      { $group: {
        _id: '$location.country',
        count: { $sum: 1 },
        criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } }
      } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
    
    // Calculate risk scores
    const avgRiskScore = await SecurityEvent.aggregate([
      { $match: { timestamp: { $gte: oneDayAgo } } },
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
    ]);
    
    // Security health score calculation
    const securityHealthScore = Math.max(0, Math.min(100, 
      100 - (criticalEvents * 10) - (blockedEvents * 2) - (recentEvents / 10)
    ));
    
    const stats = {
      overview: {
        totalEvents,
        recentEvents,
        criticalEvents,
        blockedEvents,
        activeSessions,
        totalUsers,
        recentLogins,
        avgRiskScore: avgRiskScore[0]?.avgRisk || 0,
        securityHealthScore: Math.round(securityHealthScore)
      },
      eventsByType: eventsByType.map(item => ({
        type: item._id,
        count: item.count
      })),
      eventsBySeverity: eventsBySeverity.map(item => ({
        severity: item._id,
        count: item.count
      })),
      topIPs: topIPs.map(item => ({
        ip: item._id,
        count: item.count,
        criticalCount: item.criticalCount,
        lastSeen: item.lastSeen
      })),
      topEndpoints: topEndpoints.map(item => ({
        endpoint: item._id,
        count: item.count
      })),
      hourlyTrends: hourlyTrends.map(item => ({
        hour: item._id.hour,
        eventType: item._id.eventType,
        count: item.count
      })),
      geoDistribution: geoDistribution.map(item => ({
        country: item._id,
        count: item.count,
        criticalCount: item.criticalCount
      }))
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Security stats error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
