import fs from 'fs'
import path from 'path'
import { EventEmitter } from 'events'

// Real-time logger with file watching
export class RealTimeLogger extends EventEmitter {
  private logFile: string
  private watcher: fs.FSWatcher | null = null
  private lastPosition: number = 0
  private isWatching: boolean = false

  constructor(logFile: string = 'logs/attacks.log') {
    super()
    this.logFile = path.join(process.cwd(), logFile)
    this.ensureLogFile()
  }

  private ensureLogFile() {
    const logDir = path.dirname(this.logFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '', 'utf8')
    }
  }

  // Start watching for new log entries
  startWatching() {
    if (this.isWatching) return

    try {
      // Get initial file size
      this.lastPosition = fs.statSync(this.logFile).size

      // Watch for file changes
      this.watcher = fs.watch(this.logFile, (eventType) => {
        if (eventType === 'change') {
          this.readNewEntries()
        }
      })

      this.isWatching = true
      console.log('🔍 Real-time logger started watching:', this.logFile)
    } catch (error) {
      console.error('Failed to start real-time logger:', error)
    }
  }

  // Stop watching
  stopWatching() {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    this.isWatching = false
    console.log('⏹️ Real-time logger stopped')
  }

  // Read new entries since last position
  private readNewEntries() {
    try {
      const stats = fs.statSync(this.logFile)
      if (stats.size <= this.lastPosition) return

      const stream = fs.createReadStream(this.logFile, {
        start: this.lastPosition,
        encoding: 'utf8'
      })

      let buffer = ''
      stream.on('data', (chunk) => {
        buffer += chunk
      })

      stream.on('end', () => {
        const lines = buffer.split('\n').filter(line => line.trim())
        
        lines.forEach(line => {
          try {
            const logEntry = JSON.parse(line)
            this.emit('newLog', logEntry)
            this.emit('logUpdate', {
              type: 'new',
              data: logEntry,
              timestamp: new Date()
            })
          } catch (error) {
            console.error('Failed to parse log line:', line, error)
          }
        })

        this.lastPosition = stats.size
      })

    } catch (error) {
      console.error('Failed to read new entries:', error)
    }
  }

  // Get all logs with real-time updates
  getAllLogs(limit: number = 100) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return []
      }

      const content = fs.readFileSync(this.logFile, 'utf8')
      const lines = content.trim().split('\n').filter(line => line.trim())
      
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
      console.error('Failed to get all logs:', error)
      return []
    }
  }

  // Get real-time statistics
  getRealTimeStats() {
    const logs = this.getAllLogs(1000)
    
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Filter logs by time
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp)
      return logTime >= oneHourAgo
    })

    const dailyLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp)
      return logTime >= oneDayAgo
    })

    // Calculate statistics
    const stats = {
      total: logs.length,
      recent: {
        total: recentLogs.length,
        sqlInjections: recentLogs.filter(log => log.type === 'sql_injection').length,
        bruteForce: recentLogs.filter(log => log.type === 'brute_force').length,
        successful: recentLogs.filter(log => log.success).length,
        failed: recentLogs.filter(log => !log.success).length
      },
      daily: {
        total: dailyLogs.length,
        sqlInjections: dailyLogs.filter(log => log.type === 'sql_injection').length,
        bruteForce: dailyLogs.filter(log => log.type === 'brute_force').length,
        successful: dailyLogs.filter(log => log.success).length,
        failed: dailyLogs.filter(log => !log.success).length
      },
      topIPs: this.getTopIPs(logs, 10),
      topAttackTypes: this.getTopAttackTypes(logs),
      hourlyDistribution: this.getHourlyDistribution(dailyLogs),
      successRate: logs.length > 0 ? (logs.filter(log => log.success).length / logs.length * 100).toFixed(2) : '0'
    }

    return stats
  }

  // Get top attacking IPs
  private getTopIPs(logs: any[], limit: number = 10) {
    const ipCounts: { [key: string]: number } = {}
    
    logs.forEach(log => {
      if (log.ip) {
        ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1
      }
    })

    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([ip, count]) => ({ ip, count }))
  }

  // Get top attack types
  private getTopAttackTypes(logs: any[]) {
    const typeCounts: { [key: string]: number } = {}
    
    logs.forEach(log => {
      if (log.type) {
        typeCounts[log.type] = (typeCounts[log.type] || 0) + 1
      }
    })

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }))
  }

  // Get hourly distribution
  private getHourlyDistribution(logs: any[]) {
    const hourlyData: { [key: number]: number } = {}
    
    logs.forEach(log => {
      const logTime = new Date(log.timestamp)
      const hour = logTime.getHours()
      hourlyData[hour] = (hourlyData[hour] || 0) + 1
    })

    // Fill missing hours with 0
    for (let i = 0; i < 24; i++) {
      if (!hourlyData[i]) {
        hourlyData[i] = 0
      }
    }

    return Object.entries(hourlyData)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
  }

  // Get logs by IP
  getLogsByIP(ip: string, limit: number = 50) {
    const logs = this.getAllLogs(1000)
    return logs.filter(log => log.ip === ip).slice(0, limit)
  }

  // Get logs by type
  getLogsByType(type: string, limit: number = 50) {
    const logs = this.getAllLogs(1000)
    return logs.filter(log => log.type === type).slice(0, limit)
  }

  // Get successful attacks
  getSuccessfulAttacks(limit: number = 20) {
    const logs = this.getAllLogs(1000)
    return logs.filter(log => log.success && log.type !== 'normal_login').slice(0, limit)
  }

  // Get failed attacks
  getFailedAttacks(limit: number = 20) {
    const logs = this.getAllLogs(1000)
    return logs.filter(log => !log.success).slice(0, limit)
  }

  // Get attack trends (last 24 hours)
  getAttackTrends() {
    const logs = this.getAllLogs(1000)
    const now = new Date()
    const hourlyData: { [key: string]: { sql_injection: number, brute_force: number, normal_login: number } } = {}

    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourKey = hour.toISOString().slice(0, 13) + ':00:00'
      hourlyData[hourKey] = { sql_injection: 0, brute_force: 0, normal_login: 0 }
    }

    // Count attacks by hour and type
    logs.forEach(log => {
      const logTime = new Date(log.timestamp)
      const hourKey = logTime.toISOString().slice(0, 13) + ':00:00'
      
      if (hourlyData[hourKey]) {
        hourlyData[hourKey][log.type as keyof typeof hourlyData[string]]++
      }
    })

    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour,
        ...data,
        total: data.sql_injection + data.brute_force + data.normal_login
      }))
  }

  // Get real-time alerts
  getRealTimeAlerts() {
    const logs = this.getAllLogs(100)
    const alerts = []

    // Check for recent successful attacks
    const recentSuccessful = logs.filter(log => 
      log.success && 
      log.type !== 'normal_login' && 
      new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    )

    recentSuccessful.forEach(log => {
      alerts.push({
        id: `${log.ip}_${log.timestamp}`,
        type: 'successful_attack',
        severity: 'critical',
        message: `Successful ${log.type} attack from ${log.ip}`,
        timestamp: log.timestamp,
        ip: log.ip,
        attackType: log.type,
        username: log.username
      })
    })

    // Check for rapid failed attempts
    const recentFailed = logs.filter(log => 
      !log.success && 
      new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000)
    )

    const ipAttempts: { [key: string]: number } = {}
    recentFailed.forEach(log => {
      ipAttempts[log.ip] = (ipAttempts[log.ip] || 0) + 1
    })

    Object.entries(ipAttempts).forEach(([ip, count]) => {
      if (count >= 5) {
        alerts.push({
          id: `rapid_attempts_${ip}`,
          type: 'rapid_attempts',
          severity: 'high',
          message: `${count} failed login attempts from ${ip} in 5 minutes`,
          timestamp: new Date().toISOString(),
          ip,
          attemptCount: count
        })
      }
    })

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}

// Global instance
export const realTimeLogger = new RealTimeLogger()
