import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { logAttack } from "@/lib/simple-logger"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

// INTENTIONALLY VULNERABLE - FOR EDUCATIONAL PURPOSES ONLY
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const { username, password } = await request.json()
  
  try {
    await dbConnect()
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({ success: false, message: "Database connection failed" }, { status: 500 })
  }

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
  
  // Check for rapid successive requests from same IP (simplified for demo)
  const rapidRequests = false // Simplified for demo
  const multipleUsernames = false // Simplified for demo  
  const multiplePasswords = false // Simplified for demo
  const highFailureRate = false // Simplified for demo
  const dictionaryAttack = false // Simplified for demo
  
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

  // VULNERABLE QUERY - Intentionally using string concatenation for demo
  const vulnerableQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`

  try {
    // Find user by username first
    const user = await User.findOne({ username: username })
    
    // Check password (demo mode: plain text, production: bcrypt)
    const isValidPassword = user ? (
      process.env.NODE_ENV === 'production' 
        ? await user.comparePassword(password)
        : user.password === password // Demo mode - intentionally vulnerable
    ) : false

    const responseTime = Date.now() - startTime
    const payloadSize = JSON.stringify({ username, password }).length

    // Determine attack type based on patterns detected
    let attackType: "normal_login" | "sql_injection" | "brute_force" | "credential_stuffing" = "normal_login"
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
      success: isValidPassword,
      user_agent: userAgent,
      request_method: "POST",
      request_headers: requestHeaders,
      referer: referer,
      response_time_ms: responseTime,
      payload_size: payloadSize,
      status_code: 200,
      server_response: "Authentication successful",
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
            hasBruteForcePatterns
          },
        timestamp: new Date().toLocaleString("en-US", { 
          timeZone: "Asia/Ho_Chi_Minh",
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
      }),
    })

    if (user && isValidPassword) {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        vulnerability: containsSqlInjection ? "SQL Injection detected and exploited!" : 
                       hasBruteForcePatterns ? "Brute force attack pattern detected!" : null,
        mode: process.env.NODE_ENV === 'production' ? 'secure' : 'demo',
      })
    } else {
      // Log failed login attempt
      logAttack({
        ip_address: ip,
        username_attempt: username,
        password_attempt: password,
        attack_type: attackType,
        sql_query: vulnerableQuery,
        success: false,
        user_agent: userAgent,
        request_method: "POST",
        request_headers: requestHeaders,
        referer: referer,
        response_time_ms: responseTime,
        payload_size: payloadSize,
        status_code: 401,
        server_response: "Authentication failed - Invalid credentials",
        uri: "/api/login",
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
            hasBruteForcePatterns
          },
          timestamp: new Date().toLocaleString("en-US", { 
            timeZone: "Asia/Ho_Chi_Minh",
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
        }),
      })
      
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
      status_code: 500,
      server_response: "SQL syntax error - Database processing failed",
      uri: "/api/login",
      referer: request.headers.get("referer") || "N/A",
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
