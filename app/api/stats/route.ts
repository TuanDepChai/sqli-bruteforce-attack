import { NextResponse } from "next/server"
import { getAttackStats } from "@/lib/logger"

export async function GET() {
  try {
    const stats = await getAttackStats()
    
    // Add some mock data for demo
    const mockStats = {
      total: stats.total || 247,
      sqlInjections: stats.sqlInjections || 89,
      bruteForce: stats.bruteForce || 156,
      successful: stats.successful || 23,
      blocked: stats.blocked || 224,
      today: Math.floor(Math.random() * 50) + 10, // Random today's count
    }
    
    return NextResponse.json(mockStats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
