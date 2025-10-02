import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"
import { logAttack } from "@/lib/logger"

// INTENTIONALLY VULNERABLE - FOR EDUCATIONAL PURPOSES ONLY
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const { username, password } = await request.json()
  const db = getDatabase()

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const referer = request.headers.get("referer") || "direct"
  const requestHeaders = JSON.stringify({
    "content-type": request.headers.get("content-type"),
    accept: request.headers.get("accept"),
    "accept-language": request.headers.get("accept-language"),
  })

  const sqlInjectionPatterns = [
    /'/i,
    /--/i,
    /;/i,
    /union/i,
    /select/i,
    /drop/i,
    /insert/i,
    /update/i,
    /delete/i,
    /or\s+1\s*=\s*1/i,
    /'\s*or\s*'1'\s*=\s*'1/i,
    /admin'\s*--/i,
    /'\s*or\s*1=1/i,
    /'\s*or\s*'a'='a/i,
  ]

  const containsSqlInjection = sqlInjectionPatterns.some((pattern) => pattern.test(username) || pattern.test(password))

  // VULNERABLE SQL QUERY - Intentionally using string concatenation
  const vulnerableQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`

  try {
    // Execute the vulnerable query
    const stmt = db.prepare(vulnerableQuery)
    const user = stmt.get()

    const responseTime = Date.now() - startTime
    const payloadSize = JSON.stringify({ username, password }).length

    logAttack({
      ip_address: ip,
      username_attempt: username,
      password_attempt: password,
      attack_type: containsSqlInjection ? "sql_injection" : "normal_login",
      sql_query: vulnerableQuery,
      success: !!user,
      user_agent: userAgent,
      request_method: "POST",
      request_headers: requestHeaders,
      referer: referer,
      response_time_ms: responseTime,
      payload_size: payloadSize,
      additional_data: JSON.stringify({
        detectedPatterns: sqlInjectionPatterns
          .filter((p) => p.test(username) || p.test(password))
          .map((p) => p.toString()),
        timestamp: new Date().toISOString(),
      }),
    })

    if (user) {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: (user as any).id,
          username: (user as any).username,
          email: (user as any).email,
          role: (user as any).role,
        },
        vulnerability: containsSqlInjection ? "SQL Injection detected and exploited!" : null,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime

    logAttack({
      ip_address: ip,
      username_attempt: username,
      password_attempt: password,
      attack_type: "sql_injection",
      sql_query: vulnerableQuery,
      success: false,
      error_message: error.message,
      user_agent: userAgent,
      request_method: "POST",
      request_headers: requestHeaders,
      response_time_ms: responseTime,
    })

    return NextResponse.json(
      {
        success: false,
        message: "Database error",
        error: error.message,
        query: vulnerableQuery,
      },
      { status: 500 },
    )
  }
}
