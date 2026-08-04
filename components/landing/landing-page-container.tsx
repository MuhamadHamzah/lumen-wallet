"use client"

import { useState, useEffect, useRef } from "react"
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

const transitionStyles = `
  @keyframes page-turn-clip {
    0% {
      clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 100% 100%, 0% 100%);
      -webkit-clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 100% 100%, 0% 100%);
    }
    50% {
      clip-path: polygon(0% 0%, 0% 0%, 100% 100%, 100% 100%, 0% 100%);
      -webkit-clip-path: polygon(0% 0%, 0% 0%, 100% 100%, 100% 100%, 0% 100%);
    }
    100% {
      clip-path: polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%);
      -webkit-clip-path: polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%);
    }
  }

  @keyframes page-crease-sweep {
    0% {
      transform: translate3d(90vw, -90vh, 0) rotate(-45deg);
    }
    100% {
      transform: translate3d(-130vw, 130vh, 0) rotate(-45deg);
    }
  }

  @keyframes paper-flutter {
    0%, 100% {
      transform: scale(1) rotate(0deg) translate(0, 0);
      filter: drop-shadow(-6px 6px 10px rgba(0,0,0,0.4));
    }
    20% {
      transform: scale(1.02) rotate(-1.5deg) translate(-1px, 2px);
      filter: drop-shadow(-10px 10px 14px rgba(0,0,0,0.45));
    }
    40% {
      transform: scale(0.99) rotate(0.5deg) translate(1px, -1px);
      filter: drop-shadow(-5px 5px 8px rgba(0,0,0,0.35));
    }
    60% {
      transform: scale(1.03) rotate(-2.5deg) translate(-2px, 3px);
      filter: drop-shadow(-12px 12px 18px rgba(0,0,0,0.5));
    }
    80% {
      transform: scale(0.98) rotate(1deg) translate(2px, -2px);
      filter: drop-shadow(-4px 4px 7px rgba(0,0,0,0.38));
    }
  }

  .page-turn-active {
    animation: page-turn-clip 950ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  .page-crease-active {
    animation: page-crease-sweep 950ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

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
    localStorage.setItem("lumen_has_torn", "true")

    // Let the front page roll out completely
    setTimeout(() => {
      setLandingMode((prev) => (prev === "wallet" ? "flow" : "wallet"))
      setDragOffset(0)
      setIsTransitioning(false)
    }, 950)
  }

  const handleCurlClick = () => {
    if (isTransitioning) return
    setShowTooltip(false)
    setDragOffset(threshold)
    setTimeout(() => {
      triggerTear()
    }, 50)
  }

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
      <style dangerouslySetInnerHTML={{ __html: transitionStyles }} />
      
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
        className={`relative z-10 transition-transform duration-300 ease-out ${
          isTransitioning ? "page-turn-active" : ""
        }`}
        style={{
          transformOrigin: "bottom left",
          transform: !isTransitioning && isDragging
            ? `rotate(-${Math.min(dragOffset * 0.02, 3)}deg)`
            : "none",
          transition: isTransitioning
            ? "none"
            : "transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          opacity: isTransitioning ? 0 : 1,
          clipPath: isTransitioning 
            ? undefined 
            : `polygon(0 0, calc(100% - ${currentCurlSize}px) 0, 100% ${currentCurlSize}px, 100% 100%, 0 100%)`,
          WebkitClipPath: isTransitioning 
            ? undefined 
            : `polygon(0 0, calc(100% - ${currentCurlSize}px) 0, 100% ${currentCurlSize}px, 100% 100%, 0 100%)`,
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
          className={`absolute top-0 right-0 z-30 select-none touch-none ${
            !isDragging ? "paper-flutter-active" : ""
          }`}
          style={{
            width: `${currentCurlSize}px`,
            height: `${currentCurlSize}px`,
          }}
        >
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing transition-shadow duration-300"
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

      {/* 3D Paper Crease / Cylinder Roll Overlay */}
      {isTransitioning && (
        <div
          className="page-crease-active fixed top-0 right-0 z-40 pointer-events-none origin-center"
          style={{
            width: "160px",
            height: "250vh",
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 15%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.9) 52%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0) 100%)",
            boxShadow: "-12px 12px 35px rgba(0,0,0,0.45)",
          }}
        />
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

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
