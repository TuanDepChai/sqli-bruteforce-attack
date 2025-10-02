"use client"

import { motion } from "framer-motion"

export function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(120, 119, 198, 0.4) 0%, transparent 70%)",
        }}
        animate={{
          x: ["-10%", "110%"],
          y: ["10%", "80%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(120, 119, 198, 0.5) 0%, transparent 70%)",
        }}
        animate={{
          x: ["110%", "-10%"],
          y: ["80%", "10%"],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(120, 119, 198, 0.6) 0%, transparent 70%)",
        }}
        animate={{
          x: ["50%", "50%"],
          y: ["-10%", "110%"],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
