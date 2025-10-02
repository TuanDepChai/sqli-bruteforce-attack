"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Terminal, AlertTriangle, Sparkles, BookOpen } from "lucide-react"
import Link from "next/link"
import { fadeInUp, slideInLeft, staggerContainer } from "@/lib/animations"
import { ParticleBackground } from "@/components/particle-background"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: "Network error" })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Header */}
      <motion.header
        className="border-b border-border relative z-10 backdrop-blur-sm bg-background/80"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-mono text-lg font-semibold">SecLab</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <Link href="/help">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </motion.div>
            </Link>
            <Link href="/admin">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <Terminal className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Info */}
          <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <motion.h1
                className="text-4xl font-bold mb-4 text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Security Training Platform
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Practice penetration testing in a safe, controlled environment. This application is intentionally
                vulnerable for educational purposes.
              </motion.p>
            </motion.div>

            <motion.div variants={slideInLeft}>
              <Card className="bg-card/50 border-warning/20 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="w-5 h-5" />
                    Educational Purpose Only
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "SQL Injection Vulnerable", desc: "Try: admin' OR '1'='1" },
                    { title: "No Rate Limiting", desc: "Brute force attacks allowed" },
                    { title: "Comprehensive Logging", desc: "All attempts are logged" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary mt-2"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideInLeft} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Default Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-mono text-sm space-y-1 text-muted-foreground">
                  {["admin / admin123", "user / password", "john / john2024"].map((cred, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {cred}
                    </motion.p>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-border/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Authentication
                </CardTitle>
                <CardDescription>Enter your credentials to access the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-secondary/50 transition-all duration-200 focus:scale-[1.02]"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="bg-secondary/50 transition-all duration-200 focus:scale-[1.02]"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button type="submit" className="w-full relative overflow-hidden group" disabled={loading}>
                      <motion.span
                        className="relative z-10"
                        animate={loading ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {loading ? "Authenticating..." : "Sign In"}
                      </motion.span>
                      {!loading && (
                        <motion.div
                          className="absolute inset-0 bg-primary/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </form>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      className={`mt-4 ${result.success ? "border-primary/50 bg-primary/10" : "border-destructive/50 bg-destructive/10"}`}
                    >
                      <AlertDescription className="space-y-2">
                        <p className="font-medium">{result.message}</p>
                        {result.user && (
                          <motion.div
                            className="text-sm font-mono bg-background/50 p-3 rounded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <p>User ID: {result.user.id}</p>
                            <p>Username: {result.user.username}</p>
                            <p>Role: {result.user.role}</p>
                          </motion.div>
                        )}
                        {result.vulnerability && (
                          <motion.p
                            className="text-warning font-medium"
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          >
                            ⚠️ {result.vulnerability}
                          </motion.p>
                        )}
                        {result.error && (
                          <div className="text-sm font-mono bg-background/50 p-3 rounded">
                            <p className="text-destructive">{result.error}</p>
                            {result.query && <p className="mt-2 text-muted-foreground">Query: {result.query}</p>}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="border-t border-border py-6 relative z-10 backdrop-blur-sm bg-background/80"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>⚠️ This is a deliberately vulnerable application for security training purposes only.</p>
          <p className="mt-1">Never deploy this to production or use with real data.</p>
        </div>
      </motion.footer>
    </div>
  )
}
