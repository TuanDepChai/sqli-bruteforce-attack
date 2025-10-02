import { NextResponse } from "next/server"
import { getAttackLogs, getAttackStats, getSecurityEvents } from "@/lib/logger"

export async function GET() {
  try {
    const logs = getAttackLogs(500)
    const stats = getAttackStats()
    const securityEvents = getSecurityEvents(100)

    return NextResponse.json({
      success: true,
      stats,
      logs,
      securityEvents,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[API Error]", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
