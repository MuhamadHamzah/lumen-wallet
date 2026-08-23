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
    <div className="relative overflow-hidden pt-6 pb-16 sm:pt-10 sm:pb-24 lg:pt-12">
      <style dangerouslySetInnerHTML={{ __html: coolAnimationStyles }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* PAGE 1: LUMEN WALLET (Majestic Editorial Masthead) */}
        {/* ========================================================= */}
        {isWallet ? (
          <div className="max-w-4xl mx-auto text-center space-y-8 py-4 sm:py-8">
            {/* Headline & Subtitle */}
            <FadeIn delay={200}>
              <div className="space-y-5">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-balance text-foreground">
                  Non-custodial{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                    Stellar payments
                  </span>{" "}
                  engineered for speed.
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
                  Manage XLM, USDC, and custom Soroban tokens with zero intermediary custody. Direct ledger streaming via Horizon SSE and instant signing with StellarWalletsKit.
                </p>
              </div>
            </FadeIn>

            {/* Protocol Spec Highlights Grid */}
            <FadeIn delay={450}>
              <div className="pt-10 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
                <div className="space-y-1 p-3 rounded-2xl bg-card/30 border border-border/40">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Ledger Finality</span>
                  <p className="text-sm font-bold font-mono text-foreground">~3.8s Instant</p>
                </div>
                <div className="space-y-1 p-3 rounded-2xl bg-card/30 border border-border/40">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Gas Execution</span>
                  <p className="text-sm font-bold font-mono text-emerald-400">&lt; 0.00001 XLM</p>
                </div>
                <div className="space-y-1 p-3 rounded-2xl bg-card/30 border border-border/40">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Key Custody</span>
                  <p className="text-sm font-bold font-mono text-foreground">100% Non-Custodial</p>
                </div>
                <div className="space-y-1 p-3 rounded-2xl bg-card/30 border border-border/40">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">Smart Contracts</span>
                  <p className="text-sm font-bold font-mono text-blue-400">Soroban WASM</p>
                </div>
              </div>
            </FadeIn>
          </div>
        ) : (
          /* ========================================================= */
          /* PAGE 2: LUMEN FLOW ESCROW (Asymmetric Contract Workbench) */
          /* ========================================================= */
          <div className="space-y-12">
            {/* Header Masthead (Centered) */}
            <div className="max-w-4xl mx-auto text-center space-y-6 py-4 sm:py-8">
              <FadeIn delay={100}>
                <div className="space-y-5">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] text-balance">
                    Trustless milestone agreements,{" "}
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
                      locked on-chain.
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                    Deposit funds safely into Soroban smart contract vaults. Disburse milestones automatically upon client deliverable verification or decentralized arbitration quorum.
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Asymmetric 8 / 4 Workbench Split */}
            <FadeIn delay={500}>
              <div className="grid gap-6 lg:grid-cols-12 items-stretch">
                
                {/* Left 8 Cols: Milestone Progressive Timeline */}
                <div className="lg:col-span-8 rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-8 backdrop-blur-2xl space-y-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Vault Contract #0x9f4a...e12</span>
                      <h3 className="text-xl font-bold text-foreground mt-0.5">Enterprise Soroban Milestone Pipeline</h3>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                      15,000.00 USDC
                    </span>
                  </div>

                  {/* Stage Progress Pipeline */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Stage 1: Architecture & WASM Specification</p>
                          <p className="text-xs text-muted-foreground">Approved by client • 5,000.00 USDC disbursed</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400">Released</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35">
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-amber-400 shrink-0 animate-pulse" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Stage 2: Soroban Smart Contract Development</p>
                          <p className="text-xs text-amber-300/80">Deliverables submitted • Pending client review</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">In Review (7,000 USDC)</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40 opacity-60">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="size-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Stage 3: Security Audit & Mainnet Launch</p>
                          <p className="text-xs text-muted-foreground">Time-lock protected • 3,000.00 USDC</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">Locked</span>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: MultiSig Arbitration & Guardian Gauge */}
                <div className="lg:col-span-4 rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-6 shadow-xl">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Governance</span>
                      <Scale className="size-4 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-3">3-of-5 MultiSig Guardian Set</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      On-chain decentralized arbitration panel protects both parties against unresponsive actors.
                    </p>

                    <div className="mt-5 space-y-2.5 p-4 rounded-2xl bg-muted/40 border border-border/60">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Required Signatures</span>
                        <span className="font-mono font-bold text-foreground">3 / 5 Quorum</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full w-3/5" />
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400 text-right">60% Threshold Met</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="font-mono">Auto-Refund: 30 Days</span>
                    <span className="text-emerald-400 font-semibold font-mono">Zero-Fee WASM</span>
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
