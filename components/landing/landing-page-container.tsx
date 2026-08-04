"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { HelpCircle } from "lucide-react"
import { LandingShell } from "./landing-shell"
import { Hero } from "./hero"
import { Features } from "./features"
import { AuthModal } from "./auth-modal"
import { Web3Background } from "./web3-background"

interface LandingPageContainerProps {
  onConnectClick: () => void
  authModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
  speedX: number
  speedY: number
  opacity: number
}

export function LandingPageContainer({
  onConnectClick,
  authModalOpen,
  setAuthModalOpen,
}: LandingPageContainerProps) {
  const [landingMode, setLandingMode] = useState<"wallet" | "flow">("wallet")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const particleIdRef = useRef(0)

  // Show tooltip on first visit if they haven't interacted yet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasTorn = localStorage.getItem("lumen_has_torn")
      if (!hasTorn) {
        const timer = setTimeout(() => {
          setShowTooltip(true)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [landingMode])

  // Core curl size. Base size is 90px. Max drag is 250px (total 340px).
  const baseSize = 90
  const threshold = 180 // drag distance required to trigger tear
  const maxDrag = 250
  const currentCurlSize = baseSize + Math.min(dragOffset, maxDrag)

  // Create paper tear particles
  const spawnParticles = useCallback(() => {
    if (typeof window === "undefined") return

    const newParticles: Particle[] = []
    const count = 25
    const windowWidth = window.innerWidth
    const startX = windowWidth - currentCurlSize / 2
    const startY = currentCurlSize / 2
    const color = landingMode === "wallet" ? "#3b82f6" : "#f97316" // Blue particles for Wallet, Orange for Flow

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: startX + (Math.random() - 0.5) * 60,
        y: startY + (Math.random() - 0.5) * 60,
        size: Math.random() * 8 + 4,
        color,
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.6) * 5 - 2, // Drift leftwards
        speedY: Math.random() * 4 + 2, // Fall downwards
        opacity: 0.9,
      })
    }

    setParticles((prev) => [...prev, ...newParticles])
  }, [currentCurlSize, landingMode])

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTransitioning) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    // Capture pointer to track movements outside the curl element
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setShowTooltip(false)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y
    // Down-left is positive deltaY and negative deltaX
    const offset = Math.max(0, (deltaY - deltaX) / 1.5)
    setDragOffset(offset)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)

    if (dragOffset >= threshold) {
      triggerTear()
    } else {
      // Elastic snap back
      setDragOffset(0)
    }
  }

  const triggerTear = () => {
    setIsTransitioning(true)
    spawnParticles()
    localStorage.setItem("lumen_has_torn", "true")

    // Let the front page fall down completely
    setTimeout(() => {
      setLandingMode((prev) => (prev === "wallet" ? "flow" : "wallet"))
      setDragOffset(0)
      setIsTransitioning(false)
    }, 850)
  }

  const handleCurlClick = () => {
    if (isTransitioning) return
    setShowTooltip(false)
    setDragOffset(threshold)
    setTimeout(() => {
      triggerTear()
    }, 50)
  }

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return

    const updateParticles = () => {
      setParticles((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.x * 0.001 + p.speedX,
            y: p.y + p.speedY,
            speedY: p.speedY + 0.18, // Gravity
            rotation: p.rotation + 4,
            opacity: Math.max(0, p.opacity - 0.015),
          }))
          .filter((p) => p.opacity > 0 && p.y < window.innerHeight)
      })
      animationFrameRef.current = requestAnimationFrame(updateParticles)
    }

    animationFrameRef.current = requestAnimationFrame(updateParticles)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [particles])

  // Shortcut handler from footer
  const handleModeSwitch = (mode: "wallet" | "flow") => {
    if (isTransitioning) return
    setLandingMode(mode)
    setDragOffset(0)
  }

  // Back page mode
  const backMode = landingMode === "wallet" ? "flow" : "wallet"

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#070b19]">
      {/* Background blobs synced to state */}
      <Web3Background mode={landingMode} />

      {/* Render the background (underneath) page */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-45 scale-95 filter blur-[2px]">
        <LandingShell onConnectClick={onConnectClick} mode={backMode}>
          <Hero onConnectClick={onConnectClick} mode={backMode} />
          <Features mode={backMode} />
        </LandingShell>
      </div>

      {/* Render the active front page with page-peel transformation */}
      <div
        className="relative z-10 transition-transform duration-300 ease-out"
        style={{
          transformOrigin: "bottom left",
          transform: isTransitioning
            ? "translate3d(-20vw, 120vh, 0) rotate(-12deg) scale(0.95)"
            : isDragging
              ? `rotate(-${Math.min(dragOffset * 0.02, 3)}deg)`
              : "none",
          transition: isTransitioning
            ? "transform 850ms cubic-bezier(0.25, 1, 0.50, 1), opacity 800ms ease"
            : isDragging
              ? "none"
              : "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          opacity: isTransitioning ? 0 : 1,
          clipPath: `polygon(0 0, calc(100% - ${currentCurlSize}px) 0, 100% ${currentCurlSize}px, 100% 100%, 0 100%)`,
          WebkitClipPath: `polygon(0 0, calc(100% - ${currentCurlSize}px) 0, 100% ${currentCurlSize}px, 100% 100%, 0 100%)`,
        }}
      >
        <LandingShell onConnectClick={onConnectClick} mode={landingMode} onModeSwitch={handleModeSwitch}>
          <Hero onConnectClick={onConnectClick} mode={landingMode} />
          <Features mode={landingMode} />
        </LandingShell>
      </div>

      {/* Page Peel 3D Flap (Curl) */}
      {!isTransitioning && (
        <div
          className="absolute top-0 right-0 z-30 select-none touch-none"
          style={{
            width: `${currentCurlSize}px`,
            height: `${currentCurlSize}px`,
          }}
        >
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing drop-shadow-[-8px_8px_16px_rgba(0,0,0,0.55)] transition-shadow duration-300"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={handleCurlClick}
          >
            {/* Curled back flap triangle */}
            <path
              d="M 0,0 Q 25,65 0,100 L 100,100 Z"
              fill="url(#curl-gradient)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
            />
            <defs>
              <linearGradient id="curl-gradient" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#334155" />
                <stop offset="60%" stopColor="#475569" />
                <stop offset="85%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Pulsing Guide Tooltip */}
      {showTooltip && !isDragging && !isTransitioning && (
        <div className="absolute top-24 right-6 z-40 max-w-xs animate-bounce pointer-events-none">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-white/10 relative">
            <span>Psst... Seret atau klik pojok kertas ini untuk beralih ke {landingMode === "wallet" ? "Lumen Flow Escrow" : "Lumen Wallet"}! 📄✨</span>
            {/* Triangle indicator */}
            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-blue-600 rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Particle Elements */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute z-20 pointer-events-none rounded-sm"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            boxShadow: `0 2px 4px ${p.color}44`,
            transition: "opacity 100ms linear",
          }}
        />
      ))}

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
