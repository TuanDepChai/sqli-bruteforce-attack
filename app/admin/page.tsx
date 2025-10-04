"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Lock, 
  Eye, 
  TrendingUp, 
  Clock,
  Globe,
  Database,
  Zap,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
  Brain,
  Settings
} from "lucide-react"
import { AnimatedHeader } from "@/components/animated-header"
import { GlassCard } from "@/components/glass-card"
import { ParticleBackground } from "@/components/particle-background"
import { AnimatedGradientBg } from "@/components/animated-gradient-bg"
import { AdvancedChart, AttackTimeline } from "@/components/advanced-charts"
import { AIInsightsPanel } from "@/components/ai-insights"
import { AdvancedSettings } from "@/components/theme-toggle"

interface AttackStats {
  total: number
  sqlInjections: number
  bruteForce: number
  successful: number
  blocked: number
  today: number
}

interface RecentAttack {
  id: string
  timestamp: string
  ip: string
  username: string
  attackType: string
  success: boolean
  userAgent: string
  riskScore: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AttackStats>({
    total: 0,
    sqlInjections: 0,
    bruteForce: 0,
    successful: 0,
    blocked: 0,
    today: 0
  })
  
  const [recentAttacks, setRecentAttacks] = useState<RecentAttack[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRecentAttacks = async () => {
    try {
      const response = await fetch('/api/attacks?limit=10')
      const data = await response.json()
      setRecentAttacks(data)
    } catch (error) {
      console.error('Failed to fetch recent attacks:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchRecentAttacks()])
      setLoading(false)
    }

    loadData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Total Attacks",
      value: stats.total,
      icon: <Target className="w-5 h-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "SQL Injections",
      value: stats.sqlInjections,
      icon: <Database className="w-5 h-5" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Brute Force",
      value: stats.bruteForce,
      icon: <Zap className="w-5 h-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      change: "+15%",
      changeType: "increase"
    },
    {
      title: "Successful",
      value: stats.successful,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-red-600",
      bgColor: "bg-red-600/10",
      change: "+5%",
      changeType: "increase"
    },
    {
      title: "Blocked",
      value: stats.blocked,
      icon: <Shield className="w-5 h-5" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "+20%",
      changeType: "increase"
    },
    {
      title: "Today",
      value: stats.today,
      icon: <Clock className="w-5 h-5" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: "+3%",
      changeType: "increase"
    }
  ]

  const getAttackTypeColor = (type: string) => {
    switch (type) {
      case 'sql_injection': return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'brute_force': return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
      case 'credential_stuffing': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      default: return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500'
    if (score >= 60) return 'text-orange-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <AnimatedGradientBg />
      
      {/* Header */}
      <AnimatedHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Security Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time security monitoring and threat analysis
            </p>
          </div>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true)
                Promise.all([fetchStats(), fetchRecentAttacks()]).finally(() => setLoading(false))
              }}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <GlassCard>
                <Card className="border-0 bg-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <motion.p
                          className="text-3xl font-bold mt-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        >
                          {loading ? '...' : stat.value.toLocaleString()}
                        </motion.p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-500">{stat.change}</span>
                        </div>
                      </div>
                      <motion.div
                        className={`p-3 rounded-lg ${stat.bgColor}`}
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      >
                        <div className={stat.color}>
                          {stat.icon}
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Tabs defaultValue="attacks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="attacks">Recent Attacks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="attacks" className="space-y-6">
              <GlassCard>
                <Card className="border-0 bg-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Security Events
                    </CardTitle>
                    <CardDescription>
                      Live feed of security events and attack attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2">Loading attacks...</span>
                        </div>
                      ) : recentAttacks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No attacks detected yet</p>
                        </div>
                      ) : (
                        recentAttacks.map((attack, index) => (
                          <motion.div
                            key={attack.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-primary/5 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="p-2 rounded-lg bg-primary/10"
                                animate={{
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                              >
                                {attack.success ? (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Shield className="w-4 h-4 text-green-500" />
                                )}
                              </motion.div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getAttackTypeColor(attack.attackType)}>
                                    {attack.attackType.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <span className={`text-sm font-medium ${getRiskColor(attack.riskScore)}`}>
                                    Risk: {attack.riskScore}%
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {attack.ip} • {attack.username} • {attack.timestamp}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">User Agent</p>
                              <p className="text-sm font-mono truncate max-w-xs">{attack.userAgent}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </GlassCard>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdvancedChart
                  data={[
                    { label: "SQL Injection", value: stats?.sqlInjections || 0, color: "#ef4444", trend: 12 },
                    { label: "Brute Force", value: stats?.bruteForce || 0, color: "#f97316", trend: -5 },
                    { label: "XSS", value: Math.floor((stats?.total || 0) * 0.1), color: "#eab308", trend: 8 },
                    { label: "CSRF", value: Math.floor((stats?.total || 0) * 0.05), color: "#22c55e", trend: -2 }
                  ]}
                  type="bar"
                  title="Attack Types Distribution"
                  subtitle="Real-time attack statistics"
                />

                <AdvancedChart
                  data={[
                    { label: "SQL Injection", value: stats?.sqlInjections || 0, color: "#ef4444" },
                    { label: "Brute Force", value: stats?.bruteForce || 0, color: "#f97316" },
                    { label: "Other", value: (stats?.total || 0) - (stats?.sqlInjections || 0) - (stats?.bruteForce || 0), color: "#6b7280" }
                  ]}
                  type="pie"
                  title="Attack Distribution"
                  subtitle="Percentage breakdown of attack types"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdvancedChart
                  data={[
                    { label: "00:00", value: 12, color: "#3b82f6" },
                    { label: "04:00", value: 8, color: "#3b82f6" },
                    { label: "08:00", value: 25, color: "#3b82f6" },
                    { label: "12:00", value: 45, color: "#3b82f6" },
                    { label: "16:00", value: 38, color: "#3b82f6" },
                    { label: "20:00", value: 22, color: "#3b82f6" }
                  ]}
                  type="line"
                  title="Attack Timeline"
                  subtitle="Attacks per hour over 24h period"
                />

                <AttackTimeline />
              </div>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <AIInsightsPanel />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <Card className="border-0 bg-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Theme & Appearance
                      </CardTitle>
                      <CardDescription>
                        Customize the interface appearance and theme settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AdvancedSettings />
                    </CardContent>
                  </Card>
                </GlassCard>

                <GlassCard>
                  <Card className="border-0 bg-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>
                        Configure security policies and monitoring settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Enable request rate limiting</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto IP Blocking</p>
                            <p className="text-sm text-muted-foreground">Block IPs after failed attempts</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Real-time Alerts</p>
                            <p className="text-sm text-muted-foreground">Send alerts for critical attacks</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}