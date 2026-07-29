"use client"

import { Zap, Shield, Coins, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "./web3-animations"

interface HeroProps {
  onConnectClick: () => void
}

export function Hero({ onConnectClick }: HeroProps) {
  return (
    <div className="relative overflow-hidden pt-0 pb-16 sm:pt-2 sm:pb-24">
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
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-sm sm:max-w-md">
                  Your <br />
                  Gateway to <br />
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-amber-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] inline-block w-fit mt-2">
                    Stellar <br />
                    Payments
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

          {/* Right column - Interactive Wallet Mockup */}
          <FadeIn delay={300} direction="left">
            <div className="relative">
              {/* Outer glow matching logo */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-amber-500/10 blur-3xl rounded-3xl animate-pulse-glow" />

              {/* Main container */}
              <div className="relative bg-card rounded-3xl border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
                {/* Header Mock */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">GCBFQ3...SCDVY6</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Testnet</span>
                </div>

                {/* Balance Sneak Peek Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-amber-500/10 border border-white/[0.08] p-5 mb-6">
                  {/* Subtle top light reflection */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Estimated Balance</span>
                  <div className="text-3xl font-extrabold font-mono tracking-tight mt-1 flex items-baseline gap-1 text-foreground">
                    12,450.85 <span className="text-xs text-muted-foreground font-semibold">XLM</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-0.5">≈ $1,369.59 USD</div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-muted-foreground font-medium block">USDC Token</span>
                      <span className="font-mono font-bold mt-0.5 block text-foreground">1,250.00 USDC</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium block">Active Escrows</span>
                      <span className="font-mono font-bold mt-0.5 block text-amber-400">3 Milestones</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Web3 Escrow Contract Live Feed */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">Contract Execution Flow</span>

                  {/* Step 1 */}
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-xs">
                    <div className="size-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">Milestone 1 Funded</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">500 USDC locked on-chain</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Completed</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-xs">
                    <div className="size-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">Work Submitted</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Freelancer submitted deliverables</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Under Review</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-xs opacity-50">
                    <div className="size-6 rounded-lg bg-white/5 text-muted-foreground flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <div className="font-semibold">Funds Released</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Payment disbursed to freelancer</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full">Pending</span>
                  </div>
                </div>

                {/* Bottom Status bar */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Freighter Connected
                  </span>
                  <span>v2.0.4</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
