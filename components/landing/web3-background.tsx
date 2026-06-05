"use client"

import { useEffect, useRef } from "react"

export function Web3Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    let connections: Connection[] = []
    let mouseX = 0
    let mouseY = 0

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
      pulseSpeed: number
      pulsePhase: number
    }

    interface Connection {
      from: number
      to: number
      opacity: number
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const colors = [
      "rgba(99, 102, 241, ", // indigo
      "rgba(139, 92, 246, ", // violet
      "rgba(59, 130, 246, ", // blue
      "rgba(14, 165, 233, ", // sky
      "rgba(168, 85, 247, ", // purple
    ]

    const createParticles = () => {
      const count = Math.min(80, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 12000))
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    const drawParticle = (p: Particle, time: number) => {
      const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.3 + 0.7
      const currentOpacity = p.opacity * pulse
      const currentRadius = p.radius * (0.8 + pulse * 0.4)

      // Glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 4)
      gradient.addColorStop(0, p.color + (currentOpacity * 0.8).toFixed(3) + ")")
      gradient.addColorStop(0.5, p.color + (currentOpacity * 0.2).toFixed(3) + ")")
      gradient.addColorStop(1, p.color + "0)")
      ctx.beginPath()
      ctx.arc(p.x, p.y, currentRadius * 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2)
      ctx.fillStyle = p.color + currentOpacity.toFixed(3) + ")"
      ctx.fill()
    }

    const drawConnections = (time: number) => {
      const maxDist = 150
      connections = []
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15
            const pulse = Math.sin(time * 0.001 + i + j) * 0.5 + 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${(opacity * pulse).toFixed(3)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const drawOrbitalRing = (
      cx: number,
      cy: number,
      radiusX: number,
      radiusY: number,
      rotation: number,
      time: number,
      color: string,
      speed: number
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)

      // Draw ring
      ctx.beginPath()
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = 0.8
      ctx.stroke()

      // Draw orbiting dot
      const angle = time * speed
      const dotX = Math.cos(angle) * radiusX
      const dotY = Math.sin(angle) * radiusY
      const dotGradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6)
      dotGradient.addColorStop(0, "rgba(139, 92, 246, 0.8)")
      dotGradient.addColorStop(1, "rgba(139, 92, 246, 0)")
      ctx.beginPath()
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
      ctx.fillStyle = dotGradient
      ctx.fill()
      ctx.beginPath()
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.fill()

      ctx.restore()
    }

    const animate = (time: number) => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)

      // Update & draw particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Mouse interaction - subtle attraction
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          p.vx += (dx / dist) * 0.01
          p.vy += (dy / dist) * 0.01
        }

        // Dampen velocity
        p.vx *= 0.999
        p.vy *= 0.999

        // Wrap around
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        drawParticle(p, time)
      })

      // Draw connections
      drawConnections(time)

      // Draw orbital rings
      drawOrbitalRing(
        w * 0.7, h * 0.3,
        120, 60,
        Math.PI * 0.15,
        time * 0.001,
        "rgba(99, 102, 241, 0.08)",
        0.8
      )
      drawOrbitalRing(
        w * 0.7, h * 0.3,
        180, 90,
        -Math.PI * 0.1,
        time * 0.001,
        "rgba(139, 92, 246, 0.06)",
        -0.5
      )
      drawOrbitalRing(
        w * 0.3, h * 0.7,
        100, 50,
        Math.PI * 0.3,
        time * 0.001,
        "rgba(59, 130, 246, 0.07)",
        0.6
      )

      animationId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    resize()
    createParticles()
    animationId = requestAnimationFrame(animate)

    window.addEventListener("resize", () => {
      resize()
      createParticles()
    })
    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ opacity: 0.7 }}
    />
  )
}
