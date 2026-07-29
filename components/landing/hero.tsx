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
          {/* Left column - Content */}
          <div className="space-y-8">
            <FadeIn delay={100}>
              <div className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                Powered by Stellar Network
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
                  Your Gateway to{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
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
                  className="group h-13 rounded-xl px-8 text-base font-medium bg-teal-500 hover:bg-teal-400 text-white border-0 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300"
                >
                  Connect Wallet
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 rounded-xl px-8 text-base font-medium border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-teal-500/30 transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={550}>
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-8 border-t border-border/30">
                {[
                  { value: "~5s", label: "Settlement" },
                  { value: "< $0.01", label: "Per Transaction" },
                  { value: "100%", label: "Non-custodial" },
                ].map((stat) => (
                  <div key={stat.label} className="cursor-default">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right column - Visual */}
          <FadeIn delay={300} direction="left">
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-card/90 rounded-3xl border border-border/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="space-y-4">
                  {[
                    {
                      icon: Coins,
                      title: "Your Wallet",
                      subtitle: "Balance",
                      delay: 0,
                    },
                    {
                      icon: Shield,
                      title: "Top Priority",
                      subtitle: "Security",
                      delay: 1,
                    },
                    {
                      icon: Zap,
                      title: "Instant Transfer",
                      subtitle: "Speed",
                      delay: 2,
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="group flex items-center gap-4 rounded-2xl bg-background/40 p-4 backdrop-blur-sm border border-border/30 hover:border-teal-500/30 transition-all duration-500"
                      style={{
                        animation: `slideInCard 600ms cubic-bezier(0.16, 1, 0.3, 1) ${600 + index * 150}ms both`,
                      }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-105 transition-transform duration-300">
                        <item.icon className="h-6 w-6" />
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
                            className="text-teal-400"
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
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                    </span>
                    Connected to Stellar
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
