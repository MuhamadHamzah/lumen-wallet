"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap } from "lucide-react"

export function TransactionAnalytics() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d")

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Ledger Telemetry &amp; Volume Analytics</h3>
            <p className="text-[11px] text-muted-foreground font-mono">Real-time on-chain payment &amp; Soroban metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1">
          {(["24h", "7d", "30d"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 py-1 rounded-full font-mono transition-all ${
                timeframe === tf
                  ? "bg-primary/20 text-primary font-bold border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Volume</span>
          <div className="font-mono text-base font-extrabold text-foreground">14,820 XLM</div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="size-3" /> +18.4% this week
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Settled Escrows</span>
          <div className="font-mono text-base font-extrabold text-cyan-400">32 Stages</div>
          <span className="text-[10px] text-muted-foreground font-mono">100% On-Time</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Gas Sponsored</span>
          <div className="font-mono text-base font-extrabold text-emerald-400">0.0384 XLM</div>
          <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5">
            <Zap className="size-3" /> 100% Gasless
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Avg Finality</span>
          <div className="font-mono text-base font-extrabold text-foreground">3.8s</div>
          <span className="text-[10px] text-emerald-400 font-mono">Stellar Consensus</span>
        </div>
      </div>
    </div>
  )
}
