"use client"

import { useState, useEffect } from "react"
import { Send, CheckCircle, Shield, Award, Users, Activity, BarChart2, Star, MessageSquare, Download, Search } from "lucide-react"
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
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart2 className="size-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Feedback & Analytics</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time metrics, wallet interactions, and user feedback summary.
          </p>
        </div>

        <Button
          onClick={exportToCSV}
          variant="outline"
          size="sm"
          className="gap-2 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 self-start md:self-auto"
        >
          <Download className="size-3.5" />
          Export User Data (CSV)
        </Button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border bg-card p-4 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Wallet Actions</div>
            <div className="text-2xl font-bold font-mono tracking-tight">{walletCalls}</div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-4 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Users className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Onboarded Users</div>
            <div className="text-2xl font-bold font-mono tracking-tight">{uniqueUsers}</div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-4 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Award className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">App Satisfaction</div>
            <div className="text-2xl font-bold font-mono tracking-tight">{avgRating} / 5.0</div>
          </div>
        </Card>

        <Card className="border border-border bg-card p-4 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Network State</div>
            <div className="text-sm font-bold text-foreground">Active Testnet</div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Wallet interaction log (10+ wallet interactions proof) */}
        <div className="space-y-4">
          <Card className="border border-border bg-card p-5">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CheckCircle className="size-4 text-primary" />
              Proof of Wallet Interactions
            </h2>
            <div className="border border-border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
              <table className="w-full text-left text-xs relative">
                <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-medium">Address</th>
                    <th className="px-4 py-2 font-medium">Action & Hash</th>
                    <th className="px-4 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {interactions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground bg-card">
                        No transactions recorded yet. Connect Freighter wallet and execute escrows to see logs.
                      </td>
                    </tr>
                  ) : (
                    interactions.map((log, idx) => (
                      <tr key={idx} className="bg-card">
                        <td className="px-4 py-3 align-top">
                          <span className="font-mono text-muted-foreground">{log.address}</span>
                        </td>
                        <td className="px-4 py-3 align-top min-w-0">
                          <div className="font-medium text-foreground mb-1">{log.action}</div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]" title={log.txHash}>{log.txHash}</div>
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground whitespace-nowrap">
                          {log.time}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* User feedback collection */}
        <div className="space-y-6">
          <Card className="border border-border bg-card p-5">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <MessageSquare className="size-4 text-primary" />
              Submit Product Feedback
            </h2>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fb-user" className="text-xs">User Wallet Address (Autofilled)</Label>
                  <Input 
                    id="fb-user"
                    placeholder="Connect wallet to submit feedback"
                    value={publicKey ? publicKey : "No Wallet Connected"}
                    disabled={true}
                    className="h-9 text-xs font-mono bg-muted text-muted-foreground/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-foreground">Product Rating (1 to 5 Stars)</span>
                  <div className="flex items-center gap-1.5 h-9">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 -ml-1 transition-all active:scale-95 focus:outline-none"
                      >
                        <Star
                          className={`size-6 transition-colors ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30 hover:text-amber-400/70"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-comment" className="text-xs">Feedback Comment</Label>
                <Textarea 
                  id="fb-comment"
                  placeholder="Share your thoughts about LumenFlow escrow features, layout, or mobile responsiveness..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs"
                  rows={3}
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="sm" 
                className="w-full gap-1.5 font-semibold"
                disabled={!publicKey || isSubmitting}
              >
                <Send className="size-3.5" /> 
                {!publicKey ? "Connect Wallet to Submit Feedback" : isSubmitting ? "Submitting..." : "Send Feedback"}
              </Button>
            </form>
          </Card>

          {/* Feedback summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold">Feedback Feed</h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {feedbacks.map((f, i) => (
                <div key={f.id} className={`pb-3 ${i !== feedbacks.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-xs font-mono font-medium text-foreground">{f.user}</span>
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: f.rating }).map((_, i) => (
                        <Star key={i} className="size-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.comment}</p>
                  <div className="text-[10px] text-muted-foreground mt-1.5">{f.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
