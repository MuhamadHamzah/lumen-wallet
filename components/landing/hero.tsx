"use client"

import { Zap, Shield, Coins, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn, FloatingOrb } from "./web3-animations"

interface HeroProps {
  onConnectClick: () => void
}

export function Hero({ onConnectClick }: HeroProps) {
  return (
    <div className="relative overflow-hidden py-20 sm:py-32">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb
          size={500}
          color="rgba(99, 102, 241, 0.12)"
          top="-15%"
          right="-10%"
          delay={0}
        />
        <FloatingOrb
          size={400}
          color="rgba(168, 85, 247, 0.10)"
          bottom="-10%"
          left="-5%"
          delay={2}
        />
        <FloatingOrb
          size={250}
          color="rgba(59, 130, 246, 0.08)"
          top="40%"
          left="60%"
          delay={4}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <FadeIn delay={100}>
              <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                Powered by Stellar Network
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
                  Your Gateway to{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
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
                  className="group h-13 rounded-xl px-8 text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  Connect Wallet
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 rounded-xl px-8 text-base font-semibold border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-purple-500/30 transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={550}>
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/30">
                {[
                  { value: "~5s", label: "Settlement" },
                  { value: "< $0.01", label: "Per Transaction" },
                  { value: "100%", label: "Non-custodial" },
                ].map((stat, i) => (
                  <div key={stat.label} className="group cursor-default">
                    <div className="text-2xl font-bold text-foreground group-hover:text-purple-400 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right column - Animated Visual */}
          <FadeIn delay={300} direction="left">
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl animate-pulse-slow" />

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-card/90 to-muted/30 rounded-3xl border border-border/50 p-8 shadow-2xl backdrop-blur-xl">
                {/* Decorative corner dots */}
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400/60" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
                  <div className="h-2 w-2 rounded-full bg-green-400/60" />
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Coins,
                      title: "Your Wallet",
                      subtitle: "Balance",
                      color: "from-indigo-500/20 to-blue-500/20",
                      iconColor: "text-indigo-400",
                      delay: 0,
                    },
                    {
                      icon: Shield,
                      title: "Top Priority",
                      subtitle: "Security",
                      color: "from-purple-500/20 to-violet-500/20",
                      iconColor: "text-purple-400",
                      delay: 1,
                    },
                    {
                      icon: Zap,
                      title: "Instant Transfer",
                      subtitle: "Speed",
                      color: "from-emerald-500/20 to-green-500/20",
                      iconColor: "text-emerald-400",
                      delay: 2,
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="group flex items-center gap-4 rounded-2xl bg-background/40 p-4 backdrop-blur-sm border border-border/30 hover:border-purple-500/30 transition-all duration-500 hover:bg-background/60"
                      style={{
                        animation: `slideInCard 600ms cubic-bezier(0.16, 1, 0.3, 1) ${600 + index * 150}ms both`,
                      }}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">{item.subtitle}</div>
                        <div className="text-lg font-semibold">{item.title}</div>
                      </div>
                      <div className="h-8 w-16 rounded-lg overflow-hidden opacity-40">
                        {/* Mini sparkline */}
                        <svg viewBox="0 0 64 32" className="w-full h-full">
                          <path
                            d={`M0,${20 + index * 2} Q16,${8 - index * 3} 32,${16 + index} T64,${10 - index * 2}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-purple-400"
                            style={{
                              strokeDasharray: 100,
                              strokeDashoffset: 100,
                              animation: `drawLine 1.5s ease-out ${1000 + index * 200}ms forwards`,
                            }}
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom decoration */}
                <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Connected to Stellar
                  </span>
                  <span className="font-mono">Testnet</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
