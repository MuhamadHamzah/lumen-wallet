"use client"

import { useState } from "react"
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, Clock, Cpu, ArrowUpRight, Scale, TrendingUp, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "./web3-animations"

interface HeroProps {
  onConnectClick: () => void
  mode?: "wallet" | "flow"
}

const coolAnimationStyles = `
  @keyframes stroke-draw {
    0% { stroke-dashoffset: 400; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes border-beam {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
  }

  .animate-chart-line {
    stroke-dasharray: 400;
    animation: stroke-draw 3s ease-out infinite alternate;
  }

  .border-beam-glow {
    background-size: 200% 200%;
    animation: border-beam 4s ease infinite;
  }
`

export function Hero({ onConnectClick, mode = "wallet" }: HeroProps) {
  const isWallet = mode === "wallet"

  return (
    <div className="relative overflow-hidden pt-0 pb-16 sm:pt-2 sm:pb-24">
      <style dangerouslySetInnerHTML={{ __html: coolAnimationStyles }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* PAGE 1: LUMEN WALLET (Clean Split Hero) */}
        {/* ========================================================= */}
        {isWallet ? (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left column */}
            <div className="space-y-8">
              <FadeIn delay={100}>
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md shadow-lg shadow-blue-500/10">
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
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 inline-block w-fit mt-2">
                      Stellar <br /> Payments
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Send, receive, and manage XLM with ease. Connect your wallet securely using Freighter, StellarWalletsKit, or custom keypairs.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={400}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    onClick={onConnectClick}
                    size="lg"
                    className="group h-13 rounded-xl px-8 text-base font-semibold border-0 shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400"
                  >
                    Connect Wallet
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-13 rounded-xl px-8 text-base font-medium border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-blue-500/30"
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
                      <div className="text-lg sm:text-2xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right column - Personal Wallet Card */}
            <FadeIn delay={300} direction="left">
              <div className="relative">
                <div className="absolute -inset-4 blur-3xl rounded-3xl bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-cyan-500/15 pointer-events-none" />
                
                <div className="relative bg-card rounded-3xl border border-blue-500/20 p-6 shadow-2xl backdrop-blur-xl">
                  {/* Header Mock */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-muted-foreground">GCBFQ3...SCDVY6</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Stellar Network
                    </span>
                  </div>

                  {/* Balance Card + Animated Live Chart Wave */}
                  <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 p-5 mb-6 bg-gradient-to-br from-blue-600/25 via-blue-500/15 to-cyan-500/15 shadow-xl">
                    
                    {/* Live SVG Animated Wave Chart */}
                    <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none opacity-40">
                      <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                        <path
                          d="M0,45 C50,20 100,50 150,15 C200,35 250,5 300,25"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          className="animate-chart-line"
                        />
                      </svg>
                    </div>

                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
                      <span>Estimated Balance</span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    </span>
                    <div className="text-3xl font-extrabold font-mono tracking-tight mt-1 flex items-baseline gap-1 text-foreground">
                      12,450.85 <span className="text-xs text-blue-400 font-semibold">XLM</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-0.5">≈ $1,369.59 USD</div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/[0.08] text-xs relative z-10">
                      <div>
                        <span className="text-muted-foreground font-medium block">USDC Token</span>
                        <span className="font-mono font-bold mt-0.5 block text-foreground">1,250.00 USDC</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium block">Active Network</span>
                        <span className="font-mono font-bold mt-0.5 block text-emerald-400">Stellar Network</span>
                      </div>
                    </div>
                  </div>

                  {/* Transactions */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
                      Recent Activity
                    </span>

                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-xs hover:border-blue-500/30 transition-all">
                      <div className="size-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">↑</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">Sent 120.00 XLM</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">To GD2B...K8XQ</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">Success</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-xs hover:border-blue-500/30 transition-all">
                      <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">↓</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">Received 50.00 USDC</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">From GCOA...M5K0</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">Success</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      StellarWalletsKit Ready
                    </span>
                    <span className="font-mono">v2.1.0</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        ) : (
          /* ========================================================= */
          /* PAGE 2: LUMEN FLOW ESCROW (Interactive 3D Studio + Glowing Border Beams) */
          /* ========================================================= */
          <div className="space-y-12">
            {/* Centered Master Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <FadeIn delay={100}>
                <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md shadow-lg shadow-amber-500/10">
                  <Lock className="w-3.5 h-3.5 mr-2 text-amber-400" />
                  SOROBAN ON-CHAIN SMART CONTRACT PLATFORM
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                  Trustless Web3 Escrow Studio for{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 inline-block">
                    High-Stakes Milestone Deals
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={300}>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Lock USDC/XLM in non-custodial Soroban WASM vaults. Automated stage disbursement upon client approval or 3-of-5 multisig guardian arbitration.
                </p>
              </FadeIn>

              <FadeIn delay={400}>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Button
                    onClick={onConnectClick}
                    size="lg"
                    className="h-13 rounded-xl px-8 text-base font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-amber-500/25 border-0 transition-transform hover:scale-105"
                  >
                    Launch Escrow Deal
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-13 rounded-xl px-8 text-base font-medium border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300"
                  >
                    View Soroban Contracts
                  </Button>
                </div>
              </FadeIn>
            </div>

            {/* 3-Card High-End Escrow Studio Matrix with Glowing Hover Beams */}
            <FadeIn delay={500}>
              <div className="grid gap-6 md:grid-cols-3 items-stretch relative">
                
                {/* Card 1: Vault Deposit Terms */}
                <div className="bg-[#090d16] rounded-2xl border border-amber-500/30 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-400 transition-all duration-300 hover:-translate-y-1.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 border-beam-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                        1. Vault Deposit
                      </span>
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Soroban Lockup</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      Client deposits USDC into a non-custodial Soroban WASM contract. Zero centralized party access.
                    </p>

                    <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-4 space-y-3 shadow-inner">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Contract Deposit</span>
                        <span className="font-mono font-bold text-amber-400">15,000.00 USDC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Time-lock Expiry</span>
                        <span className="font-mono font-semibold text-emerald-400">30 Days Auto-Refund</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    Status: Active Contract Locked
                  </div>
                </div>

                {/* Card 2: Milestone Disbursement Pipeline */}
                <div className="bg-[#0b121e] rounded-2xl border border-amber-500/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-orange-400 transition-all duration-300 hover:-translate-y-1.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 border-beam-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/15 px-2.5 py-1 rounded-full border border-orange-500/30">
                        2. Milestone Execution
                      </span>
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Stage Release Flow</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Work deliverables are reviewed per milestone. Approved stages instantly disburse funds.
                    </p>

                    <div className="space-y-2">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-[11px] flex items-center justify-between">
                        <span className="font-medium text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Stage 1: Wireframes
                        </span>
                        <span className="font-mono font-bold text-emerald-400">$3,000 ✅</span>
                      </div>
                      <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-2.5 text-[11px] flex items-center justify-between">
                        <span className="font-medium text-amber-200">Stage 2: Soroban Dev</span>
                        <span className="font-mono font-bold text-amber-300">$7,000 🔒</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-[11px] flex items-center justify-between opacity-50">
                        <span className="font-medium text-muted-foreground">Stage 3: Audit</span>
                        <span className="font-mono font-bold text-muted-foreground">$5,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-amber-400 font-mono">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    Milestone 2 Under Review
                  </div>
                </div>

                {/* Card 3: MultiSig Guardian Arbitration */}
                <div className="bg-[#090d16] rounded-2xl border border-amber-500/30 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 border-beam-glow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        3. Dispute Protection
                      </span>
                      <Scale className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">3-of-5 MultiSig Panel</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      In case of disagreement, trusted arbitrator keypairs vote on-chain to disburse funds fairly.
                    </p>

                    <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-4 space-y-2 text-xs shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Arbitration Panel</span>
                        <span className="font-mono font-bold text-emerald-400">Lumen Guardian Set</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Required Votes</span>
                        <span className="font-mono font-bold text-foreground">3 / 5 Signatures</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono text-amber-400/90 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-amber-400" />
                      0x8f3a...b1c9
                    </span>
                    <span className="text-emerald-400 font-semibold">Verified</span>
                  </div>
                </div>

              </div>
            </FadeIn>
          </div>
        )}

      </div>
    </div>
  )
}
