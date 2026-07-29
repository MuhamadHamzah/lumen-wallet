"use client"

import { useState, useEffect } from "react"
import { Send, CheckCircle, Shield, Award, Users, Activity, BarChart2, Star, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [userAddress, setUserAddress] = useState("")
  
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [walletCalls, setWalletCalls] = useState(42)

  const mockInteractions: InteractionLog[] = [
    { address: "GDCK...3P57", action: "Escrow Contract Deposit (500 USDC)", txHash: "2f9993cf5e05f0306f0bc81b5f109a8fd3532217d59abb2fe17972...", time: "2 hours ago" },
    { address: "GD3H...MXEC", action: "Milestone Release (300 USDC)", txHash: "a687f827d098e98bc0192bc58a01f92e8fa9f72bc01201bc89afae...", time: "5 hours ago" },
    { address: "GAYH...6HJ6", action: "Freighter Connection", txHash: "None (Auth)", time: "1 day ago" },
    { address: "GCOA...M5KO", action: "DEX Swap (XLM to USDC)", txHash: "8e7fa9bc819e0bc87afae9bc238fa89fbca9e72bc08fa9fae9bc8a...", time: "2 days ago" },
    { address: "GAQ6...IVQI", action: "Soroban Token Mint", txHash: "9e3faaa3307e0428c82c444a449d715d79eec8d7cc3ba6b12699dc3b304b7dea", time: "3 days ago" },
    { address: "GBAA...W2TL", action: "Escrow Contract Dispute", txHash: "b89fac871be98bfca89e72bcf82abcf89fac712bc0912bc89fac72...", time: "4 days ago" },
    { address: "GDTW...K2LN", action: "Open USDC Trustline", txHash: "c018face82be98bcfa98faec72abcf82fbca712bc09fac72bca8fa...", time: "4 days ago" },
    { address: "GCQA...45N2", action: "Escrow Resolution (Arbitrated)", txHash: "d89face918be92bfca89ecf82abce89fac712bc091a2bc89fac72a...", time: "5 days ago" },
    { address: "GCOA...K9PO", action: "Escrow Contract Deposit (120 USDC)", txHash: "f999bcfa98feca72abcf82bfca712bc08fa9fae8bc0812bc89afca...", time: "5 days ago" },
    { address: "GDFR...LL9P", action: "Milestone Work Submit", txHash: "e78fca9bc81fec82abcf82bc08fa9fae8bc08fa9fae7a8fac9afca...", time: "6 days ago" }
  ]

  // Load from local storage
  useEffect(() => {
    // Feedback
    const savedFeedback = localStorage.getItem("lumenflow_feedback")
    if (savedFeedback) {
      setFeedbacks(JSON.parse(savedFeedback))
    } else {
      setFeedbacks([])
    }

    // Interactions
    const savedInteractions = localStorage.getItem("lumenflow_interactions")
    if (savedInteractions) {
      setInteractions(JSON.parse(savedInteractions))
    } else {
      setInteractions([])
    }

    // Wallet Calls metric
    const savedCalls = localStorage.getItem("lumenflow_wallet_calls")
    if (savedCalls) {
      setWalletCalls(parseInt(savedCalls))
    } else {
      setWalletCalls(0)
    }

    // Setup listener to sync local storage metrics dynamically
    const handleStorageChange = () => {
      const current = localStorage.getItem("lumenflow_wallet_calls")
      if (current) setWalletCalls(parseInt(current))
      
      const savedInt = localStorage.getItem("lumenflow_interactions")
      if (savedInt) setInteractions(JSON.parse(savedInt))

      const savedFeed = localStorage.getItem("lumenflow_feedback")
      if (savedFeed) setFeedbacks(JSON.parse(savedFeed))
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment) return

    const newFeedback: FeedbackItem = {
      id: Math.random().toString(),
      user: userAddress || "Anonymous User",
      rating,
      comment,
      date: "Just now"
    }

    const updated = [newFeedback, ...feedbacks]
    setFeedbacks(updated)
    localStorage.setItem("lumenflow_feedback", JSON.stringify(updated))
    
    setComment("")
    setUserAddress("")
    setRating(5)
    toast.success("Feedback submitted successfully! Thank you.")
  }

  const uniqueUsers = new Set([...interactions.map((i) => i.address), ...feedbacks.map((f) => f.user)]).size
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : "5.0"

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto">
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
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground">
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
                disabled={!publicKey}
              >
                <Send className="size-3.5" /> 
                {publicKey ? "Send Feedback" : "Connect Wallet to Submit Feedback"}
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
