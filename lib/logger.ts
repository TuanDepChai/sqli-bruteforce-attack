import { logAttackToFile, logSecurityEventToFile } from "./file-logger"
import { SecurityEvent } from "./models/SecurityEvent"

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
  const vietnamTimestamp = getVietnamTimestamp()
  const displayTimestamp = getVietnamDisplayTimestamp()
  
  // Create attack log entry for MongoDB
  const attackLogEntry = {
    timestamp: new Date(vietnamTimestamp),
    ip: log.ip_address || "unknown",
    usernameAttempt: log.username_attempt,
    passwordAttempt: log.password_attempt,
    attackType: log.attack_type,
    sqlQuery: log.sql_query || null,
    success: log.success,
    errorMessage: log.error_message || null,
    userAgent: log.user_agent || null,
    requestMethod: log.request_method || "POST",
    requestHeaders: log.request_headers || null,
    geoLocation: log.geo_location || null,
    deviceFingerprint: log.device_fingerprint || null,
    sessionId: log.session_id || null,
    referer: log.referer || null,
    responseTimeMs: log.response_time_ms || null,
    payloadSize: log.payload_size || null,
    additionalData: log.additional_data || null,
    statusCode: log.status_code || null,
    serverResponse: log.server_response || null,
  }

  // Save to MongoDB (async, don't wait)
  SecurityEvent.create(attackLogEntry).catch(err => {
    console.error('Failed to save attack log to MongoDB:', err)
  })

  // Also save to file
  const logWithId = {
    id: Date.now(), // Use timestamp as ID for file logging
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
      severity: "critical",
      description: `Successful ${log.attack_type} attack detected`,
      ip_address: log.ip_address,
      metadata: JSON.stringify(log),
    })
  }
}

export async function getAttackLogs(limit = 100) {
  try {
    return await SecurityEvent.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
  } catch (error) {
    console.error('Failed to get attack logs:', error)
    return []
  }
}

export async function getAttackStats() {
  try {
    const total = await SecurityEvent.countDocuments({})
    const sqlInjections = await SecurityEvent.countDocuments({ attackType: 'sql_injection' })
    const bruteForce = await SecurityEvent.countDocuments({ attackType: 'brute_force' })
    const successful = await SecurityEvent.countDocuments({ success: true })

    return {
      total,
      sqlInjections,
      bruteForce,
      successful,
    }
  } catch (error) {
    console.error('Failed to get attack stats:', error)
    return {
      total: 0,
      sqlInjections: 0,
      bruteForce: 0,
      successful: 0,
    }
  }
}

export async function logSecurityEvent(event: {
  severity: string
  description: string
  ip_address?: string
  user_id?: string
  metadata?: string
}) {
  const vietnamTimestamp = getVietnamTimestamp()
  
  try {
    await SecurityEvent.create({
      timestamp: new Date(vietnamTimestamp),
      eventType: 'security_event',
      severity: event.severity,
      description: event.description,
      ip: event.ip_address || null,
      userId: event.user_id || null,
      metadata: event.metadata || null,
    })
  } catch (error) {
    console.error('Failed to save security event to MongoDB:', error)
  }

  logSecurityEventToFile({
    ...event,
    timestamp: vietnamTimestamp,
  })
}

export async function getSecurityEvents(limit = 50) {
  try {
    return await SecurityEvent.find({ eventType: 'security_event' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
  } catch (error) {
    console.error('Failed to get security events:', error)
    return []
  }
}
