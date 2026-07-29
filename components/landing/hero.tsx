"use client"

import { Zap, Shield, Coins, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "./web3-animations"

interface HeroProps {
  onConnectClick: () => void
}

export function Hero({ onConnectClick }: HeroProps) {
  return (
    <div className="relative overflow-hidden py-20 sm:py-32">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left column */}
          <div className="space-y-8">
            <FadeIn delay={100}>
              <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                Powered by Stellar Network
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
                  Your Gateway to{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-amber-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                      Stellar Payments
                    </span>
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Send, receive, and manage XLM with ease. Connect your wallet securely using Freighter or WalletConnect.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={onConnectClick}
                  size="lg"
                  className="group h-13 rounded-xl px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  Connect Wallet
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 rounded-xl px-8 text-base font-medium border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={550}>
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-8 border-t border-white/[0.06]">
                {[
                  { value: "~5s", label: "Settlement" },
                  { value: "< $0.01", label: "Per Transaction" },
                  { value: "100%", label: "Non-custodial" },
                ].map((stat) => (
                  <div key={stat.label} className="group cursor-default">
                    <div className="text-lg sm:text-2xl font-bold text-foreground group-hover:text-blue-400 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right column - Card visual */}
          <FadeIn delay={300} direction="left">
            <div className="relative">
              {/* Outer glow matching logo */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-amber-500/10 blur-3xl rounded-3xl animate-pulse-glow" />

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-card/95 to-card/70 rounded-3xl border border-white/[0.08] p-8 shadow-2xl backdrop-blur-xl">
                {/* Subtle top accent line */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                <div className="space-y-4">
                  {[
                    {
                      icon: Coins,
                      title: "Your Wallet",
                      subtitle: "Balance",
                      iconBg: "bg-blue-500/10",
                      iconColor: "text-blue-400",
                      delay: 0,
                    },
                    {
                      icon: Shield,
                      title: "Top Priority",
                      subtitle: "Security",
                      iconBg: "bg-amber-500/10",
                      iconColor: "text-amber-400",
                      delay: 1,
                    },
                    {
                      icon: Zap,
                      title: "Instant Transfer",
                      subtitle: "Speed",
                      iconBg: "bg-blue-500/10",
                      iconColor: "text-blue-300",
                      delay: 2,
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="group flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.06] hover:border-blue-500/20 hover:bg-white/[0.06] transition-all duration-500"
                      style={{
                        animation: `slide-in-card 600ms cubic-bezier(0.16, 1, 0.3, 1) ${600 + index * 150}ms both`,
                      }}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">{item.subtitle}</div>
                        <div className="text-lg font-semibold">{item.title}</div>
                      </div>
                      <div className="h-8 w-16 rounded-lg overflow-hidden opacity-40">
                        <svg viewBox="0 0 64 32" className="w-full h-full">
                          <path
                            d={`M0,${20 + index * 2} Q16,${8 - index * 3} 32,${16 + index} T64,${10 - index * 2}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-blue-400"
                            style={{
                              strokeDasharray: 100,
                              strokeDashoffset: 100,
                              animation: `draw-line 1.5s ease-out ${1000 + index * 200}ms forwards`,
                            }}
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom status */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Connected to Stellar
                  </span>
                  <span className="font-mono text-blue-400/60">v2.0</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
