"use client"

import { useState, useEffect } from "react"
import { Send, CheckCircle, Shield, Award, Users, Activity, BarChart2, Star, MessageSquare, Download, Search, Sparkles, Database } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
    // Poll every 15 seconds to keep data fresh
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

  const exportToCSV = () => {
    if (feedbacks.length === 0 && interactions.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const headers = ["Category", "User / Address", "Rating / Action", "Comment / TxHash", "Date / Time"]
    const feedbackRows = feedbacks.map(f => ["Feedback", f.user, `${f.rating}/5`, `"${f.comment.replace(/"/g, '""')}"`, f.date])
    const interactionRows = interactions.map(i => ["Interaction", i.address, i.action, i.txHash, i.time])

    const csvContent = [
      headers.join(","),
      ...feedbackRows.map(r => r.join(",")),
      ...interactionRows.map(r => r.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `lumen_wallet_user_growth_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Exported user growth & feedback dataset successfully!")
  }

  const filteredInteractions = interactions.filter(i => 
    i.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.txHash.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const uniqueUsers = new Set([...interactions.map((i) => i.address), ...feedbacks.map((f) => f.user)]).size
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : "5.0"

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <BarChart2 className="size-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white gradient-heading">
              Feedback & User Growth Analytics
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Real-time metric telemetry, active testnet user count, and verified feedback loop.
          </p>
        </div>

        <Button
          onClick={exportToCSV}
          size="sm"
          className="gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all self-start md:self-auto"
        >
          <Download className="size-3.5" />
          Export User Data (.CSV)
        </Button>
      </div>

      {/* Modern Web3 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex items-center gap-4 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="size-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Wallet Actions</div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">{walletCalls}</div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex items-center gap-4 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Onboarded Users</div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">{uniqueUsers}</div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex items-center gap-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Satisfaction Index</div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">{avgRating} / 5.0</div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex items-center gap-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="size-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Network State</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Active Testnet
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Proof of Wallet Interactions Section */}
        <div className="space-y-4">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="size-4 text-cyan-400" />
                Proof of Wallet Interactions
              </h2>

              {/* Search Box */}
              <div className="relative max-w-[200px]">
                <Search className="size-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <Input
                  placeholder="Filter address/action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="border border-slate-800/80 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto bg-slate-950/40">
              <table className="w-full text-left text-xs relative">
                <thead className="bg-slate-950/90 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Address</th>
                    <th className="px-4 py-2.5 font-semibold">Action & TxHash</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInteractions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                        No transactions found. Connect wallet to generate interaction logs.
                      </td>
                    </tr>
                  ) : (
                    filteredInteractions.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <span className="font-mono text-cyan-300 text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {log.address.slice(0, 6)}...{log.address.slice(-4)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top min-w-0">
                          <div className="font-semibold text-slate-200 mb-0.5 text-xs">{log.action}</div>
                          <div className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]" title={log.txHash}>
                            {log.txHash}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-slate-400 text-right text-[11px] whitespace-nowrap">
                          {log.time.slice(0, 10)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* User Feedback Collection Form & Feed */}
        <div className="space-y-6">
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="size-4 text-cyan-400" />
              Submit Product Feedback
            </h2>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fb-user" className="text-xs text-slate-300 font-medium">User Wallet Address</Label>
                  <Input 
                    id="fb-user"
                    placeholder="Connect wallet to submit feedback"
                    value={publicKey ? publicKey : "No Wallet Connected"}
                    disabled={true}
                    className="h-9 text-xs font-mono bg-slate-950/80 border-slate-800 text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Rating (1 to 5 Stars)</span>
                  <div className="flex items-center gap-1.5 h-9">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-all active:scale-90 focus:outline-none"
                      >
                        <Star
                          className={`size-5 transition-colors ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                              : "text-slate-700 hover:text-amber-400/60"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-comment" className="text-xs text-slate-300 font-medium">Feedback Comment</Label>
                <Textarea 
                  id="fb-comment"
                  placeholder="Share your thoughts about escrow features, DEX swap speed, or onboarding UX..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs bg-slate-950/80 border-slate-800 text-slate-200"
                  rows={3}
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="sm" 
                className="w-full gap-1.5 font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                disabled={!publicKey || isSubmitting}
              >
                <Send className="size-3.5" /> 
                {!publicKey ? "Connect Wallet to Submit Feedback" : isSubmitting ? "Submitting..." : "Send Feedback"}
              </Button>
            </form>
          </Card>

          {/* Feedback Feed */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="size-3.5 text-cyan-400" /> Live Feedback Feed
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {feedbacks.map((f, i) => (
                <div key={f.id} className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-cyan-300">
                      {f.user.slice(0, 8)}...{f.user.slice(-6)}
                    </span>
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: f.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.comment}</p>
                  <div className="text-[10px] text-slate-500">{f.date.slice(0, 10)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
