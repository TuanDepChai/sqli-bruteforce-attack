import fs from 'fs'
import path from 'path'

// Simple file-based logger for all attack behaviors
const LOG_FILE = path.join(process.cwd(), 'logs', 'attacks.log')

// Ensure logs directory exists
const ensureLogDir = () => {
  const logDir = path.dirname(LOG_FILE)
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
}

// Helper function to get Vietnam timezone timestamp
function getVietnamTimestamp() {
  const now = new Date()
  return now.toLocaleString("en-US", { 
    timeZone: "Asia/Ho_Chi_Minh",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// Simple attack logging interface
export interface AttackLog {
  timestamp: string
  ip_address: string
  username_attempt: string
  password_attempt: string
  attack_type: string
  sql_query?: string
  success: boolean
  user_agent?: string
  request_method?: string
  referer?: string
  response_time_ms?: number
  payload_size?: number
  status_code?: number
  server_response?: string
  error_message?: string
  additional_data?: any
}

// Log attack to file only (simple approach)
export function logAttack(log: AttackLog) {
  try {
    ensureLogDir()
    
    // Create log entry with all behavior data
    const logEntry = {
      timestamp: getVietnamTimestamp(),
      ip: log.ip_address,
      username: log.username_attempt,
      password: log.password_attempt,
      type: log.attack_type,
      success: log.success,
      method: log.request_method || 'POST',
      userAgent: log.user_agent,
      referer: log.referer,
      responseTime: log.response_time_ms,
      payloadSize: log.payload_size,
      statusCode: log.status_code,
      serverResponse: log.server_response,
      error: log.error_message,
      sqlQuery: log.sql_query,
      additionalData: log.additional_data
    }

    // Write to single attacks.log file
    const logLine = JSON.stringify(logEntry) + '\n'
    fs.appendFileSync(LOG_FILE, logLine, 'utf8')

    // Console output for development
    console.log('[ATTACK LOG]', {
      timestamp: logEntry.timestamp,
      severity: log.success ? 'HIGH' : 'MEDIUM',
      ip_address: log.ip_address,
      username_attempt: log.username_attempt,
      password_attempt: log.password_attempt,
      attack_type: log.attack_type,
      sql_query: log.sql_query,
      success: log.success,
      user_agent: log.user_agent,
      request_method: log.request_method,
      request_headers: log.additional_data?.requestHeaders || 'N/A',
      referer: log.referer,
      response_time_ms: log.response_time_ms,
      payload_size: log.payload_size,
      status_code: log.status_code,
      server_response: log.server_response,
      additional_data: JSON.stringify(log.additional_data)
    })

  } catch (error) {
    console.error('Failed to write attack log:', error)
  }
}

// Get recent attack logs from file
export function getAttackLogs(limit = 100): AttackLog[] {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return []
    }

    const content = fs.readFileSync(LOG_FILE, 'utf8')
    const lines = content.trim().split('\n').filter(line => line.trim())
    
    // Parse JSON lines and reverse to get latest first
    const logs = lines
      .map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(log => log !== null)
      .reverse()
      .slice(0, limit)

    return logs
  } catch (error) {
    console.error('Failed to read attack logs:', error)
    return []
  }
}

// Get attack statistics from file
export function getAttackStats() {
  try {
    const logs = getAttackLogs(1000) // Get more logs for stats
    
    const total = logs.length
    const sqlInjections = logs.filter(log => log.type === 'sql_injection').length
    const bruteForce = logs.filter(log => log.type === 'brute_force').length
    const successful = logs.filter(log => log.success).length
    
    return {
      total,
      sqlInjections,
      bruteForce,
      successful,
      failed: total - successful
    }
  } catch (error) {
    console.error('Failed to get attack stats:', error)
    return {
      total: 0,
      sqlInjections: 0,
      bruteForce: 0,
      successful: 0,
      failed: 0
    }
  }
}

// Clear old logs (keep last 1000 entries)
export function cleanupLogs() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return
    }

    const logs = getAttackLogs(1000)
    
    // Write back only the recent logs
    fs.writeFileSync(LOG_FILE, '', 'utf8') // Clear file
    
    logs.reverse().forEach(log => {
      const logLine = JSON.stringify(log) + '\n'
      fs.appendFileSync(LOG_FILE, logLine, 'utf8')
    })

    console.log(`Cleaned up logs, kept ${logs.length} recent entries`)
  } catch (error) {
    console.error('Failed to cleanup logs:', error)
  }
}

// Get logs by IP address
export function getLogsByIP(ip: string, limit = 50): AttackLog[] {
  try {
    const logs = getAttackLogs(1000)
    return logs.filter(log => log.ip === ip).slice(0, limit)
  } catch (error) {
    console.error('Failed to get logs by IP:', error)
    return []
  }
}

// Get logs by attack type
export function getLogsByType(type: string, limit = 50): AttackLog[] {
  try {
    const logs = getAttackLogs(1000)
    return logs.filter(log => log.type === type).slice(0, limit)
  } catch (error) {
    console.error('Failed to get logs by type:', error)
    return []
  }
}

// Get recent successful attacks
export function getSuccessfulAttacks(limit = 20): AttackLog[] {
  try {
    const logs = getAttackLogs(1000)
    return logs.filter(log => log.success && log.type !== 'normal_login').slice(0, limit)
  } catch (error) {
    console.error('Failed to get successful attacks:', error)
    return []
  }
}
