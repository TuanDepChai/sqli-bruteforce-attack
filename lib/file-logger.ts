import fs from "fs"
import path from "path"

const LOG_DIR = path.join(process.cwd(), "logs")
const MAX_LOG_SIZE = 10 * 1024 * 1024 // 10MB

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

interface LogEntry {
  timestamp: string
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  type: string
  data: Record<string, any>
}

function formatLogEntry(entry: LogEntry): string {
  // JSON format for easy parsing and AI training
  const timestamp = getWazuhTimestamp()
  const data = entry.data
  
  // Extract key information with fallbacks
  let ip = data.ip_address || '127.0.0.1'
  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7)
  }
  
  const username = data.username_attempt || 'N/A'
  const password = data.password_attempt || 'N/A'
  const attackType = data.attack_type || 'normal_login'
  const success = data.success
  
  // Build query string with payload for URI
  let queryString = ''
  if (username !== 'N/A') {
    queryString += `username=${encodeURIComponent(username)}`
  }
  if (password !== 'N/A') {
    queryString += `&password=${encodeURIComponent(password)}`
  }
  
  // Login result message
  let loginMessage = ''
  if (success === 'YES' || success === true) {
    loginMessage = 'Authentication successful'
  } else {
    if (attackType === 'sql_injection') {
      loginMessage = 'SQL syntax error - Malicious payload detected'
    } else if (attackType === 'brute_force') {
      loginMessage = 'Authentication failed - Brute force attempt'
    } else {
      loginMessage = 'Authentication failed - Invalid credentials'
    }
  }
  
  // Create simplified JSON log entry with only essential fields
  const logEntry = {
    timestamp: timestamp,
    method: data.request_method || 'POST',
    url: `${data.uri || '/api/login'}${queryString ? '?' + queryString : ''}`,
    username: username,
    password: password,
    ip: ip,
    success: success === 'YES' || success === true,
    user_agent: data.user_agent || 'Unknown',
    referer: data.referer || null,
    status_code: data.status_code || 200,
    query: data.sql_query || null
  }
  
  // Return JSON string with newline for file writing
  return JSON.stringify(logEntry) + '\n'
}

// Helper function to determine attack severity
function getAttackSeverity(attackType: string, success: any): string {
  if (success === 'YES' || success === true) {
    return 'critical' // Successful attacks are most severe
  }
  
  switch (attackType) {
    case 'sql_injection':
      return 'high'
    case 'brute_force':
    case 'credential_stuffing':
      return 'medium'
    default:
      return 'low'
  }
}

// Helper function to calculate risk score (0-100)
function calculateRiskScore(data: any): number {
  let score = 0
  
  // Base score for attack type
  switch (data.attack_type) {
    case 'sql_injection':
      score += 80
      break
    case 'brute_force':
      score += 60
      break
    case 'credential_stuffing':
      score += 70
      break
    default:
      score += 20
  }
  
  // Bonus for successful attacks
  if (data.success === 'YES' || data.success === true) {
    score += 20
  }
  
  // Bonus for suspicious patterns
  if (data.sql_query && data.sql_query.includes('OR')) {
    score += 10
  }
  if (data.sql_query && data.sql_query.includes('UNION')) {
    score += 15
  }
  
  // Cap at 100
  return Math.min(score, 100)
}

// Helper function to get Vietnam timezone timestamp for Wazuh
function getVietnamTimestamp() {
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
  return vietnamTime.toISOString()
}

// Helper function to get Wazuh compatible timestamp with actual +7 hours
function getWazuhTimestamp() {
  const now = new Date()
  // Add 7 hours directly
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  return vietnamTime.toISOString().replace('T', ' ').replace('Z', ' +07:00')
}

function rotateLogFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    if (stats.size > MAX_LOG_SIZE) {
      const timestamp = getVietnamTimestamp().replace(/[:.]/g, "-")
      const rotatedPath = filePath.replace(".log", `-${timestamp}.log`)
      fs.renameSync(filePath, rotatedPath)
    }
  }
}

export function writeToLogFile(filename: string, entry: LogEntry) {
  const filePath = path.join(LOG_DIR, filename)

  // Rotate if needed
  rotateLogFile(filePath)

  // Write log entry
  const logLine = formatLogEntry(entry)
  fs.appendFileSync(filePath, logLine, "utf8")
}

export function logAttackToFile(attackData: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: attackData.success ? "CRITICAL" : "WARNING",
    type: "ATTACK_ATTEMPT",
    data: {
      id: attackData.id || "N/A",
      ip_address: attackData.ip_address || "unknown",
      username_attempt: attackData.username_attempt,
      password_attempt: attackData.password_attempt,
      attack_type: attackData.attack_type,
      success: attackData.success ? "YES" : "NO",
      sql_query: attackData.sql_query || "N/A",
      error_message: attackData.error_message || "N/A",
      user_agent: attackData.user_agent || "N/A",
      request_method: attackData.request_method || "POST",
      request_headers: attackData.request_headers || "N/A",
      geo_location: attackData.geo_location || "N/A",
      device_fingerprint: attackData.device_fingerprint || "N/A",
      session_id: attackData.session_id || "N/A",
      referer: attackData.referer || "N/A",
      response_time_ms: attackData.response_time_ms || "N/A",
      payload_size: attackData.payload_size || "N/A",
      additional_data: attackData.additional_data || "N/A",
    },
  }

  // Write to main attack log
  writeToLogFile("attacks.log", entry)

  // Write to daily log
  const date = new Date().toISOString().split("T")[0]
  writeToLogFile(`attacks-${date}.log`, entry)

  // Write to type-specific log
  writeToLogFile(`${attackData.attack_type}.log`, entry)

  // If successful attack, write to critical log
  if (attackData.success) {
    writeToLogFile("critical-attacks.log", entry)
  }
}

export function logSecurityEventToFile(event: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: event.severity === "critical" ? "CRITICAL" : event.severity === "high" ? "ERROR" : "WARNING",
    type: "SECURITY_EVENT",
    data: {
      event_type: event.event_type,
      severity: event.severity,
      description: event.description,
      ip_address: event.ip_address || "N/A",
      user_id: event.user_id || "N/A",
      metadata: event.metadata || "N/A",
    },
  }

  writeToLogFile("security-events.log", entry)

  const date = new Date().toISOString().split("T")[0]
  writeToLogFile(`security-${date}.log`, entry)
}

export function logAccessToFile(accessData: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "INFO",
    type: "ACCESS_LOG",
    data: {
      ip_address: accessData.ip_address,
      method: accessData.method,
      path: accessData.path,
      status_code: accessData.status_code,
      user_agent: accessData.user_agent,
      response_time_ms: accessData.response_time_ms,
    },
  }

  writeToLogFile("access.log", entry)
}

export function getLogFiles(): string[] {
  if (!fs.existsSync(LOG_DIR)) {
    return []
  }
  return fs.readdirSync(LOG_DIR).filter((file) => file.endsWith(".log"))
}

export function readLogFile(filename: string, lines = 100): string {
  const filePath = path.join(LOG_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return ""
  }

  const content = fs.readFileSync(filePath, "utf8")
  const allLines = content.split("\n")

  // Return last N lines
  return allLines.slice(-lines).join("\n")
}
