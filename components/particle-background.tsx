"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  pulsePhase: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: Particle[] = []
    const particleCount = 80

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        hue: 250 + Math.random() * 30,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    let frame = 0
    let animationId: number

    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.x += particle.vx + Math.sin(frame * 0.01 + index) * 0.1
        particle.y += particle.vy + Math.cos(frame * 0.01 + index) * 0.1

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        const pulse = Math.sin(frame * 0.05 + particle.pulsePhase) * 0.3 + 0.7
        const currentSize = particle.size * pulse

        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, currentSize * 3)
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity * pulse})`)
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity * pulse * 0.3})`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`
        ctx.fill()
      })

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 180) {
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
            const opacity = 0.2 * (1 - distance / 180)
            gradient.addColorStop(0, `hsla(${p1.hue}, 70%, 60%, ${opacity})`)
            gradient.addColorStop(1, `hsla(${p2.hue}, 70%, 60%, ${opacity})`)

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  )
}
