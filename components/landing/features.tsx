"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Smartphone, 
  Zap, 
  Lock, 
  TrendingUp, 
  Wallet, 
  BarChart3,
  ShieldCheck,
  CalendarRange,
  Scale,
  Users,
  Layers,
  Award
} from "lucide-react"
import { FadeIn } from "./web3-animations"

const walletFeatures = [
  {
    icon: Smartphone,
    title: "Multiple Wallet Support",
    description: "Connect with Freighter, StellarWalletsKit, or import your custom secret key with complete non-custodial safety.",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
  {
    icon: Lock,
    title: "Bank-Grade Key Security",
    description: "Your keys, your funds. Private keys stay encrypted locally in memory and are never transmitted to any server.",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-300",
  },
  {
    icon: Zap,
    title: "Instant Stellar Transfers",
    description: "Send and receive XLM and custom Stellar tokens with 5-second ledger finality and sub-cent fees.",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Balance Tracker",
    description: "Watch your balance update live with Horizon API SSE streaming. Track every payment and trustline instantly.",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-300",
  },
  {
    icon: Wallet,
    title: "Stellar Asset Management",
    description: "Add trustlines for USDC, EURC, and custom Stellar tokens. Manage all your crypto holdings in one clean dashboard.",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Ledger Transaction Explorer",
    description: "Complete transaction history with instant filtering, explorer hash links, and CSV export for accounting.",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-300",
  },
]

const flowFeatures = [
  {
    icon: ShieldCheck,
    title: "Soroban Smart Contract Vaults",
    description: "Non-custodial WASM smart contracts on Stellar that securely lock project funds until contract conditions are met.",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    icon: CalendarRange,
    title: "Milestone Progress Disbursement",
    description: "Break complex deals into verified stages. Client approves deliverable -> funds auto-disburse to freelancer.",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-300",
  },
  {
    icon: Scale,
    title: "Decentralized MultiSig Arbitration",
    description: "Fair 3-of-5 guardian keypair arbitration panel to resolve disputes and disburse funds without single points of failure.",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    icon: Users,
    title: "Role-Based Web3 Dashboards",
    description: "Dedicated interfaces for Clients (Depositors), Freelancers (Beneficiaries), and Arbitrators with full contract audit trails.",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    icon: Layers,
    title: "Sub-Cent Soroban Execution",
    description: "Execute complex smart contract operations on Stellar for less than $0.001 per transaction, making micro-escrows viable.",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-300",
  },
  {
    icon: Award,
    title: "Time-Locked Safety Refunds",
    description: "Automatic contract expiration timeouts protecting clients from unresponsive contractors with zero-fee refund claims.",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
]

interface FeaturesProps {
  mode?: "wallet" | "flow"
}

export function Features({ mode = "wallet" }: FeaturesProps) {
  const isWallet = mode === "wallet"
  const currentFeatures = isWallet ? walletFeatures : flowFeatures
  const sectionRef = useRef<HTMLElement>(null)

  // Duplicated sets for seamless infinite wrapping:
  // Card 6 is directly followed by Card 1 without any boundary glitch
  const loopCount = 6
  const loopFeatures = Array.from({ length: loopCount }, () => currentFeatures).flat()

  const [currentIndex, setCurrentIndex] = useState(currentFeatures.length * 2)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [enableTransition, setEnableTransition] = useState(true)

  // IntersectionObserver: Only animate if visible in viewport (saves CPU/GPU when scrolled away)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Auto-slide step timer (advances every 3.2s smoothly, pauses when hovered)
  useEffect(() => {
    if (!isVisible || isHovered) return

    const interval = setInterval(() => {
      setEnableTransition(true)
      setCurrentIndex((prev) => prev + 1)
    }, 3200)

    return () => clearInterval(interval)
  }, [isVisible, isHovered])

  // Seamless wrap-around reset without visual jump when nearing the loop boundary
  const handleTransitionEnd = () => {
    if (currentIndex >= currentFeatures.length * (loopCount - 1)) {
      setEnableTransition(false)
      setCurrentIndex(currentFeatures.length * 2)
    } else if (currentIndex < currentFeatures.length) {
      setEnableTransition(false)
      setCurrentIndex(currentFeatures.length * 2)
    }
  }

  // Reset index when switching mode
  useEffect(() => {
    setCurrentIndex(currentFeatures.length * 2)
    setEnableTransition(true)
  }, [mode, currentFeatures.length])

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.8) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-12 space-y-4 text-center">
            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${
              isWallet 
                ? "border-blue-500/20 bg-blue-500/10 text-blue-400" 
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}>
              {isWallet ? "LUMEN WALLET FEATURES" : "SOROBAN SMART CONTRACT ESCROW"}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {isWallet ? (
                <>
                  Powerful Features for{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Modern Crypto Users
                  </span>
                </>
              ) : (
                <>
                  On-Chain Milestone{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
                    Escrow Platform
                  </span>
                </>
              )}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isWallet 
                ? "Everything you need to manage your Stellar assets, send XLM, and execute non-custodial transactions."
                : "Establish trustless smart contract agreements, lock funds safely in Soroban vaults, and automate milestone payments."
              }
            </p>
          </div>
        </FadeIn>

        {/* Center-Focused Seamless Infinite Carousel */}
        <FadeIn delay={200}>
          <div 
            className="relative w-full overflow-hidden py-6 sm:py-8 [mask-image:linear-gradient(to_right,transparent,white_6%,white_94%,transparent)] [--card-w:min(310px,76vw)] [--gap:14px] sm:[--card-w:360px] sm:[--gap:24px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              onTransitionEnd={handleTransitionEnd}
              className={`flex items-center ${
                enableTransition ? "transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" : ""
              }`}
              style={{
                transform: `translateX(calc(50% - (${currentIndex} * (var(--card-w) + var(--gap))) - (var(--card-w) / 2)))`,
              }}
            >
              {loopFeatures.map((feature, index) => {
                const Icon = feature.icon
                const isCenter = index === currentIndex
                const realItemIndex = (index % currentFeatures.length) + 1

                return (
                  <div
                    key={`${feature.title}-${index}`}
                    style={{ width: "var(--card-w)", marginRight: "var(--gap)" }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`shrink-0 select-none rounded-2xl p-5 sm:p-7 transition-all duration-700 cursor-pointer ${
                      isCenter
                        ? isWallet
                          ? "scale-[1.02] sm:scale-105 z-20 border border-blue-500/50 bg-card/60 backdrop-blur-md shadow-[0_12px_40px_rgba(59,130,246,0.2),inset_0_1px_1px_0_rgba(147,197,253,0.3)] opacity-100"
                          : "scale-[1.02] sm:scale-105 z-20 border border-amber-500/50 bg-card/60 backdrop-blur-md shadow-[0_12px_40px_rgba(245,158,11,0.2),inset_0_1px_1px_0_rgba(251,191,36,0.3)] opacity-100"
                        : "scale-95 opacity-40 border border-white/[0.06] bg-card/30 backdrop-blur-sm"
                    }`}
                  >
                    {/* Top accent highlight for centered card */}
                    <div className={`h-[2px] w-full mb-3 sm:mb-4 rounded-full transition-opacity duration-500 ${
                      isCenter
                        ? isWallet
                          ? "bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-100"
                          : "bg-gradient-to-r from-amber-500 via-orange-400 to-transparent opacity-100"
                        : "opacity-0"
                    }`} />

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${feature.iconBg} ${feature.iconColor} transition-transform duration-300 shadow-inner ${
                          isCenter ? "scale-105 sm:scale-110" : ""
                        }`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className={`text-[10px] sm:text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                          isCenter
                            ? isWallet
                              ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                            : "bg-white/[0.03] text-muted-foreground/60 border-white/[0.06]"
                        }`}>
                          0{realItemIndex}
                        </span>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <h3 className={`text-base sm:text-lg font-semibold leading-tight transition-colors duration-300 ${
                          isCenter ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
