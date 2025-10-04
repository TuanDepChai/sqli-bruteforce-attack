import { NextRequest, NextResponse } from "next/server"
import { realTimeLogger } from "@/lib/real-time-logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const attacks = realTimeLogger.getAllLogs(limit)
    
    // Transform data for frontend
    const transformedAttacks = attacks.map((attack: any, index: number) => ({
      id: attack._id || `attack-${index}`,
      timestamp: new Date(attack.timestamp || Date.now()).toLocaleString(),
      ip: attack.ip || '192.168.1.100',
      username: attack.usernameAttempt || 'unknown',
      attackType: attack.attackType || 'unknown',
      success: attack.success || false,
      userAgent: attack.userAgent || 'Unknown Browser',
      riskScore: Math.floor(Math.random() * 100) + 1, // Random risk score for demo
    }))
    
    // Add some mock data if no real attacks
    if (transformedAttacks.length === 0) {
      const mockAttacks = [
        {
          id: 'mock-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleString(),
          ip: '192.168.205.138',
          username: 'admin',
          attackType: 'sql_injection',
          success: true,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          riskScore: 85,
        },
        {
          id: 'mock-2',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleString(),
          ip: '192.168.205.1',
          username: 'john',
          attackType: 'brute_force',
          success: false,
          userAgent: 'Python/3.9 BruteForce/1.0',
          riskScore: 92,
        },
        {
          id: 'mock-3',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleString(),
          ip: '10.0.0.50',
          username: 'admin\' OR \'1\'=\'1',
          attackType: 'sql_injection',
          success: true,
          userAgent: 'curl/7.68.0',
          riskScore: 98,
        },
        {
          id: 'mock-4',
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toLocaleString(),
          ip: '203.0.113.42',
          username: 'sarah',
          attackType: 'credential_stuffing',
          success: false,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          riskScore: 67,
        },
        {
          id: 'mock-5',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toLocaleString(),
          ip: '198.51.100.15',
          username: 'test',
          attackType: 'brute_force',
          success: false,
          userAgent: 'Hydra/9.3',
          riskScore: 89,
        },
      ]
      
      return NextResponse.json(mockAttacks)
    }
    
    return NextResponse.json(transformedAttacks)
  } catch (error) {
    console.error('Failed to fetch attacks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attack logs' },
      { status: 500 }
    )
  }
}
