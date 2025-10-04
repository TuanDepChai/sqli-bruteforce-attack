"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AdvancedChart, AttackTimeline } from "./advanced-charts"

interface RealTimeAnalyticsProps {}

export function RealTimeAnalytics({}: RealTimeAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          fetch('/api/realtime?type=stats'),
          fetch('/api/realtime?type=trends')
        ])

        if (statsRes.ok && trendsRes.ok) {
          const stats = await statsRes.json()
          const trends = await trendsRes.json()
          
          setAnalyticsData({
            stats: stats.data,
            trends: trends.data
          })
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </motion.div>
      </div>
    )
  }

  const { stats, trends } = analyticsData

  // Prepare chart data from real statistics
  const attackTypesData = [
    { 
      label: "SQL Injection", 
      value: stats.recent.sqlInjections, 
      color: "#ef4444", 
      trend: stats.recent.sqlInjections > 0 ? 15 : -5 
    },
    { 
      label: "Brute Force", 
      value: stats.recent.bruteForce, 
      color: "#f97316", 
      trend: stats.recent.bruteForce > 0 ? 8 : -2 
    },
    { 
      label: "Normal Login", 
      value: stats.recent.total - stats.recent.sqlInjections - stats.recent.bruteForce, 
      color: "#22c55e", 
      trend: 3 
    }
  ].filter(item => item.value > 0)

  const attackDistributionData = [
    { label: "SQL Injection", value: stats.recent.sqlInjections, color: "#ef4444" },
    { label: "Brute Force", value: stats.recent.bruteForce, color: "#f97316" },
    { label: "Normal Login", value: stats.recent.total - stats.recent.sqlInjections - stats.recent.bruteForce, color: "#22c55e" }
  ].filter(item => item.value > 0)

  // Convert trends to hourly data
  const hourlyData = trends.map((trend: any) => ({
    label: new Date(trend.hour).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    value: trend.total,
    color: "#3b82f6"
  })).slice(-24) // Last 24 hours

  return (
    <div className="space-y-6">
      {/* Real-time Attack Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdvancedChart
            data={attackTypesData}
            type="bar"
            title="Recent Attack Types (1h)"
            subtitle={`${stats.recent.total} total attacks in the last hour`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdvancedChart
            data={attackDistributionData}
            type="pie"
            title="Attack Distribution"
            subtitle={`Success rate: ${stats.successRate}%`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AdvancedChart
            data={hourlyData}
            type="line"
            title="Attack Timeline (24h)"
            subtitle="Real-time attack patterns"
          />
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AttackTimeline />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RealTimeStatsCard stats={stats} />
        </motion.div>
      </div>
    </div>
  )
}

function RealTimeStatsCard({ stats }: { stats: any }) {
  const statItems = [
    {
      label: 'Total Attacks (24h)',
      value: stats.daily.total,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      icon: '📊'
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      icon: '✅'
    },
    {
      label: 'Failed Attempts',
      value: stats.daily.failed,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      icon: '❌'
    },
    {
      label: 'Unique IPs',
      value: stats.topIPs.length,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      icon: '🌐'
    }
  ]

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">📈</span>
        Real-time Statistics
      </h3>
      
      <div className="space-y-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            <motion.span
              className={`font-bold text-lg ${item.color}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            >
              {item.value}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Top Attack Sources</h4>
        <div className="space-y-2">
          {stats.topIPs.slice(0, 3).map((ip: any, index: number) => (
            <div key={ip.ip} className="flex items-center justify-between text-sm">
              <span className="font-mono">{ip.ip}</span>
              <span className="text-muted-foreground">{ip.count} attacks</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
