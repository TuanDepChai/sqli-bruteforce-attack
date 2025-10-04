"use client"

import { motion } from "framer-motion"
import { Shield, BookOpen, Terminal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { floatingAnimation } from "@/lib/animations"
import { ThemeToggle } from "@/components/theme-toggle"

export function AnimatedHeader() {
  return (
    <motion.header
      className="border-b border-border relative z-10 backdrop-blur-md bg-background/60"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="relative">
              <Shield className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <div>
            <motion.span 
              className="font-mono text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              SecLab
            </motion.span>
            <motion.div
              className="text-xs text-muted-foreground font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Security Training Platform
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link href="/help">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="backdrop-blur-sm bg-transparent hover:bg-white/10 border-white/20 hover:border-white/40 transition-all duration-300 group"
              >
                <BookOpen className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="group-hover:text-white transition-colors">Documentation</span>
              </Button>
            </motion.div>
          </Link>
          
          <Link href="/admin">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="backdrop-blur-sm bg-transparent hover:bg-white/10 border-white/20 hover:border-white/40 transition-all duration-300 group"
              >
                <Terminal className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="group-hover:text-white transition-colors">Admin Dashboard</span>
              </Button>
            </motion.div>
          </Link>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ThemeToggle />
          </motion.div>

          {/* Status Indicator */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-300 font-medium">Live</span>
          </motion.div>
        </div>
      </div>

      {/* Animated border */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1, delay: 0.8 }}
      />
    </motion.header>
  )
}

export function FloatingNavItem({ 
  children, 
  href, 
  icon: Icon, 
  delay = 0 
}: { 
  children: React.ReactNode
  href: string
  icon: any
  delay?: number
}) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="group"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="backdrop-blur-sm bg-transparent hover:bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300"
        >
          <Icon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="group-hover:text-white transition-colors">{children}</span>
        </Button>
      </motion.div>
    </Link>
  )
}
