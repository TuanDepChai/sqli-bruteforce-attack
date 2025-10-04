import { NextRequest } from "next/server"
import { realTimeLogger } from "@/lib/real-time-logger"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'

  try {
    let data: any = {}

    switch (type) {
      case 'stats':
        data = realTimeLogger.getRealTimeStats()
        break
      case 'logs':
        const limit = parseInt(searchParams.get('limit') || '50')
        data = realTimeLogger.getAllLogs(limit)
        break
      case 'alerts':
        data = realTimeLogger.getRealTimeAlerts()
        break
      case 'trends':
        data = realTimeLogger.getAttackTrends()
        break
      case 'top-ips':
        const stats = realTimeLogger.getRealTimeStats()
        data = stats.topIPs
        break
      case 'attack-types':
        const stats2 = realTimeLogger.getRealTimeStats()
        data = stats2.topAttackTypes
        break
      case 'hourly':
        const stats3 = realTimeLogger.getRealTimeStats()
        data = stats3.hourlyDistribution
        break
      default:
        data = {
          stats: realTimeLogger.getRealTimeStats(),
          logs: realTimeLogger.getAllLogs(20),
          alerts: realTimeLogger.getRealTimeAlerts()
        }
    }

    return new Response(JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      type
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch real-time data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Server-Sent Events for real-time updates
export async function POST(request: NextRequest) {
  const { type } = await request.json()

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Send initial data
      switch (type) {
        case 'stats':
          sendData(realTimeLogger.getRealTimeStats())
          break
        case 'alerts':
          sendData(realTimeLogger.getRealTimeAlerts())
          break
        case 'logs':
          sendData(realTimeLogger.getAllLogs(20))
          break
        default:
          sendData({
            stats: realTimeLogger.getRealTimeStats(),
            logs: realTimeLogger.getAllLogs(20),
            alerts: realTimeLogger.getRealTimeAlerts()
          })
      }

      // Set up real-time updates
      const handleUpdate = (updateData: any) => {
        sendData(updateData)
      }

      realTimeLogger.on('logUpdate', handleUpdate)

      // Cleanup on close
      request.signal?.addEventListener('abort', () => {
        realTimeLogger.off('logUpdate', handleUpdate)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
