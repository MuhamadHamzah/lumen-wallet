"use client"

import { useState, useEffect } from "react"
import { Send, CheckCircle, Shield, Award, Users, Activity, BarChart2, Star, MessageSquare, Search, Sparkles, Database } from "lucide-react"
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
}

export function FeedbackAnalytics() {
  const { publicKey } = useWallet()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [interactions, setInteractions] = useState<InteractionLog[]>([])
  const [walletCalls, setWalletCalls] = useState(0)
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
        setWalletCalls(intData.walletCalls || 0)
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

  const filteredInteractions = interactions.filter(i => 
    i.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.txHash.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const uniqueUsers = new Set([...interactions.map((i) => i.address), ...feedbacks.map((f) => f.user)]).size
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : "5.0"

  return (
    <div className="space-y-6">
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
            Real-time on-chain interaction monitoring and verified user sentiment loop.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex items-center gap-3.5 shadow-sm">
          <div className="size-11 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Ledger Calls</div>
            <div className="text-2xl font-extrabold font-mono text-foreground tracking-tight mt-0.5">{walletCalls}</div>
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
          <div className="size-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Satisfaction Index</div>
            <div className="text-2xl font-extrabold font-mono text-foreground tracking-tight mt-0.5">{avgRating} / 5.0</div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex items-center gap-3.5 shadow-sm">
          <div className="size-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Network State</div>
            <div className="text-xs font-bold font-mono text-emerald-500 mt-1 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Live Horizon SSE
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric 7 / 5 Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Proof of Wallet Interactions Table (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Database className="size-4 text-primary" />
              Verified Interaction Ledger
            </h2>

            {/* Search Box */}
            <div className="relative max-w-[200px]">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Filter address/action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          <div className="border border-border/60 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto bg-muted/20">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-muted/80 text-muted-foreground sticky top-0 z-10 border-b border-border/60">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider">Address</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider">Action &amp; Hash</th>
                  <th className="px-4 py-2.5 font-bold uppercase text-[10px] tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredInteractions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground font-mono">
                      No interaction logs found. Perform actions on testnet to record telemetry.
                    </td>
                  </tr>
                ) : (
                  filteredInteractions.map((log, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <span className="font-mono text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {log.address.slice(0, 6)}...{log.address.slice(-4)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top min-w-0">
                        <div className="font-semibold text-foreground text-xs">{log.action}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]" title={log.txHash}>
                          {log.txHash}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground text-right text-[11px] font-mono whitespace-nowrap">
                        {log.time.slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Feedback Form & Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              Submit On-Chain Feedback
            </h2>

            <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating Score</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform active:scale-90 focus:outline-none"
                    >
                      <Star
                        className={`size-5 transition-colors ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "text-muted-foreground/30 hover:text-amber-400/60"
                        }`}
                      />
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

          {/* Feedback Feed */}
          <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 pb-2 border-b border-border/40">
              <Sparkles className="size-3.5 text-primary" /> Live Feedback Feed
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-3 rounded-2xl border border-border/50 bg-muted/30 space-y-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-primary">
                      {f.user.slice(0, 8)}...{f.user.slice(-6)}
                    </span>
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: f.rating }).map((_, i) => (
                        <Star key={i} className="size-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">&ldquo;{f.comment}&rdquo;</p>
                  <div className="text-[10px] font-mono text-muted-foreground">{f.date.slice(0, 10)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
