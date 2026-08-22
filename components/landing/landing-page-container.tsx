"use client"

import { useState, useEffect, useRef } from "react"
import { LandingShell } from "./landing-shell"
import { Hero } from "./hero"
import { Features } from "./features"
import { Testimonials3D } from "./testimonials-3d"
import { AuthModal } from "./auth-modal"
import { Web3Background } from "./web3-background"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"

interface LandingPageContainerProps {
  onConnectClick: () => void
  authModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
}

const transitionStyles = `
  @keyframes paper-flutter {
    0%, 100% {
      transform: scale(1) rotate(0deg) translate(0, 0);
      filter: drop-shadow(-4px 4px 6px rgba(0,0,0,0.3));
    }
    25% {
      transform: scale(1.03) rotate(-2deg) translate(-1px, 2px);
      filter: drop-shadow(-8px 8px 12px rgba(0,0,0,0.38));
    }
    50% {
      transform: scale(0.98) rotate(1deg) translate(1px, -1px);
      filter: drop-shadow(-3px 3px 5px rgba(0,0,0,0.25));
    }
    75% {
      transform: scale(1.04) rotate(-3deg) translate(-2px, 3px);
      filter: drop-shadow(-10px 10px 14px rgba(0,0,0,0.42));
    }
  }

  .paper-flutter-active {
    animation: paper-flutter 4.5s ease-in-out infinite;
  }
`

export function LandingPageContainer({
  onConnectClick,
  authModalOpen,
  setAuthModalOpen,
}: LandingPageContainerProps) {
  const [landingMode, setLandingMode] = useState<"wallet" | "flow">("wallet")
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Animated progress state (0 = normal, 1 = fully transitioned)
  const [progress, setProgress] = useState(0)

  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved landing mode from localStorage on mount (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("lumen_landing_mode")
      if (savedMode === "wallet" || savedMode === "flow") {
        setLandingMode(savedMode)
      }
    }
  }, [])

  // Drag & click trigger handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isTransitioning) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y
    const offset = Math.max(0, (deltaY - deltaX) / 1.1)
    setDragOffset(offset)

    const maxDrag = 250
    const currentProgress = Math.min(0.45, offset / maxDrag)
    setProgress(currentProgress)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)

    // Ultra-responsive: any click, tap, or drag triggers full paper roll
    triggerTear()
  }

  const triggerTear = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    localStorage.setItem("lumen_has_torn", "true")

    let startTime: number | null = null
    const duration = 2500 // Ultra-calm, slow, elegant 2.5s paper roll
    const startProgress = progress

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const t = Math.min(1, elapsed / duration)

      // Silky, slow, weightless quintic easeInOut curve
      const ease = t < 0.5 
        ? 16 * Math.pow(t, 5) 
        : 1 - Math.pow(-2 * t + 2, 5) / 2
      
      const currentProgress = startProgress + (1.0 - startProgress) * ease
      setProgress(currentProgress)

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        // Complete transition switch with ZERO position jump
        setLandingMode((prev) => {
          const nextMode = prev === "wallet" ? "flow" : "wallet"
          localStorage.setItem("lumen_landing_mode", nextMode)
          return nextMode
        })
        setProgress(0)
        setDragOffset(0)
        setIsTransitioning(false)
      }
    }
    requestAnimationFrame(animate)
  }

  const handleCurlClick = () => {
    if (isTransitioning) return
    triggerTear()
  }

  // Header and Footer mode switch buttons trigger the full 3D Paper Roll animation!
  const handleModeSwitch = (mode: "wallet" | "flow") => {
    if (isTransitioning) return
    if (mode === landingMode) return // Already in target mode
    triggerTear() // Trigger 3D paper roll animation!
  }

  const backMode = landingMode === "wallet" ? "flow" : "wallet"

  // 225deg Gradient Direction (Top-Right to Bottom-Left roll reveal):
  const maskStart = progress * 135 - 20
  const maskEnd = maskStart + 18

  // Dynamic 3D Paper Roll Math:
  const creaseX = 75 - progress * 150
  const creaseY = -75 + progress * 150
  
  // 3D paper roll dynamics: 3D perspective tilt + rolling flex
  const flexAngle = -45 + Math.sin(progress * Math.PI) * 6
  const rotateX = Math.sin(progress * Math.PI) * 14 // 3D paper lift pitch
  const rotateY = -Math.sin(progress * Math.PI) * 10 // 3D paper lift yaw
  const rollScale = 1 + Math.sin(progress * Math.PI) * 0.12 // 3D roll cylinder swells in mid-flight

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-background">
      <style dangerouslySetInnerHTML={{ __html: transitionStyles }} />
      
      {/* Background blobs synced to state */}
      <Web3Background mode={landingMode} />

      {/* Global Permanent Fixed Navbar - Optical Glass Magnifier Lens */}
      <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl rounded-2xl border border-white/25 dark:border-white/15 bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl backdrop-saturate-200 backdrop-contrast-125 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 ${
        isTransitioning ? "opacity-0 pointer-events-none -translate-y-4" : "opacity-100 translate-y-0"
      }`}>
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            {/* Header Mode Switcher (Tab indicator) */}
            <div className="hidden sm:flex items-center gap-1 bg-white/[0.05] dark:bg-white/[0.03] border border-white/15 rounded-xl p-0.5 text-[11px] backdrop-blur-md">
              <button
                onClick={() => handleModeSwitch("wallet")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  mounted && landingMode === "wallet"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                }`}
              >
                Wallet
              </button>
              <button
                onClick={() => handleModeSwitch("flow")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  mounted && landingMode === "flow"
                    ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                    : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                }`}
              >
                Flow Escrow
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NetworkSwitcher />
            <ThemeToggle />
            <Button
              onClick={onConnectClick}
              className={`rounded-xl px-4 sm:px-5 py-2 font-semibold border-0 shadow-lg transition-transform duration-200 hover:scale-[1.02] text-xs sm:text-sm h-9 text-white ${
                !mounted
                  ? "bg-primary/80 opacity-60"
                  : landingMode === "wallet"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/20 hover:shadow-blue-500/35"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20 hover:shadow-amber-500/35"
              }`}
              size="sm"
            >
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="inline sm:hidden">Connect</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Render Page B (Revealed Page Underneath) - Only active during transition */}
      {isTransitioning && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            opacity: Math.min(1, 0.6 + progress * 0.4),
            transform: `scale(${0.97 + progress * 0.03})`,
            transformOrigin: "center center",
          }}
        >
          <LandingShell onConnectClick={onConnectClick} mode={backMode} hideHeader={true}>
            <Hero key={`hero-${backMode}`} onConnectClick={onConnectClick} mode={backMode} />
            <Features key={`features-${backMode}`} mode={backMode} />
            <Testimonials3D key={`testimonials-${backMode}`} mode={backMode} />
          </LandingShell>
        </div>
      )}

      {/* Render Page A (Active Front Page) */}
      <div
        className="relative z-10 w-full h-full origin-top-right"
        style={{
          maskImage: (progress > 0)
            ? `linear-gradient(225deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${maskStart}%, rgba(0,0,0,1) ${maskEnd}%, rgba(0,0,0,1) 100%)`
            : "none",
          WebkitMaskImage: (progress > 0)
            ? `linear-gradient(225deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${maskStart}%, rgba(0,0,0,1) ${maskEnd}%, rgba(0,0,0,1) 100%)`
            : "none",
          transform: progress > 0 
            ? `perspective(1800px) rotate3d(-0.7, 1, 0.15, ${progress * 25}deg) translateZ(${progress * 20}px)` 
            : "none",
          transformStyle: "preserve-3d",
        }}
      >
        <LandingShell onConnectClick={onConnectClick} mode={landingMode} onModeSwitch={handleModeSwitch} hideHeader={true}>
          <Hero key={`hero-${landingMode}`} onConnectClick={onConnectClick} mode={landingMode} />
          <Features key={`features-${landingMode}`} mode={landingMode} />
          <Testimonials3D key={`testimonials-${landingMode}`} mode={landingMode} />
        </LandingShell>
      </div>

      {/* 3D Rolling Paper Scroll Cylinder (The physical 3D paper cylinder rolling down the screen) */}
      {(progress > 0 || isTransitioning) && (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden [perspective:1400px]">
          <div
            className="absolute pointer-events-none origin-center"
            style={{
              left: "50%",
              top: "50%",
              width: "180px",
              height: "320vh",
              transform: `translate3d(calc(-50% + ${creaseX}vw), calc(-50% + ${creaseY}vh), ${progress * 20}px) rotateZ(${flexAngle}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${rollScale})`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* The 3D Rolled Paper Scroll Cylinder */}
            <div
              className="h-full w-full"
              style={{
                borderRadius: "90px",
                background: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 20%, rgba(255,255,255,0.4) 48%, rgba(255,255,255,0.7) 52%, rgba(30,41,59,0.9) 80%, rgba(15,23,42,0) 100%)",
                boxShadow: "-20px 20px 35px rgba(0,0,0,0.65), inset 4px 0 12px rgba(255,255,255,0.15)",
              }}
            />
          </div>
        </div>
      )}

      {/* Dynamic 3D Page Flip Edge Shadow (casts natural shadow on underlying page as paper rolls) */}
      {progress > 0 && (
        <div 
          className="fixed inset-0 z-20 pointer-events-none transition-none"
          style={{
            background: `radial-gradient(circle at 100% 0%, rgba(0,0,0,${Math.sin(progress * Math.PI) * 0.45}) 0%, transparent 65%)`,
          }}
        />
      )}

      {/* Page Peel 3D Corner Hotspot Flap (Enlarged 140px Hotspot area & instant click response) */}
      {!isTransitioning && !isDragging && (
        <div
          className="absolute top-0 right-0 z-40 select-none touch-none paper-flutter-active cursor-pointer"
          style={{
            width: "140px",
            height: "140px",
          }}
          onPointerDown={handlePointerDown}
          onClick={handleCurlClick}
        >
          <svg
            className="w-full h-full cursor-pointer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Curved back flap corner */}
            <path
              d="M 0,0 Q 25,65 0,100 L 100,100 Z"
              fill="url(#curl-gradient)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.8"
            />
            <defs>
              <linearGradient id="curl-gradient" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#1e293b" stopOpacity="0.7" />
                <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Invisible larger drag trigger for hot-spot dragging */}
      {!isTransitioning && isDragging && (
        <div
          className="fixed inset-0 z-50 cursor-grabbing"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
