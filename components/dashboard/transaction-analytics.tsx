"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Zap, ArrowUpRight, ArrowDownLeft, PieChart } from "lucide-react"

const CHART_DATA = {
  "24h": [
    { label: "00:00", val: 120 },
    { label: "04:00", val: 240 },
    { label: "08:00", val: 560 },
    { label: "12:00", val: 890 },
    { label: "16:00", val: 1250 },
    { label: "20:00", val: 1680 },
    { label: "Now", val: 2100 }
  ],
  "7d": [
    { label: "Mon", val: 1200 },
    { label: "Tue", val: 2400 },
    { label: "Wed", val: 1800 },
    { label: "Thu", val: 3200 },
    { label: "Fri", val: 2900 },
    { label: "Sat", val: 4100 },
    { label: "Sun", val: 4820 }
  ],
  "30d": [
    { label: "W1", val: 8500 },
    { label: "W2", val: 12400 },
    { label: "W3", val: 16800 },
    { label: "W4", val: 24500 }
  ]
}

export function TransactionAnalytics() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d")
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; val: number } | null>(null)

  const activePoints = CHART_DATA[timeframe]
  const maxVal = Math.max(...activePoints.map((p) => p.val)) * 1.15

  // Generate SVG path points
  const width = 600
  const height = 160
  const paddingX = 30
  const paddingY = 20

  const pointsString = activePoints
    .map((p, i) => {
      const x = paddingX + (i / (activePoints.length - 1)) * (width - 2 * paddingX)
      const y = height - paddingY - (p.val / maxVal) * (height - 2 * paddingY)
      return `${x},${y}`
    })
    .join(" ")

  const areaPath = `M ${paddingX},${height - paddingY} ${activePoints
    .map((p, i) => {
      const x = paddingX + (i / (activePoints.length - 1)) * (width - 2 * paddingX)
      const y = height - paddingY - (p.val / maxVal) * (height - 2 * paddingY)
      return `L ${x},${y}`
    })
    .join(" ")} L ${width - paddingX},${height - paddingY} Z`

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
              onClick={() => {
                setTimeframe(tf)
                setHoveredPoint(null)
              }}
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
          <div className="font-mono text-base font-extrabold text-foreground">
            {hoveredPoint ? `${hoveredPoint.val.toLocaleString()} XLM` : "14,820 XLM"}
          </div>
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

      {/* Interactive Trend Chart */}
      <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
          <span>Daily Volume Trend ({timeframe.toUpperCase()})</span>
          {hoveredPoint && (
            <span className="text-primary font-bold">
              {hoveredPoint.label}: {hoveredPoint.val.toLocaleString()} XLM
            </span>
          )}
        </div>

        <div className="w-full h-40">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0066FF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" strokeOpacity="0.08" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" strokeOpacity="0.08" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" strokeOpacity="0.15" />

            <path d={areaPath} fill="url(#chartGradient)" />
            <polyline fill="none" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pointsString} />

            {activePoints.map((p, i) => {
              const cx = paddingX + (i / (activePoints.length - 1)) * (width - 2 * paddingX)
              const cy = height - paddingY - (p.val / maxVal) * (height - 2 * paddingY)
              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)}>
                  <circle cx={cx} cy={cy} r="4" fill="#0066FF" className="transition-all hover:r-6" />
                  <circle cx={cx} cy={cy} r="8" fill="#0066FF" opacity="0.2" />
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-2">
          {activePoints.map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
        </div>
      </div>

      {/* Asset Distribution Breakdown Bar */}
      <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <PieChart className="size-3.5 text-primary" /> Asset Flow Distribution
          </span>
          <span className="text-[10px] font-mono lowercase">100% Soroban SAC Compatible</span>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted/50 border border-border/40">
          <div style={{ width: "62%" }} className="bg-primary h-full" title="Native XLM (62%)" />
          <div style={{ width: "24%" }} className="bg-cyan-500 h-full" title="Circle USDC (24%)" />
          <div style={{ width: "8%" }} className="bg-emerald-500 h-full" title="Circle EURC (8%)" />
          <div style={{ width: "6%" }} className="bg-amber-500 h-full" title="Custom Token (6%)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-foreground">XLM: 62%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-cyan-500" />
            <span className="text-foreground">USDC: 24%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-foreground">EURC: 8%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="text-foreground">Custom: 6%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
