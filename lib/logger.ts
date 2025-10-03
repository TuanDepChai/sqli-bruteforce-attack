import { getDatabase } from "./db"
import { logAttackToFile, logSecurityEventToFile } from "./file-logger"

export interface AttackLog {
  ip_address?: string
  username_attempt: string
  password_attempt: string
  attack_type: "sql_injection" | "brute_force" | "normal_login" | "credential_stuffing"
  sql_query?: string
  success: boolean
  error_message?: string
  user_agent?: string
  request_method?: string
  request_headers?: string
  geo_location?: string
  device_fingerprint?: string
  session_id?: string
  referer?: string
  response_time_ms?: number
  payload_size?: number
  additional_data?: string
  status_code?: number
  server_response?: string
}

// Helper function to get Vietnam timezone timestamp
function getVietnamTimestamp() {
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
  return vietnamTime.toISOString()
}

// Helper function to get Vietnam timezone timestamp for display
function getVietnamDisplayTimestamp() {
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

export function logAttack(log: AttackLog) {
  const startTime = Date.now()
  const db = getDatabase()
  const vietnamTimestamp = getVietnamTimestamp()

  const stmt = db.prepare(`
    INSERT INTO attack_logs (
      timestamp, ip_address, username_attempt, password_attempt, 
      attack_type, sql_query, success, error_message, 
      user_agent, request_method, request_headers,
      geo_location, device_fingerprint, session_id,
      referer, response_time_ms, payload_size, additional_data,
      status_code, server_response
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    vietnamTimestamp,
    log.ip_address || "unknown",
    log.username_attempt,
    log.password_attempt,
    log.attack_type,
    log.sql_query || null,
    log.success ? 1 : 0,
    log.error_message || null,
    log.user_agent || null,
    log.request_method || "POST",
    log.request_headers || null,
    log.geo_location || null,
    log.device_fingerprint || null,
    log.session_id || null,
    log.referer || null,
    log.response_time_ms || null,
    log.payload_size || null,
    log.additional_data || null,
    log.status_code || null,
    log.server_response || null,
  )

  const displayTimestamp = getVietnamDisplayTimestamp()
  
  const logWithId = {
    id: result.lastInsertRowid,
    timestamp: displayTimestamp,
    ...log,
  }
  logAttackToFile(logWithId)

  console.log("[ATTACK LOG]", {
    timestamp: displayTimestamp,
    severity: log.success ? "HIGH" : "MEDIUM",
    ...log,
  })

  if (log.success && log.attack_type !== "normal_login") {
    logSecurityEvent({
      event_type: log.attack_type,
      severity: "critical",
      description: `Successful ${log.attack_type} attack detected`,
      ip_address: log.ip_address,
      metadata: JSON.stringify(log),
    })
  }
}

export function getAttackLogs(limit = 100) {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT * FROM attack_logs 
    ORDER BY timestamp DESC 
    LIMIT ?
  `)
  return stmt.all(limit)
}

export function getAttackStats() {
  const db = getDatabase()

  const totalAttacks = db.prepare("SELECT COUNT(*) as count FROM attack_logs").get() as { count: number }
  const sqlInjections = db
    .prepare("SELECT COUNT(*) as count FROM attack_logs WHERE attack_type = 'sql_injection'")
    .get() as { count: number }
  const bruteForce = db
    .prepare("SELECT COUNT(*) as count FROM attack_logs WHERE attack_type = 'brute_force'")
    .get() as { count: number }
  const successfulAttacks = db.prepare("SELECT COUNT(*) as count FROM attack_logs WHERE success = 1").get() as {
    count: number
  }

  return {
    total: totalAttacks.count,
    sqlInjections: sqlInjections.count,
    bruteForce: bruteForce.count,
    successful: successfulAttacks.count,
  }
}

export function logSecurityEvent(event: {
  event_type: string
  severity: string
  description: string
  ip_address?: string
  user_id?: number
  metadata?: string
}) {
  const db = getDatabase()
  const vietnamTimestamp = getVietnamTimestamp()
  
  const stmt = db.prepare(`
    INSERT INTO security_events (
      event_type, severity, description, ip_address, user_id, metadata, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    event.event_type,
    event.severity,
    event.description,
    event.ip_address || null,
    event.user_id || null,
    event.metadata || null,
    vietnamTimestamp,
  )

  logSecurityEventToFile({
    ...event,
    timestamp: vietnamTimestamp,
  })
}

export function getSecurityEvents(limit = 50) {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT * FROM security_events 
    ORDER BY timestamp DESC 
    LIMIT ?
  `)
  return stmt.all(limit)
}
