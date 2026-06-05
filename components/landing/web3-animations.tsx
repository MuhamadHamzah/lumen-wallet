"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  duration = 700,
  className = "",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1"
            el.style.transform = "translate3d(0, 0, 0)"
            el.style.filter = "blur(0px)"
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const getInitialTransform = () => {
    switch (direction) {
      case "up": return "translate3d(0, 30px, 0)"
      case "down": return "translate3d(0, -30px, 0)"
      case "left": return "translate3d(30px, 0, 0)"
      case "right": return "translate3d(-30px, 0, 0)"
      case "none": return "translate3d(0, 0, 0)"
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: getInitialTransform(),
        filter: "blur(8px)",
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  )
}

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({ children, className = "", glowColor }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty("--glow-x", `${x}px`)
      card.style.setProperty("--glow-y", `${y}px`)
    }

    card.addEventListener("mousemove", handleMouseMove)
    return () => card.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={cardRef}
      className={`glow-card ${className}`}
      style={{
        "--glow-color": glowColor || "rgba(139, 92, 246, 0.15)",
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

export function FloatingOrb({
  size = 300,
  color = "rgba(99, 102, 241, 0.15)",
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  size?: number
  color?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  delay?: number
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top,
        left,
        right,
        bottom,
        animation: `float ${8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        filter: "blur(40px)",
      }}
    />
  )
}
