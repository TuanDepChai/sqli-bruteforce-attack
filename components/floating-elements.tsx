"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
}

export function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const colors = [
      "bg-blue-400/20",
      "bg-purple-400/20", 
      "bg-pink-400/20",
      "bg-indigo-400/20",
      "bg-cyan-400/20"
    ]
    
    const newElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2
    }))
    
    setElements(newElements)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute rounded-full blur-sm ${element.color}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function FloatingIcons() {
  const icons = ["🔒", "🛡️", "🔑", "⚡", "🎯", "🚀", "💎", "⭐"]
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  )
}

export function ParticleSystem() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    life: number
  }>>([])

  useEffect(() => {
    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 100
    })

    const newParticles = Array.from({ length: 50 }, createParticle)
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1
        })).filter(particle => particle.life > 0)
        .concat(Array.from({ length: 2 }, createParticle))
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
          style={{
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}
