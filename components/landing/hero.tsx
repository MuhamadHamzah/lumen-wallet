"use client"

import { Zap, Shield, Coins, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "./web3-animations"

interface HeroProps {
  onConnectClick: () => void
  mode?: "wallet" | "flow"
}

export function Hero({ onConnectClick, mode = "wallet" }: HeroProps) {
  const isWallet = mode === "wallet"

  return (
    <div className="relative overflow-hidden pt-0 pb-16 sm:pt-2 sm:pb-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left column */}
          <div className="space-y-8">
            <FadeIn delay={100}>
              <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm ${
                isWallet 
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-400" 
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}>
                <span className="relative flex h-2 w-2 mr-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isWallet ? "bg-blue-400" : "bg-amber-400"
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isWallet ? "bg-blue-500" : "bg-amber-500"
                  }`} />
                </span>
                Powered by Stellar Network
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-sm sm:max-w-md">
                  Your <br />
                  Gateway to <br />
                  <span className={`bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] inline-block w-fit mt-2 ${
                    isWallet 
                      ? "bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400" 
                      : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400"
                  }`}>
                    {isWallet ? (
                      <>Stellar <br /> Payments</>
                    ) : (
                      <>Lumen <br /> Flow Escrow</>
                    )}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  {isWallet ? (
                    "Send, receive, and manage XLM with ease. Connect your wallet securely using Freighter, StellarWalletsKit, or custom keypairs."
                  ) : (
                    "Lock milestone-based payments on-chain using Soroban smart contracts. Secure transactions between clients and freelancers with trustless arbitration."
                  )}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={onConnectClick}
                  size="lg"
                  className={`group h-13 rounded-xl px-8 text-base font-semibold border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] text-white ${
                    isWallet 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40" 
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25 hover:shadow-amber-500/40"
                  }`}
                >
                  Connect Wallet
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`h-13 rounded-xl px-8 text-base font-medium border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ${
                    isWallet ? "hover:border-blue-500/30" : "hover:border-amber-500/30"
                  }`}
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
                    <div className={`text-lg sm:text-2xl font-bold text-foreground transition-colors duration-300 ${
                      isWallet ? "group-hover:text-blue-400" : "group-hover:text-amber-400"
                    }`}>
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
              <div className={`absolute -inset-4 blur-3xl rounded-3xl animate-pulse-glow transition-all duration-1000 ${
                isWallet 
                  ? "bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-cyan-500/10" 
                  : "bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-yellow-500/10"
              }`} />

              {/* Main container */}
              <div className="relative bg-card rounded-3xl border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
                {/* Header Mock */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">GCBFQ3...SCDVY6</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isWallet ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                  }`}>Testnet</span>
                </div>

                {/* Balance Sneak Peek Card */}
                <div className={`relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 mb-6 bg-gradient-to-br transition-all duration-1000 ${
                  isWallet 
                    ? "from-blue-600/20 to-cyan-500/10" 
                    : "from-amber-600/20 to-orange-500/10"
                }`}>
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
                      <span className="text-muted-foreground font-medium block">
                        {isWallet ? "Active Network" : "Active Escrows"}
                      </span>
                      <span className={`font-mono font-bold mt-0.5 block ${
                        isWallet ? "text-blue-400" : "text-amber-400"
                      }`}>
                        {isWallet ? "Stellar Testnet" : "3 Milestones"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Feed (Switches content depending on Mode) */}
                {isWallet ? (
                  /* Simulated Wallet Interactions */
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
                      Simulated Wallet Transactions
                    </span>

                    {/* Transaction 1 */}
                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-xs">
                      <div className="size-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">↑</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">Sent 120.00 XLM</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">To GD2B...K8XQ</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Success</span>
                    </div>

                    {/* Transaction 2 */}
                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-xs">
                      <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">↓</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">Received 50.00 USDC</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">From GCOA...M5K0</div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Success</span>
                    </div>
                  </div>
                ) : (
                  /* Simulated Web3 Escrow Contract Live Feed */
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
                      Contract Execution Flow
                    </span>

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
                )}

                {/* Bottom Status bar */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isWallet ? "StellarWalletsKit Connected" : "LumenFlow Agent Ready"}
                  </span>
                  <span>v2.1.0</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
