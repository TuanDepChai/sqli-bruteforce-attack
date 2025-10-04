"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Terminal, AlertTriangle, Sparkles, BookOpen, Eye, EyeOff, Zap, Target, User } from "lucide-react"
import Link from "next/link"
import { fadeInUp, staggerContainer, bounceIn, floatingAnimation } from "@/lib/animations"
import { ParticleBackground } from "@/components/particle-background"
import { AnimatedGradientBg } from "@/components/animated-gradient-bg"
import { GlassCard } from "@/components/glass-card"
import { FloatingElements, FloatingIcons, ParticleSystem } from "@/components/floating-elements"
import { AnimatedInput, FloatingLabelInput } from "@/components/animated-input"
import { InteractiveButton, AnimatedSubmitButton } from "@/components/interactive-button"
import { LoadingAnimation, PulseLoading, DotLoading, WaveLoading } from "@/components/loading-animation"
import { AnimatedResultDisplay } from "@/components/result-display"
import { AnimatedHeader } from "@/components/animated-header"

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
      <AnimatedGradientBg />
      <FloatingElements />
      <FloatingIcons />
      <ParticleSystem />

      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Header */}
      <AnimatedHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Info */}
          <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeInUp}>
              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-6 text-balance bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Security Training Platform
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-xl leading-relaxed mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Master cybersecurity skills through hands-on practice in a controlled, intentionally vulnerable environment.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-2 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {["SQL Injection", "Brute Force", "XSS", "CSRF", "Authentication Bypass"].map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05, backgroundColor: "var(--primary)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <GlassCard delay={0.2}>
              <Card className="bg-transparent border-0 border-warning/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <motion.div
                      animate={{
                        rotate: [0, -5, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                      }}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </motion.div>
                    Educational Purpose Only
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { 
                      title: "SQL Injection Vulnerable", 
                      desc: "Try: admin' OR '1'='1", 
                      icon: <Terminal className="w-4 h-4" />,
                      color: "text-red-500"
                    },
                    { 
                      title: "Brute Force Enabled", 
                      desc: "No rate limiting on login attempts", 
                      icon: <Zap className="w-4 h-4" />,
                      color: "text-orange-500"
                    },
                    { 
                      title: "Real-time Logging", 
                      desc: "All attacks logged to MongoDB + files", 
                      icon: <Eye className="w-4 h-4" />,
                      color: "text-blue-500"
                    },
                    { 
                      title: "Security Analytics", 
                      desc: "AI-powered attack detection", 
                      icon: <Target className="w-4 h-4" />,
                      color: "text-green-500"
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        className={`p-2 rounded-lg bg-background/50 ${item.color}`}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                      >
                        {item.icon}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </GlassCard>

            <GlassCard delay={0.4}>
              <Card className="bg-transparent border-0">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                    Default Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { user: "admin", pass: "Admin123!@#", role: "Administrator", color: "text-red-500" },
                    { user: "security", pass: "Security123!@#", role: "Security Analyst", color: "text-orange-500" },
                    { user: "john", pass: "John123!@#", role: "Regular User", color: "text-blue-500" },
                    { user: "sarah", pass: "Sarah123!@#", role: "Regular User", color: "text-green-500" },
                    { user: "test", pass: "Test123!@#", role: "Test Account", color: "text-purple-500" },
                  ].map((cred, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{
                        x: 5,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                        />
                        <div>
                          <p className="font-mono text-sm font-medium">
                            <span className={cred.color}>{cred.user}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-primary">{cred.pass}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{cred.role}</p>
                        </div>
                      </div>
                      <motion.div
                        className="text-xs text-muted-foreground"
                        whileHover={{ scale: 1.1 }}
                      >
                        Click to copy
                      </motion.div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </GlassCard>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <GlassCard>
              <Card className="border-0 bg-transparent shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                    Authentication
                  </CardTitle>
                  <CardDescription>Enter your credentials to access the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <FloatingLabelInput
                        label="Username"
                        type="text"
                        value={username}
                        onChange={setUsername}
                        placeholder="Enter your username"
                        icon={<User className="w-5 h-5" />}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FloatingLabelInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                        icon={<Lock className="w-5 h-5" />}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <AnimatedSubmitButton
                        type="submit"
                        loading={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <div className="flex items-center gap-3">
                            <WaveLoading />
                            <span>Authenticating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            <span>Login</span>
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </AnimatedSubmitButton>
                    </motion.div>
                  </form>

                  <AnimatedResultDisplay result={result} />
                </CardContent>
              </Card>
            </GlassCard>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="border-t border-border py-6 relative z-10 backdrop-blur-md bg-background/60"
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
