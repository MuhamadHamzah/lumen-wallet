"use client"

import { useState, useEffect } from "react"
import { Send, Award, Users, Activity, BarChart2, MessageSquare, Search, Database, ExternalLink, Globe } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/components/wallet-provider"

interface FeedbackItem {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface InteractionLog {
  address: string;
  action: string;
  txHash: string;
  time: string;
  network?: string;
}

export function FeedbackAnalytics() {
  const { publicKey } = useWallet()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [mainnetSearch, setMainnetSearch] = useState("")
  const [testnetSearch, setTestnetSearch] = useState("")
  
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [interactions, setInteractions] = useState<InteractionLog[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load from server-side API
  const fetchData = async () => {
    try {
      const [fbRes, intRes] = await Promise.all([
        fetch("/api/feedback"),
        fetch("/api/interactions"),
      ])
      if (fbRes.ok) {
        const fbData = await fbRes.json()
        setFeedbacks(fbData.feedbacks || [])
      }
      if (intRes.ok) {
        const intData = await intRes.json()
        setInteractions(intData.interactions || [])
      }
    } catch (err) {
      console.error("Failed to fetch analytics data:", err)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment || !publicKey) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: publicKey,
          rating,
          comment,
        }),
      })

      if (res.ok) {
        const newFeedback = await res.json()
        setFeedbacks((prev) => [newFeedback, ...prev])
        setComment("")
        setRating(5)
        toast.success("Feedback submitted successfully! Thank you.")
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.error || "Failed to submit feedback.")
      }
    } catch (err) {
      console.error("Submit feedback error:", err)
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const mainnetLogs = interactions.filter(i => (i.network || "").toLowerCase() === "mainnet")
  const testnetLogs = interactions.filter(i => (i.network || "").toLowerCase() === "testnet")

  const filteredMainnet = mainnetLogs.filter(i => 
    i.address.toLowerCase().includes(mainnetSearch.toLowerCase()) ||
    i.action.toLowerCase().includes(mainnetSearch.toLowerCase()) ||
    i.txHash.toLowerCase().includes(mainnetSearch.toLowerCase())
  )

  const filteredTestnet = testnetLogs.filter(i => 
    i.address.toLowerCase().includes(testnetSearch.toLowerCase()) ||
    i.action.toLowerCase().includes(testnetSearch.toLowerCase()) ||
    i.txHash.toLowerCase().includes(testnetSearch.toLowerCase())
  )

  const uniqueUsers = new Set([...interactions.map((i) => i.address), ...feedbacks.map((f) => f.user)]).size
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : "5.0"

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary">
              <BarChart2 className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Ledger Telemetry &amp; Community Feedback
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-mono mt-1">
            Real-time on-chain interaction monitoring separated by Stellar Mainnet and Testnet.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl p-5 flex items-center gap-3.5 shadow-sm">
          <div className="size-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Mainnet Calls</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 tracking-tight mt-0.5">{mainnetLogs.length}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-5 flex items-center gap-3.5 shadow-sm">
          <div className="size-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Globe className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Testnet Calls</div>
            <div className="text-2xl font-extrabold font-mono text-amber-400 tracking-tight mt-0.5">{testnetLogs.length}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex items-center gap-3.5 shadow-sm">
          <div className="size-11 rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Active Keypairs</div>
            <div className="text-2xl font-extrabold font-mono text-foreground tracking-tight mt-0.5">{uniqueUsers}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex items-center gap-3.5 shadow-sm">
          <div className="size-11 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Satisfaction Index</div>
            <div className="text-2xl font-extrabold font-mono text-foreground tracking-tight mt-0.5">{avgRating} / 5.0</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: COMMUNITY FEEDBACK & SENTIMENT LOOP (AT TOP) */}
      {/* ========================================================================= */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* User Feedback Form (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-border/40">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              Submit On-Chain Feedback
            </h2>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Submit your experience to help refine and decentralize Lumen Wallet.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Rating Score</span>
                <span className="font-mono text-primary font-bold">{rating} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setRating(score)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      rating === score
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-comment" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Feedback Note
              </Label>
              <Textarea 
                id="fb-comment"
                placeholder="Share feedback on wallet performance, Soroban WASM speed, or UX..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="text-xs rounded-xl"
                rows={3}
                required
              />
            </div>

            <Button 
              type="submit" 
              size="sm" 
              className="w-full h-10 rounded-xl font-semibold gap-1.5 shadow-md focus-visible:ring-2 focus-visible:ring-primary"
              disabled={!publicKey || isSubmitting}
            >
              <Send className="size-3.5" /> 
              {!publicKey ? "Connect Wallet to Submit" : isSubmitting ? "Submitting…" : "Record Feedback"}
            </Button>
          </form>
        </div>

        {/* Feedback Feed (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" /> 
                Live Community Feedback Feed
              </h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Verified community insights and feedback logs.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              {feedbacks.length} Verified Reviews
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {feedbacks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-mono text-xs">
                No community feedback submitted yet.
              </div>
            ) : (
              feedbacks.map((f) => (
                <div key={f.id} className="p-3.5 rounded-2xl border border-border/50 bg-muted/20 space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary">
                      {f.user.slice(0, 8)}...{f.user.slice(-6)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      Score: {f.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">&ldquo;{f.comment}&rdquo;</p>
                  <div className="text-[10px] font-mono text-muted-foreground">{f.date.slice(0, 10)}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: SEPARATE TELEMETRY PANELS (MAINNET & TESTNET BELOW) */}
      {/* ========================================================================= */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: STELLAR MAINNET TELEMETRY */}
        <div className="rounded-3xl border border-emerald-500/30 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Database className="size-4" />
                  Stellar Mainnet Telemetry
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Verified public production transactions and Soroban WASM contract calls.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              {mainnetLogs.length} Events
            </span>
          </div>

          {/* Mainnet Search Box */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Filter Mainnet address, action, hash..."
              value={mainnetSearch}
              onChange={(e) => setMainnetSearch(e.target.value)}
              className="h-8 pl-8 text-xs font-mono rounded-xl bg-muted/30 border-border/50"
            />
          </div>

          <div className="border border-border/60 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto bg-muted/20">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-muted/80 text-muted-foreground sticky top-0 z-10 border-b border-border/60 font-mono">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider">Address</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider">Action &amp; Hash</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {filteredMainnet.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground text-xs">
                      No Mainnet interaction logs found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredMainnet.map((log, idx) => (
                    <tr key={idx} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="px-4 py-3 align-top space-y-1">
                        <span className="font-mono text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 block w-fit">
                          {log.address.slice(0, 6)}...{log.address.slice(-4)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top min-w-0">
                        <div className="font-semibold text-foreground text-xs">{log.action}</div>
                        {log.txHash && log.txHash !== "N/A" && !log.txHash.startsWith("N/A") ? (
                          <a
                            href={`https://stellar.expert/explorer/public/tx/${log.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-emerald-400 truncate max-w-[220px] transition-colors"
                            title={log.txHash}
                          >
                            {log.txHash}
                            <ExternalLink className="size-2.5 shrink-0" />
                          </a>
                        ) : (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                            {log.txHash}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground text-right text-[11px] whitespace-nowrap">
                        {log.time.slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL 2: STELLAR TESTNET TELEMETRY */}
        <div className="rounded-3xl border border-amber-500/30 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Globe className="size-4" />
                  Stellar Testnet Telemetry
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Sandbox testing, test tokens, friendbot funding, and protocol dry runs.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              {testnetLogs.length} Events
            </span>
          </div>

          {/* Testnet Search Box */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Filter Testnet address, action, hash..."
              value={testnetSearch}
              onChange={(e) => setTestnetSearch(e.target.value)}
              className="h-8 pl-8 text-xs font-mono rounded-xl bg-muted/30 border-border/50"
            />
          </div>

          <div className="border border-border/60 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto bg-muted/20">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-muted/80 text-muted-foreground sticky top-0 z-10 border-b border-border/60 font-mono">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider">Address</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider">Action &amp; Hash</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {filteredTestnet.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground text-xs">
                      No Testnet interaction logs found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredTestnet.map((log, idx) => (
                    <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-4 py-3 align-top space-y-1">
                        <span className="font-mono text-amber-400 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 block w-fit">
                          {log.address.slice(0, 6)}...{log.address.slice(-4)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top min-w-0">
                        <div className="font-semibold text-foreground text-xs">{log.action}</div>
                        {log.txHash && log.txHash !== "N/A" && !log.txHash.startsWith("N/A") ? (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-amber-400 truncate max-w-[220px] transition-colors"
                            title={log.txHash}
                          >
                            {log.txHash}
                            <ExternalLink className="size-2.5 shrink-0" />
                          </a>
                        ) : (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                            {log.txHash}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground text-right text-[11px] whitespace-nowrap">
                        {log.time.slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

