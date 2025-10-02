"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Database,
  Filter,
  Download,
  Search,
  Calendar,
  X,
} from "lucide-react"
import Link from "next/link"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { ParticleBackground } from "@/components/particle-background"

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count}</span>
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [filters, setFilters] = useState({
    search: "",
    attackType: "all",
    success: "all",
    dateFrom: "",
    dateTo: "",
    ipAddress: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/logs")
      const data = await response.json()
      if (data.success) {
        setLogs(data.logs)
        setFilteredLogs(data.logs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    let filtered = [...logs]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.username_attempt?.toLowerCase().includes(searchLower) ||
          log.ip_address?.toLowerCase().includes(searchLower) ||
          log.sql_query?.toLowerCase().includes(searchLower) ||
          log.error_message?.toLowerCase().includes(searchLower),
      )
    }

    // Attack type filter
    if (filters.attackType !== "all") {
      filtered = filtered.filter((log) => log.attack_type === filters.attackType)
    }

    // Success filter
    if (filters.success !== "all") {
      const successValue = filters.success === "success"
      filtered = filtered.filter((log) => log.success === (successValue ? 1 : 0))
    }

    // IP address filter
    if (filters.ipAddress) {
      filtered = filtered.filter((log) => log.ip_address?.includes(filters.ipAddress))
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((log) => new Date(log.timestamp) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate)
    }

    setFilteredLogs(filtered)
  }, [filters, logs])

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `attack-logs-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      attackType: "all",
      success: "all",
      dateFrom: "",
      dateTo: "",
      ipAddress: "",
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.attackType !== "all" ||
    filters.success !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.ipAddress

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Header */}
      <motion.header
        className="border-b border-border relative z-10 backdrop-blur-sm bg-background/80"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </motion.div>
              </Link>
              <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-mono text-lg font-semibold">Admin Dashboard</span>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                      Active
                    </Badge>
                  )}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={exportLogs} variant="outline" size="sm" disabled={filteredLogs.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={fetchLogs} variant="outline" size="sm" disabled={loading}>
                  <motion.div
                    animate={loading ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: loading ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                  </motion.div>
                  Refresh
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { title: "Total Attempts", value: stats.total, icon: Activity, color: "text-foreground" },
              { title: "SQL Injections", value: stats.sqlInjections, icon: AlertTriangle, color: "text-warning" },
              { title: "Brute Force", value: stats.bruteForce, icon: AlertTriangle, color: "text-destructive" },
              { title: "Successful", value: stats.successful, icon: CheckCircle, color: "text-primary" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="backdrop-blur-sm bg-card/50 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <CardDescription>{stat.title}</CardDescription>
                    <CardTitle className={`text-3xl ${stat.color}`}>
                      <AnimatedCounter value={stat.value} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Advanced Filters
                    </CardTitle>
                    {hasActiveFilters && (
                      <Button onClick={clearFilters} variant="ghost" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Filter logs by search term, attack type, status, date range, and IP address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Username, IP, SQL query..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Attack Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Attack Type</label>
                      <Select
                        value={filters.attackType}
                        onValueChange={(value) => setFilters({ ...filters, attackType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="sql_injection">SQL Injection</SelectItem>
                          <SelectItem value="brute_force">Brute Force</SelectItem>
                          <SelectItem value="normal_login">Normal Login</SelectItem>
                          <SelectItem value="credential_stuffing">Credential Stuffing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Success Status */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={filters.success}
                        onValueChange={(value) => setFilters({ ...filters, success: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="success">Success Only</SelectItem>
                          <SelectItem value="failed">Failed Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* IP Address */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">IP Address</label>
                      <Input
                        placeholder="Filter by IP..."
                        value={filters.ipAddress}
                        onChange={(e) => setFilters({ ...filters, ipAddress: e.target.value })}
                      />
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date From</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date To</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-semibold text-foreground">{filteredLogs.length}</span> of{" "}
                      <span className="font-semibold text-foreground">{logs.length}</span> total logs
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Attack Logs
              </CardTitle>
              <CardDescription>Comprehensive logging of all authentication attempts and attacks</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <motion.div
                  className="text-center py-8 text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  Loading logs...
                </motion.div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {hasActiveFilters ? "No logs match your filters" : "No logs yet"}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredLogs.map((log: any, index: number) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200">
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, delay: index * 0.05 + 0.1 }}
                                  >
                                    <Badge variant={log.success ? "default" : "secondary"}>
                                      {log.success ? "SUCCESS" : "FAILED"}
                                    </Badge>
                                  </motion.div>
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, delay: index * 0.05 + 0.2 }}
                                  >
                                    <Badge
                                      variant={
                                        log.attack_type === "sql_injection"
                                          ? "destructive"
                                          : log.attack_type === "brute_force"
                                            ? "destructive"
                                            : "outline"
                                      }
                                    >
                                      {log.attack_type.toUpperCase().replace("_", " ")}
                                    </Badge>
                                  </motion.div>
                                </div>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-muted-foreground">Time:</span>{" "}
                                    {new Date(log.timestamp).toLocaleString()}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">IP:</span> {log.ip_address}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Username:</span>{" "}
                                    <span className="font-mono">{log.username_attempt}</span>
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Password:</span>{" "}
                                    <span className="font-mono">{log.password_attempt}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {log.sql_query && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">SQL Query:</p>
                                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto font-mono">
                                      {log.sql_query}
                                    </pre>
                                  </div>
                                )}
                                {log.error_message && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Error:</p>
                                    <p className="text-xs text-destructive font-mono">{log.error_message}</p>
                                  </div>
                                )}
                                {log.user_agent && (
                                  <p className="text-xs text-muted-foreground">
                                    <span>User Agent:</span> {log.user_agent}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
