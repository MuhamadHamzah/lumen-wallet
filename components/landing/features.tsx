"use client"

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
  Award,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react"
import { FadeIn } from "./web3-animations"

interface FeaturesProps {
  mode?: "wallet" | "flow"
}

const coolAnimationStyles = `
  @keyframes stroke-draw {
    0% { stroke-dashoffset: 400; }
    100% { stroke-dashoffset: 0; }
  }
  .animate-chart-line {
    stroke-dasharray: 400;
    animation: stroke-draw 3s ease-out infinite alternate;
  }
`

export function Features({ mode = "wallet" }: FeaturesProps) {
  const isWallet = mode === "wallet"

  return (
    <section id="capabilities" className="relative py-20 sm:py-28 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: coolAnimationStyles }} />

      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.8) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Live Cockpit Showcase Card directly above section header */}
        {isWallet && (
          <FadeIn delay={100} className="mb-24 sm:mb-32 lg:mb-40 max-w-xl mx-auto">
            <div id="live-cockpit-card" className="relative">
              <div className="absolute -inset-4 blur-3xl rounded-3xl bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-indigo-500/15 pointer-events-none" />
              
              <div className="relative rounded-3xl border border-white/15 dark:border-white/10 bg-card/60 p-6 sm:p-7 shadow-2xl backdrop-blur-xl transition-all">
                {/* Account Header Strip */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9.5" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                        <line x1="12" y1="2.5" x2="12" y2="9" />
                        <line x1="12" y1="15" x2="12" y2="21.5" />
                        <line x1="2.5" y1="12" x2="9" y2="12" />
                        <line x1="15" y1="12" x2="21.5" y2="12" />
                        <line x1="5.28" y1="5.28" x2="9.88" y2="9.88" />
                        <line x1="14.12" y1="14.12" x2="18.72" y2="18.72" />
                        <line x1="5.28" y1="18.72" x2="9.88" y2="14.12" />
                        <line x1="14.12" y1="9.88" x2="18.72" y2="5.28" />
                      </svg>
                    </div>
                    <span className="text-xs font-mono font-medium text-foreground tracking-tight">GCBFQ3...SCDVY6</span>
                  </div>
                  <span className="text-[10px] font-semibold font-mono px-2.5 py-0.5 rounded-full uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live Testnet
                  </span>
                </div>

                {/* Main Live Balance Block */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 p-5 mb-5 bg-blue-500/[0.06] backdrop-blur-sm">
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

                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Available Balance</span>
                    <span className="font-mono text-blue-400 lowercase">horizon-sse:connected</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1 flex items-baseline gap-1.5 text-foreground">
                    12,450.85 <span className="text-xs text-blue-400 font-semibold uppercase">XLM</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">≈ $1,369.59 USD</div>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/[0.08] text-xs relative z-10">
                    <div>
                      <span className="text-muted-foreground font-medium block text-[11px]">USDC Trustline</span>
                      <span className="font-mono font-bold mt-0.5 block text-foreground">1,250.00 USDC</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium block text-[11px]">Settlement Time</span>
                      <span className="font-mono font-bold mt-0.5 block text-emerald-400">3.8 Seconds</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Ledger Feed Mock */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                    Live Ledger Ingestion
                  </span>

                  <div className="flex items-center justify-between bg-muted/40 border border-border/50 hover:bg-muted/60 rounded-xl p-3 text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-[11px]">↑</div>
                      <div>
                        <div className="font-semibold text-foreground">Payment Sent</div>
                        <div className="text-[10px] text-muted-foreground font-mono">120.00 XLM → GD2B...K8XQ</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full">Finalized</span>
                  </div>

                  <div className="flex items-center justify-between bg-muted/40 border border-border/50 hover:bg-muted/60 rounded-xl p-3 text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-[11px]">↓</div>
                      <div>
                        <div className="font-semibold text-foreground">USDC Inbound</div>
                        <div className="text-[10px] text-muted-foreground font-mono">50.00 USDC ← GCQA...M5K0</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full">Finalized</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono text-emerald-500">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Soroban WASM VM Active
                  </span>
                  <span className="font-mono">v2.1.0-release</span>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Section Header */}
        <FadeIn>
          <div className="mb-14 max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
              {isWallet ? (
                <>
                  Engineered for instantaneous payments,{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    complete key custody.
                  </span>
                </>
              ) : (
                <>
                  Trustless milestone vaults powered by{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
                    Soroban WASM.
                  </span>
                </>
              )}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {isWallet
                ? "Every architectural layer is optimized for Stellar's sub-second ledger finality, low transaction cost, and strict cryptographic privacy."
                : "Decentralized escrow workflows with programmatic stage disbursement, client deliverable review, and multisig guardian protection."
              }
            </p>
          </div>
        </FadeIn>

        {/* Asymmetric Capabilities Bento */}
        {isWallet ? (
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Tile 1: Primary Anchor (8 Columns) - Sub-5s Settlement Engine */}
            <FadeIn delay={100} className="lg:col-span-8">
              <div className="h-full rounded-3xl border border-white/20 dark:border-white/10 bg-card/90 dark:bg-[#070b19]/90 p-7 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="size-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                      <Zap className="size-6" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      ~3.8s Ledger Settlement
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Instant Stellar Transfer Engine</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Execute cross-border XLM and asset transfers with sub-second ledger finality. Horizon SSE connection ensures zero-polling instant balance updates upon ledger close.
                  </p>
                </div>

                {/* Telemetry Visual Ribbon */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/60 dark:bg-slate-950/60 border border-border/50 text-xs backdrop-blur-md">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Finality Time</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block">&lt; 5.0 Seconds</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Average Fee</span>
                    <span className="font-mono font-bold text-emerald-400 mt-0.5 block">0.00001 XLM</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Signing Flow</span>
                    <span className="font-mono font-bold text-blue-400 mt-0.5 block">Freighter / Kit</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Tile 2: Secondary Pillar (4 Columns) - Local Key Privacy */}
            <FadeIn delay={180} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-white/20 dark:border-white/10 bg-card/90 dark:bg-[#070b19]/90 p-7 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all shadow-xl">
                <div className="space-y-4">
                  <div className="size-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Lock className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">In-Memory Secret Key Isolation</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Private keys and seed phrases stay encrypted strictly in browser session memory. No telemetry or server storage.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/60 dark:bg-slate-950/60 border border-border/50 flex items-center gap-2.5 text-xs text-muted-foreground font-mono backdrop-blur-md">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>100% Non-Custodial Architecture</span>
                </div>
              </div>
            </FadeIn>

            {/* Tile 3: Asset Management (4 Columns) */}
            <FadeIn delay={260} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-white/20 dark:border-white/10 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Wallet className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Multi-Asset Trustlines</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Establish Stellar trustlines for USDC, EURC, and custom tokens with automatic minimum reserve tracking.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">0.5 XLM reserve per trustline</span>
              </div>
            </FadeIn>

            {/* Tile 4: Real-time SSE Stream (4 Columns) */}
            <FadeIn delay={320} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-white/20 dark:border-white/10 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <TrendingUp className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Horizon SSE Live Tracker</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Streaming Server-Sent Events push payment notifications to your dashboard the millisecond ledgers finalize.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Event Stream
                </span>
              </div>
            </FadeIn>

            {/* Tile 5: Ledger Transaction Explorer (4 Columns) */}
            <FadeIn delay={380} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-white/20 dark:border-white/10 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <BarChart3 className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Explorer Hash Inspection</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Direct cryptographic proof links to StellarExpert and Horizon raw JSON endpoints with full CSV export capabilities.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">StellarExpert verified</span>
              </div>
            </FadeIn>
          </div>
        ) : (
          /* ========================================================= */
          /* FLOW ESCROW BENTO */
          /* ========================================================= */
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Tile 1: Primary Anchor (8 Columns) - Soroban Vaults */}
            <FadeIn delay={100} className="lg:col-span-8">
              <div className="h-full rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-7 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 hover:border-amber-500/50 transition-all shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="size-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <ShieldCheck className="size-6" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Soroban WASM Runtime
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Non-Custodial Smart Contract Vaults</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Client funds lock safely on-chain in custom Soroban smart contracts. Neither Lumen Wallet nor centralized custodians can touch or freeze deposits.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/60 dark:bg-slate-950/60 border border-border/50 text-xs backdrop-blur-md">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Execution VM</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block">Rust / WASM</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Execution Cost</span>
                    <span className="font-mono font-bold text-emerald-400 mt-0.5 block">&lt; $0.001 Gas</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Disbursement</span>
                    <span className="font-mono font-bold text-amber-400 mt-0.5 block">Client Release</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Tile 2: MultiSig Arbitration (4 Columns) */}
            <FadeIn delay={180} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-7 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 hover:border-amber-500/50 transition-all shadow-xl">
                <div className="space-y-4">
                  <div className="size-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Scale className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">3-of-5 Guardian MultiSig</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Decentralized arbitration panels resolve disputes on-chain without single points of failure.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/60 dark:bg-slate-950/60 border border-border/50 flex items-center gap-2.5 text-xs text-emerald-400 font-mono backdrop-blur-md">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Quorum Consensus Enforced</span>
                </div>
              </div>
            </FadeIn>

            {/* Tile 3: Stage Milestones (4 Columns) */}
            <FadeIn delay={260} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-5 hover:border-amber-500/50 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <CalendarRange className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Stage-by-Stage Release</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Break high-stakes contracts into verifiable milestones. Funds disburse only when deliverables pass review.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-amber-400">Milestone verified releases</span>
              </div>
            </FadeIn>

            {/* Tile 4: Role-Based Access (4 Columns) */}
            <FadeIn delay={320} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-5 hover:border-amber-500/50 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Users className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Role-Based Workbenches</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tailored dashboards for Depositors (Clients), Beneficiaries (Contractors), and Arbitrators.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">3 Distinct Web3 Roles</span>
              </div>
            </FadeIn>

            {/* Tile 5: Time-Locked Refund (4 Columns) */}
            <FadeIn delay={380} className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-amber-500/30 bg-card/90 dark:bg-[#070b19]/90 p-6 sm:p-7 backdrop-blur-2xl flex flex-col justify-between space-y-5 hover:border-amber-500/50 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Award className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Time-Locked Auto-Refund</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Protects clients from unresponsive contractors with automatic expiration timers and zero-fee claims.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">Automatic refund safety</span>
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </section>
  )
}
