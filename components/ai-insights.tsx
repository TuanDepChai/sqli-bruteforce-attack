"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Target,
  Activity,
  Eye,
  RefreshCw,
  Sparkles,
  BarChart3
} from "lucide-react"

interface AIInsight {
  id: string
  type: "threat" | "pattern" | "anomaly" | "recommendation"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  confidence: number
  timestamp: Date
  data?: any
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  useEffect(() => {
    // Simulate AI analysis
    const generateInsight = (): AIInsight => {
      const types = ["threat", "pattern", "anomaly", "recommendation"] as const
      const severities = ["low", "medium", "high", "critical"] as const
      const type = types[Math.floor(Math.random() * types.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      
      const insights = {
        threat: [
          "Potential SQL injection attack pattern detected",
          "Suspicious brute force activity from multiple IPs",
          "Unusual login attempt frequency detected",
          "Possible credential stuffing attack in progress"
        ],
        pattern: [
          "Peak attack times identified: 2-4 AM UTC",
          "Common attack vectors: admin', 'OR 1=1--",
          "Geographic clustering: 70% attacks from Asia",
          "Attack success rate: 23% for SQL injection attempts"
        ],
        anomaly: [
          "Unusual traffic spike detected",
          "New attack pattern not seen before",
          "Abnormal response time patterns",
          "Unexpected user behavior detected"
        ],
        recommendation: [
          "Implement rate limiting on login endpoints",
          "Add CAPTCHA for failed login attempts",
          "Enable two-factor authentication",
          "Update security rules for new attack patterns"
        ]
      }
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        severity,
        title: insights[type][Math.floor(Math.random() * insights[type].length)],
        description: `AI analysis indicates ${type} with ${severity} severity. Confidence level: ${Math.floor(Math.random() * 30) + 70}%.`,
        confidence: Math.floor(Math.random() * 30) + 70,
        timestamp: new Date(),
        data: {
          affectedIPs: Math.floor(Math.random() * 50) + 1,
          attackCount: Math.floor(Math.random() * 100) + 10,
          riskScore: Math.floor(Math.random() * 40) + 60
        }
      }
    }

    // Initial insights
    setInsights(Array.from({ length: 5 }, generateInsight))

    // Generate new insights periodically
    const interval = setInterval(() => {
      setIsAnalyzing(true)
      setTimeout(() => {
        const newInsight = generateInsight()
        setInsights(prev => [newInsight, ...prev.slice(0, 9)])
        setIsAnalyzing(false)
      }, 2000)
    }, 15000)

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "threat": return <AlertTriangle className="w-4 h-4" />
      case "pattern": return <BarChart3 className="w-4 h-4" />
      case "anomaly": return <Activity className="w-4 h-4" />
      case "recommendation": return <Sparkles className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "threat": return "text-red-500"
      case "pattern": return "text-blue-500"
      case "anomaly": return "text-orange-500"
      case "recommendation": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-5 h-5 text-primary" />
            </motion.div>
            AI Security Analysis
            {isAnalyzing && (
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                Analyzing...
              </motion.div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Threats Detected", value: insights.filter(i => i.type === "threat").length, color: "text-red-500" },
              { label: "Patterns Found", value: insights.filter(i => i.type === "pattern").length, color: "text-blue-500" },
              { label: "Anomalies", value: insights.filter(i => i.type === "anomaly").length, color: "text-orange-500" },
              { label: "Recommendations", value: insights.filter(i => i.type === "recommendation").length, color: "text-green-500" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-3 rounded-lg bg-card/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`text-2xl font-bold ${stat.color}`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Latest Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className={`p-2 rounded-lg border ${getSeverityColor(insight.severity)}`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <div className={getTypeColor(insight.type)}>
                        {getTypeIcon(insight.type)}
                      </div>
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{insight.title}</span>
                        <Badge variant="outline" className={getSeverityColor(insight.severity)}>
                          {insight.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{insight.type}</span>
                        <span>•</span>
                        <span>{insight.timestamp.toLocaleTimeString()}</span>
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
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              className="bg-background border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <motion.div
                  className={`p-3 rounded-lg border ${getSeverityColor(selectedInsight.severity)}`}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className={getTypeColor(selectedInsight.type)}>
                    {getTypeIcon(selectedInsight.type)}
                  </div>
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{selectedInsight.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={getSeverityColor(selectedInsight.severity)}>
                      {selectedInsight.severity}
                    </Badge>
                    <Badge variant="secondary">
                      {selectedInsight.confidence}% confidence
                    </Badge>
                    <Badge variant="outline">{selectedInsight.type}</Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{selectedInsight.description}</p>
              
              {selectedInsight.data && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-card/50">
                    <div className="text-2xl font-bold text-primary">
                      {selectedInsight.data.affectedIPs}
                    </div>
                    <div className="text-sm text-muted-foreground">Affected IPs</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card/50">
                    <div className="text-2xl font-bold text-orange-500">
                      {selectedInsight.data.attackCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Attack Count</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-card/50">
                    <div className="text-2xl font-bold text-red-500">
                      {selectedInsight.data.riskScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedInsight(null)}>
                  Close
                </Button>
                <Button>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
