"use client"

import { motion } from "framer-motion"

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
}

export function LoadingAnimation({ size = "md", color = "#3b82f6", className = "" }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-2 border-gray-200`}
        style={{ borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}

export function PulseLoading() {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function DotLoading() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function WaveLoading() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-1 bg-gradient-to-t from-blue-400 to-purple-500 rounded-full"
          style={{ height: "20px" }}
          animate={{
            scaleY: [1, 0.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}
