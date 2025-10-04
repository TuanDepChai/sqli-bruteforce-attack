"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"

interface ChartData {
  label: string
  value: number
  color: string
  trend?: number
}

interface AdvancedChartProps {
  data: ChartData[]
  type: "bar" | "pie" | "line"
  title: string
  subtitle?: string
  className?: string
}

export function AdvancedChart({ data, type, title, subtitle, className }: AdvancedChartProps) {
  const [animatedData, setAnimatedData] = useState<ChartData[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // Animate data loading
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 500)
    return () => clearTimeout(timer)
  }, [data])

  const maxValue = Math.max(...data.map(d => d.value))

  const renderBarChart = () => (
    <div className="flex items-end justify-between h-48 space-x-2">
      {animatedData.map((item, index) => (
        <motion.div
          key={item.label}
          className="flex flex-col items-center space-y-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <motion.div
            className="relative w-12 rounded-t-lg"
            style={{ backgroundColor: item.color }}
            initial={{ height: 0 }}
            animate={{ 
              height: isVisible ? (item.value / maxValue) * 160 : 0 
            }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.8 }}
            >
              {item.value}
            </motion.div>
          </motion.div>
          <motion.span
            className="text-xs text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            {item.label}
          </motion.span>
          {item.trend && (
            <motion.div
              className={`flex items-center text-xs ${
                item.trend > 0 ? "text-green-500" : "text-red-500"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 1 }}
            >
              {item.trend > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(item.trend)}%
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )

  const renderPieChart = () => {
    let cumulativePercentage = 0
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {animatedData.map((item, index) => {
            const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100
            const strokeDasharray = `${percentage} ${100 - percentage}`
            const strokeDashoffset = -cumulativePercentage
            
            cumulativePercentage += percentage
            
            return (
              <motion.circle
                key={item.label}
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke={item.color}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                initial={{ strokeDasharray: "0 100", strokeDashoffset: 0 }}
                animate={{ 
                  strokeDasharray: strokeDasharray,
                  strokeDashoffset: strokeDashoffset
                }}
                transition={{ delay: index * 0.2, duration: 1, ease: "easeOut" }}
              />
            )
          })}
        </svg>
        
        {/* Center content */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.reduce((sum, d) => sum + d.value, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </motion.div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {animatedData.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 1.2 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const renderLineChart = () => (
    <div className="h-48 relative">
      <svg className="w-full h-full">
        <motion.polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          points={animatedData.map((item, index) => 
            `${(index / (animatedData.length - 1)) * 400},${160 - (item.value / maxValue) * 140}`
          ).join(" ")}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {animatedData.map((item, index) => (
          <motion.circle
            key={index}
            cx={(index / (animatedData.length - 1)) * 400}
            cy={160 - (item.value / maxValue) * 140}
            r="4"
            fill={item.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 1, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  )

  const getIcon = () => {
    switch (type) {
      case "bar": return <BarChart3 className="w-5 h-5" />
      case "pie": return <PieChart className="w-5 h-5" />
      case "line": return <LineChart className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {getIcon()}
            </motion.div>
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          {type === "bar" && renderBarChart()}
          {type === "pie" && renderPieChart()}
          {type === "line" && renderLineChart()}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Real-time Attack Timeline
export function AttackTimeline() {
  const [attacks, setAttacks] = useState<Array<{
    id: string
    time: string
    type: string
    ip: string
    severity: "low" | "medium" | "high" | "critical"
  }>>([])

  useEffect(() => {
    // Simulate real-time attacks
    const interval = setInterval(() => {
      const newAttack = {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString(),
        type: ["SQL Injection", "Brute Force", "XSS", "CSRF"][Math.floor(Math.random() * 4)],
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any
      }
      
      setAttacks(prev => [newAttack, ...prev.slice(0, 9)])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20"
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20"
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "low": return "text-green-500 bg-green-500/10 border-green-500/20"
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="w-4 h-4" />
      case "high": return <Shield className="w-4 h-4" />
      case "medium": return <Activity className="w-4 h-4" />
      case "low": return <TrendingUp className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-5 h-5 text-primary" />
          </motion.div>
          Real-time Attack Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {attacks.map((attack, index) => (
            <motion.div
              key={attack.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <motion.div
                className={`p-2 rounded-lg border ${getSeverityColor(attack.severity)}`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
              >
                {getSeverityIcon(attack.severity)}
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{attack.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(attack.severity)}`}>
                    {attack.severity}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {attack.ip} • {attack.time}
                </div>
              </div>
              
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
