import { NextResponse } from "next/server"
import { realTimeLogger } from "@/lib/real-time-logger"

export async function GET() {
  try {
    const stats = realTimeLogger.getRealTimeStats()
    
    return NextResponse.json({ 
      success: true, 
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
