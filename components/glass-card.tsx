"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function GlassCard({ children, className = "", delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        rotateX: 2,
        rotateY: 2,
        transition: { duration: 0.2 },
      }}
      className={`relative backdrop-blur-xl bg-card/40 border border-border/50 rounded-lg overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
        }}
        whileHover={{
          opacity: 1,
          x: ["-100%", "200%"],
          transition: { duration: 0.8 },
        }}
      />

      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(120, 119, 198, 0.2), transparent)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
