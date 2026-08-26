"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  delay?: number
}

export function AnimatedNumber({
  value,
  duration = 2000,
  decimals = 2,
  prefix = "",
  suffix = "",
  className = "",
  delay = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      setHasStarted(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    let animationFrameId: number
    let startTimestamp: number | null = null

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        
        // easeOutExpo easing: 1 - Math.pow(2, -10 * progress) for premium smooth glide
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        const current = easeProgress * value

        setDisplayValue(current)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step)
        } else {
          setDisplayValue(value)
        }
      }

      animationFrameId = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [hasStarted, value, duration, delay])

  const formatted = displayValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
