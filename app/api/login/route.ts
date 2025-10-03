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
  
  // Detect brute force based on behavioral patterns
  const currentTime = Date.now()
  const timeWindow = 5 * 60 * 1000 // 5 minutes window
  
  // Check for rapid successive requests from same IP
  const recentAttempts = db.prepare(`
    SELECT COUNT(*) as count, 
           COUNT(DISTINCT username_attempt) as unique_usernames,
           COUNT(DISTINCT password_attempt) as unique_passwords,
           MIN(timestamp) as first_attempt,
           MAX(timestamp) as last_attempt
    FROM attack_logs 
    WHERE ip_address = ? 
    AND datetime(timestamp) > datetime('now', '-5 minutes')
  `).get(ip)
  
  const rapidRequests = recentAttempts.count > 10 // More than 10 attempts in 5 minutes
  const multipleUsernames = recentAttempts.unique_usernames > 5 // Trying many usernames
  const multiplePasswords = recentAttempts.unique_passwords > 10 // Trying many passwords
  
  // Check for repeated failed attempts from same IP
  const failedAttempts = db.prepare(`
    SELECT COUNT(*) as count
    FROM attack_logs 
    WHERE ip_address = ? 
    AND success = 0
    AND datetime(timestamp) > datetime('now', '-5 minutes')
  `).get(ip).count
  
  const highFailureRate = failedAttempts > 8 // More than 8 failed attempts in 5 minutes
  
  // Check for dictionary attack patterns (same username, different passwords)
  const sameUsernameAttempts = db.prepare(`
    SELECT COUNT(DISTINCT password_attempt) as password_count
    FROM attack_logs 
    WHERE ip_address = ? 
    AND username_attempt = ?
    AND datetime(timestamp) > datetime('now', '-5 minutes')
  `).get(ip, username)
  
  const dictionaryAttack = sameUsernameAttempts.password_count > 5 // Same username, many passwords
  
  // Check for systematic password patterns
  const isCommonPassword = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'admin',
    'admin123', 'root', 'toor', 'pass', 'test', 'guest'
  ].includes(password.toLowerCase())
  
  const isShortPassword = password.length <= 6
  const isNumericPassword = /^\d+$/.test(password)
  const isCommonPattern = isCommonPassword || isShortPassword || isNumericPassword
  
  // Brute force detection based on behavioral characteristics
  const hasBruteForcePatterns = rapidRequests || 
                               multipleUsernames || 
                               multiplePasswords || 
                               highFailureRate || 
                               dictionaryAttack || 
                               isCommonPattern

  // VULNERABLE SQL QUERY - Intentionally using string concatenation
  const vulnerableQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`

  try {
    // Execute the vulnerable query
    const stmt = db.prepare(vulnerableQuery)
    const user = stmt.get()

    const responseTime = Date.now() - startTime
    const payloadSize = JSON.stringify({ username, password }).length

    // Determine attack type based on patterns detected
    let attackType = "normal_login"
    if (containsSqlInjection) {
      attackType = "sql_injection"
    } else if (hasBruteForcePatterns) {
      attackType = "brute_force"
    }

    logAttack({
      ip_address: ip,
      username_attempt: username,
      password_attempt: password,
      attack_type: attackType,
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
        bruteForceIndicators: {
          rapidRequests,
          multipleUsernames,
          multiplePasswords,
          highFailureRate,
          dictionaryAttack,
          isCommonPattern,
          recentAttemptsCount: recentAttempts.count,
          uniqueUsernames: recentAttempts.unique_usernames,
          uniquePasswords: recentAttempts.unique_passwords,
          failedAttemptsCount: failedAttempts,
          hasBruteForcePatterns
        },
        timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
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
        vulnerability: containsSqlInjection ? "SQL Injection detected and exploited!" : 
                       hasBruteForcePatterns ? "Brute force attack pattern detected!" : null,
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
