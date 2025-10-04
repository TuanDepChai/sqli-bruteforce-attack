"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Zap,
  Eye,
  RefreshCw,
  Clock,
  Globe,
  Target,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"

interface RealTimeStats {
  total: number
  recent: {
    total: number
    sqlInjections: number
    bruteForce: number
    successful: number
    failed: number
  }
  daily: {
    total: number
    sqlInjections: number
    bruteForce: number
    successful: number
    failed: number
  }
  topIPs: Array<{ ip: string; count: number }>
  topAttackTypes: Array<{ type: string; count: number }>
  hourlyDistribution: Array<{ hour: number; count: number }>
  successRate: string
}

interface RealTimeAlert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  ip?: string
  attackType?: string
  username?: string
  attemptCount?: number
}

interface AttackLog {
  timestamp: string
  ip: string
  username: string
  password: string
  type: string
  success: boolean
  method: string
  userAgent: string
  referer: string
  responseTime: number
  payloadSize: number
  statusCode: number
  serverResponse: string
  sqlQuery?: string
  additionalData?: any
}

export function RealTimeDashboard() {
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([])
  const [recentLogs, setRecentLogs] = useState<AttackLog[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const eventSourceRef = useRef<EventSource | null>(null)

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, logsRes] = await Promise.all([
        fetch('/api/realtime?type=stats'),
        fetch('/api/realtime?type=alerts'),
        fetch('/api/realtime?type=logs&limit=20')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(alertsData.data)
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setRecentLogs(logsData.data)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
    }
  }

  // Set up Server-Sent Events
  useEffect(() => {
    fetchData()

    // Set up real-time updates
    const eventSource = new EventSource('/api/realtime', {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    })

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('🔗 Real-time connection established')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'stats') {
          setStats(data.data)
        } else if (data.type === 'alerts') {
          setAlerts(data.data)
        } else if (data.type === 'logs') {
          setRecentLogs(data.data)
        } else if (data.type === 'all') {
          setStats(data.data.stats)
          setAlerts(data.data.alerts)
          setRecentLogs(data.data.logs)
        }

        setLastUpdate(new Date())
      } catch (error) {
        console.error('Failed to parse SSE data:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      console.error('❌ Real-time connection lost')
    }

    eventSourceRef.current = eventSource

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getAttackTypeColor = (type: string) => {
    switch (type) {
      case 'sql_injection': return 'text-red-500 bg-red-500/10'
      case 'brute_force': return 'text-orange-500 bg-orange-500/10'
      case 'normal_login': return 'text-green-500 bg-green-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        className="flex items-center justify-between p-4 rounded-lg border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            animate={{ 
              scale: isConnected ? [1, 1.2, 1] : 1,
              opacity: isConnected ? [1, 0.7, 1] : 1
            }}
            transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
          />
          <div>
            <p className="font-medium">
              {isConnected ? 'Connected to Real-time Feed' : 'Disconnected'}
            </p>
            <p className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={!isConnected}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Attacks', 
            value: stats.total, 
            icon: <Shield className="w-5 h-5" />,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
          },
          { 
            title: 'Recent (1h)', 
            value: stats.recent.total, 
            icon: <Activity className="w-5 h-5" />,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
          },
          { 
            title: 'SQL Injections', 
            value: stats.recent.sqlInjections, 
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
          },
          { 
            title: 'Brute Force', 
            value: stats.recent.bruteForce, 
            icon: <Zap className="w-5 h-5" />,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <motion.p
                      className="text-3xl font-bold"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <motion.div
                    className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </motion.div>
              Real-time Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {alerts.slice(0, 5).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                  >
                    <motion.div
                      className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.message}</span>
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                        {alert.ip && ` • ${alert.ip}`}
                      </div>
                    </div>
                    
                    <motion.div
                      className="w-2 h-2 rounded-full bg-red-500"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Attack Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-5 h-5 text-primary" />
            </motion.div>
            Recent Attack Logs (Real-time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {recentLogs.slice(0, 10).map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${log.ip}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <motion.div
                    className={`p-2 rounded-lg border ${getAttackTypeColor(log.type)}`}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  >
                    {log.type === 'sql_injection' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : log.type === 'brute_force' ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.type}</span>
                      <Badge variant={log.success ? "default" : "secondary"}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                      <Badge variant="outline" className={getAttackTypeColor(log.type)}>
                        {log.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-mono">{log.ip}</span>
                      <span> • {log.username} • {log.timestamp}</span>
                    </div>
                  </div>
                  
                  <motion.div
                    className={`w-2 h-2 rounded-full ${log.success ? 'bg-red-500' : 'bg-gray-400'}`}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Top IPs and Attack Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Attacking IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topIPs.slice(0, 8).map((item, index) => (
                <motion.div
                  key={item.ip}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{item.ip}</span>
                  </div>
                  <Badge variant="outline">{item.count} attacks</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Attack Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topAttackTypes.map((item, index) => (
                <motion.div
                  key={item.type}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getAttackTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
