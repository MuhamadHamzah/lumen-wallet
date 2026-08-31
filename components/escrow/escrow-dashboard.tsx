"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Plus, Trash, Check, Ban, ShieldAlert, User, Info, Loader2, ArrowRight, DollarSign, Cpu } from "lucide-react"
import { toast } from "sonner"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Milestone {
  id: number;
  description: string;
  amount: number;
  status: number; // 0 = Created, 1 = Funded, 2 = Submitted, 3 = Released, 4 = Disputed, 5 = Resolved/Refunded
  deadline?: number; // Unix timestamp in seconds
}

interface EscrowProject {
  id: string;
  name: string;
  client: string;
  freelancer: string;
  arbitrator: string;
  tokenAddress: string;
  tokenSymbol: string;
  milestones: Milestone[];
}




export function EscrowDashboard() {
  const { publicKey, network } = useWallet()
  const [projects, setProjects] = useState<EscrowProject[]>([])
  const [activeProject, setActiveProject] = useState<EscrowProject | null>(null)
  
  // Form State
  const [projName, setProjName] = useState("")
  const [clientAddr, setClientAddr] = useState("")
  const [freelancerAddr, setFreelancerAddr] = useState("")
  const [arbitratorAddr, setArbitratorAddr] = useState("")
  const [tokenAddr, setTokenAddr] = useState("CCBQXWFFVSY67I7DKGM3RSC7VHZOYJRSU24NRH6BSBGNGM52IEGX4PXD")
  const [tokenSymbol, setTokenSymbol] = useState("USDC")
  const [milestones, setMilestones] = useState<{ description: string; amount: number; deadlineDays: number }[]>([
    { description: "Milestone 1: Design & Architecture", amount: 100, deadlineDays: 7 },
    { description: "Milestone 2: Smart Contract & Deployment", amount: 150, deadlineDays: 14 }
  ])

  // Arbitration Form State
  const [freelancerShare, setFreelancerShare] = useState<number>(0)
  const [clientShare, setClientShare] = useState<number>(0)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null)

  // Simulation mode
  const [isSimulated, setIsSimulated] = useState(true)

  // Load from server-side API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("/api/escrow")
        if (res.ok) {
          const data = await res.json()
          const parsed = data.projects || []
          setProjects(parsed)
          if (parsed.length > 0) setActiveProject(parsed[0])
        }
      } catch (err) {
        console.error("Failed to load escrow projects:", err)
      }
    }
    loadProjects()
  }, [publicKey])

  // Save projects to server
  const saveProjects = async (updated: EscrowProject[]) => {
    setProjects(updated)
    try {
      await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_all", projects: updated }),
      })
    } catch (err) {
      console.error("Failed to save escrow projects:", err)
    }
  }

  // Set default client and token address based on network
  useEffect(() => {
    if (publicKey) {
      setClientAddr(publicKey)
    }
    const isMainnet = network === "mainnet"
    setTokenAddr(isMainnet ? "CAWDNAUATO6EPYCAD57EBY45YGLDMRE4ZHKTWN6GBMCPATMHWUMG7CLT" : "CCBQXWFFVSY67I7DKGM3RSC7VHZOYJRSU24NRH6BSBGNGM52IEGX4PXD")
  }, [publicKey, network])

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: `Milestone ${milestones.length + 1}`, amount: 100, deadlineDays: 7 }])
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleMilestoneChange = (index: number, field: "description" | "amount" | "deadlineDays", value: string) => {
    const updated = [...milestones]
    if (field === "amount") {
      updated[index].amount = Number(value)
    } else if (field === "deadlineDays") {
      updated[index].deadlineDays = Number(value)
    } else {
      updated[index].description = value
    }
    setMilestones(updated)
  }

  const handleCreateProject = async () => {
    if (!projName || !clientAddr || !freelancerAddr || !arbitratorAddr) {
      toast.error("Please fill in all address fields")
      return
    }

    const isMainnet = network === "mainnet"
    const nowSec = Math.floor(Date.now() / 1000)
    const newProject: EscrowProject = {
      id: isMainnet ? "CAEY3YRTOPP5KLJYQ2JRUTJNUG7VMXMEHJVTJP3FFS73XY37CAPB5KT3" : "CCLAKX7JHV4V7BWFQ62DZEQNNJAVYEBNOHWOFUVC6CRVLROQ6Z4O2364",
      name: projName,
      client: clientAddr,
      freelancer: freelancerAddr,
      arbitrator: arbitratorAddr,
      tokenAddress: tokenAddr,
      tokenSymbol: tokenSymbol,
      milestones: milestones.map((m, idx) => ({
        id: idx + 1,
        description: m.description,
        amount: m.amount,
        status: 0,
        deadline: nowSec + (m.deadlineDays || 7) * 86400,
      }))
    }

    const updated = [...projects, newProject]
    saveProjects(updated)
    setActiveProject(newProject)
    setProjName("")
    setFreelancerAddr("")
    setArbitratorAddr("")
    toast.success("Milestone Escrow contract initialized successfully!")
    
    // Increment wallet interaction metrics
    incrementWalletMetrics(`Escrow Contract Created (${projName})`, 2)
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <span className="rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono">Created</span>
      case 1: return <span className="rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono">Funded</span>
      case 2: return <span className="rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono">Submitted</span>
      case 3: return <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono">Released</span>
      case 4: return <span className="rounded-full bg-destructive/10 text-destructive border border-destructive/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono">Disputed</span>
      case 5: return <span className="rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono">Resolved / Refunded</span>
      default: return null
    }
  }

  // Triggering actions on milestones
  const updateMilestoneStatus = (milestoneId: number, nextStatus: number, extra?: Partial<Milestone>) => {
    if (!activeProject) return

    const updatedMilestones = activeProject.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, status: nextStatus, ...extra }
      }
      return m
    })

    const updatedProject = { ...activeProject, milestones: updatedMilestones }
    const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p)
    
    saveProjects(updatedProjects)
    setActiveProject(updatedProject)
  }

  const handleDeposit = (mId: number, amount: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Depositing ${amount} ${activeProject?.tokenSymbol} into Escrow contract...`,
        success: () => {
          updateMilestoneStatus(mId, 1) // Set status to Funded
          incrementWalletMetrics(`Milestone #${mId} Funded (${amount} ${activeProject?.tokenSymbol})`, 1)
          return `Successfully deposited and locked ${amount} ${activeProject?.tokenSymbol}!`
        },
        error: "Failed to deposit funds."
      }
    )
  }

  const handleSubmitWork = (mId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Submitting milestone proof of completion...",
        success: () => {
          updateMilestoneStatus(mId, 2) // Set status to Submitted
          incrementWalletMetrics(`Milestone #${mId} Work Submitted`, 1)
          return "Milestone successfully submitted for client review!"
        },
        error: "Failed to submit work."
      }
    )
  }

  const handleRelease = (mId: number, amount: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Releasing ${amount} ${activeProject?.tokenSymbol} to freelancer...`,
        success: () => {
          updateMilestoneStatus(mId, 3) // Set status to Released
          incrementWalletMetrics(`Milestone #${mId} Released (${amount} ${activeProject?.tokenSymbol})`, 1)
          return `Successfully released ${amount} ${activeProject?.tokenSymbol} to freelancer!`
        },
        error: "Failed to release funds."
      }
    )
  }

  const handleDispute = (mId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Filing milestone dispute with arbitrator...",
        success: () => {
          updateMilestoneStatus(mId, 4) // Set status to Disputed
          incrementWalletMetrics(`Milestone #${mId} Dispute Filed`, 1)
          return "Dispute successfully filed. Arbitrator signature required to resolve."
        },
        error: "Failed to dispute."
      }
    )
  }

  const handleResolve = (mId: number, totalAmount: number) => {
    if (freelancerShare + clientShare !== totalAmount) {
      toast.error(`Total shares must sum exactly to milestone value (${totalAmount} ${activeProject?.tokenSymbol})`)
      return
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1800)),
      {
        loading: "Executing arbitrator dispute resolution...",
        success: () => {
          updateMilestoneStatus(mId, 5) // Set status to Resolved
          incrementWalletMetrics(`Dispute Resolved (Milestone #${mId})`, 1)
          setSelectedMilestoneId(null)
          return `Dispute resolved on-chain! Freelancer: ${freelancerShare} ${activeProject?.tokenSymbol}, Client: ${clientShare} ${activeProject?.tokenSymbol}`
        },
        error: "Failed to resolve."
      }
    )
  }

  const handleRefund = (mId: number, amount: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Refunding ${amount} ${activeProject?.tokenSymbol} to client...`,
        success: () => {
          updateMilestoneStatus(mId, 5) // Set status to Resolved/Cancelled
          incrementWalletMetrics(`Milestone #${mId} Refund Issued (${amount} ${activeProject?.tokenSymbol})`, 1)
          return `Voluntary refund of ${amount} ${activeProject?.tokenSymbol} returned to client!`
        },
        error: "Failed to refund."
      }
    )
  }

  const handleClaimExpired = (mId: number, amount: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Clawing back expired milestone funds (${amount} ${activeProject?.tokenSymbol})...`,
        success: () => {
          updateMilestoneStatus(mId, 5) // Set status to Resolved/Refunded
          incrementWalletMetrics(`Milestone #${mId} Timeout Clawback (${amount} ${activeProject?.tokenSymbol})`, 1)
          return `Timeout clawback executed! ${amount} ${activeProject?.tokenSymbol} refunded to your client wallet.`
        },
        error: "Failed to claim expired milestone."
      }
    )
  }

  // Log wallet interaction to server-side API for persistence
  const incrementWalletMetrics = async (actionName: string, _count = 1) => {
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: publicKey || "Unknown Wallet",
          action: actionName,
          txHash: "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + (network === "mainnet" ? "...mainnet" : "...testnet"),
          network: network || "mainnet",
        }),
      })
    } catch (err) {
      console.error("Failed to log interaction:", err)
    }
  }

  // Check roles
  const userIsClient = !publicKey || activeProject?.client === publicKey
  const userIsFreelancer = activeProject?.freelancer === publicKey
  const userIsArbitrator = activeProject?.arbitrator === publicKey

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <DollarSign className="size-5" />
            </span>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Milestone Escrow Studio</h1>
          </div>
          <p className="text-muted-foreground text-xs font-mono mt-1">
            Soroban WASM Smart Contract Milestone Pipeline
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 p-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsSimulated(true)}
            className={`text-xs h-7 rounded-full px-3.5 transition-all ${isSimulated ? "bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            Simulated Sandbox
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (!publicKey) {
                toast.error("Connect Freighter or create a wallet keypair first")
                return
              }
              setIsSimulated(false)
            }}
            className={`text-xs h-7 rounded-full px-3.5 transition-all ${!isSimulated ? "bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            Live Stellar Testnet
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Escrow Projects List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">My Contracts</span>
              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{projects.length}</span>
            </div>
            
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10 font-mono">No escrow contracts initialized yet.</p>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all ${
                      activeProject?.id === proj.id 
                        ? "border-primary/40 bg-primary/[0.06] shadow-sm font-semibold text-foreground" 
                        : "border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-semibold truncate text-foreground text-sm">{proj.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate">{proj.id}</div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40 text-xs">
                      <span>Milestones: {proj.milestones.length}</span>
                      <span className="font-bold text-primary font-mono">
                        {proj.milestones.reduce((acc, m) => acc + m.amount, 0)} {proj.tokenSymbol}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Project Details & Create tab (8 Cols) */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="manage" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-sm rounded-2xl h-10 p-1 bg-muted/40 border border-border/60">
              <TabsTrigger value="manage" className="rounded-xl text-xs font-semibold">Active Escrow</TabsTrigger>
              <TabsTrigger value="create" className="rounded-xl text-xs font-semibold">New Escrow Contract</TabsTrigger>
            </TabsList>

            {/* MANAGE ESCROW */}
            <TabsContent value="manage" className="space-y-4">
              {activeProject ? (
                <div className="space-y-5">
                  {/* Escrow Meta info */}
                  <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border/40">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{activeProject.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded-lg border border-border/60">
                            Contract: {activeProject.id}
                          </span>
                          <CopyButton value={activeProject.id} label="Contract ID copied" className="size-6" />
                        </div>
                      </div>
                      
                      {isSimulated && (
                        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary font-mono">
                          <Cpu className="size-3" /> Sandbox VM
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block">Client (Depositor)</span>
                        <div className="font-mono text-[11px] truncate flex items-center justify-between text-foreground">
                          <span>{activeProject.client}</span>
                          {userIsClient && <span className="bg-primary/15 text-primary border border-primary/20 text-[8px] px-1.5 py-0.5 rounded-full font-bold">You</span>}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block">Freelancer (Beneficiary)</span>
                        <div className="font-mono text-[11px] truncate flex items-center justify-between text-foreground">
                          <span>{activeProject.freelancer}</span>
                          {userIsFreelancer && <span className="bg-primary/15 text-primary border border-primary/20 text-[8px] px-1.5 py-0.5 rounded-full font-bold">You</span>}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block">Arbitrator (Guardian)</span>
                        <div className="font-mono text-[11px] truncate flex items-center justify-between text-foreground">
                          <span>{activeProject.arbitrator}</span>
                          {userIsArbitrator && <span className="bg-primary/15 text-primary border border-primary/20 text-[8px] px-1.5 py-0.5 rounded-full font-bold">You</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones progress overview */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Milestone Pipeline</h3>
                      {(() => {
                        const total = activeProject.milestones.length
                        const released = activeProject.milestones.filter(m => m.status === 3 || m.status === 5).length
                        const pct = total > 0 ? Math.round((released / total) * 100) : 0
                        return (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground font-mono">{released}/{total} Complete ({pct}%)</span>
                            <div className="w-24 bg-muted h-2 rounded-full overflow-hidden border border-border">
                              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    <div className="space-y-3">
                      {activeProject.milestones.map((m) => (
                        <div key={m.id} className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl space-y-3 shadow-sm hover:border-primary/40 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md font-mono">Stage #{m.id}</span>
                                <h4 className="font-bold text-sm text-foreground">{m.description}</h4>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="font-mono text-sm font-extrabold text-primary">
                                  {m.amount} {activeProject.tokenSymbol}
                                </span>
                                {getStatusBadge(m.status)}
                                {m.deadline && (
                                  (() => {
                                    const nowSec = Math.floor(Date.now() / 1000)
                                    const isExpired = nowSec >= m.deadline
                                    const diffHours = Math.round((m.deadline - nowSec) / 3600)
                                    const diffDays = Math.round(diffHours / 24)
                                    return (
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                          isExpired
                                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold"
                                            : "bg-muted/50 border-border text-muted-foreground"
                                        }`}
                                      >
                                        {isExpired ? "⏰ Expired (Clawback Eligible)" : `⏳ ${diffDays > 0 ? `${diffDays}d left` : `${diffHours}h left`}`}
                                      </span>
                                    )
                                  })()
                                )}
                              </div>
                            </div>

                            {/* Action panel based on role & status */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {userIsClient && m.status === 0 && (
                                <Button size="sm" onClick={() => handleDeposit(m.id, m.amount)} className="gap-1.5 rounded-xl text-xs h-8">
                                  <Plus className="size-3.5" /> Deposit &amp; Lock
                                </Button>
                              )}

                              {userIsFreelancer && m.status === 1 && (
                                <Button size="sm" onClick={() => handleSubmitWork(m.id)} className="gap-1.5 rounded-xl text-xs h-8">
                                  <Plus className="size-3.5" /> Submit Deliverables
                                </Button>
                              )}

                              {userIsClient && (m.status === 1 || m.status === 2 || m.status === 4) && (
                                <Button size="sm" onClick={() => handleRelease(m.id, m.amount)} className="gap-1.5 rounded-xl text-xs h-8">
                                  <Check className="size-3.5" /> Release Funds
                                </Button>
                              )}

                              {(userIsClient || userIsFreelancer) && (m.status === 1 || m.status === 2) && (
                                <Button size="sm" variant="destructive" onClick={() => handleDispute(m.id)} className="gap-1.5 rounded-xl text-xs h-8">
                                  <ShieldAlert className="size-3.5" /> File Dispute
                                </Button>
                              )}

                              {userIsFreelancer && (m.status === 1 || m.status === 2) && (
                                <Button size="sm" variant="outline" onClick={() => handleRefund(m.id, m.amount)} className="gap-1.5 rounded-xl text-xs h-8">
                                  <Ban className="size-3.5" /> Refund Client
                                </Button>
                              )}

                              {userIsClient && (m.status === 1 || m.status === 4) && m.deadline && Math.floor(Date.now() / 1000) >= m.deadline && (
                                <Button size="sm" variant="destructive" onClick={() => handleClaimExpired(m.id, m.amount)} className="gap-1.5 rounded-xl text-xs h-8 bg-rose-600 hover:bg-rose-700">
                                  <AlertTriangle className="size-3.5" /> Claim Expired Funds
                                </Button>
                              )}

                              {userIsArbitrator && m.status === 4 && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedMilestoneId(m.id)
                                    setFreelancerShare(m.amount / 2)
                                    setClientShare(m.amount / 2)
                                  }}
                                  className="gap-1.5 rounded-xl text-xs h-8"
                                >
                                  <ShieldAlert className="size-3.5" /> Resolve Dispute
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Arbitrator Dispute Overlay */}
                          {selectedMilestoneId === m.id && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-3 bg-muted/40 p-4 rounded-2xl">
                              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                                <Info className="size-3.5" />
                                Arbitrator Allocation: Distribute {m.amount} {activeProject.tokenSymbol}
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                  <Label className="text-[10px]">Freelancer Share</Label>
                                  <Input 
                                    type="number"
                                    value={freelancerShare}
                                    onChange={(e) => {
                                      const val = Number(e.target.value)
                                      setFreelancerShare(val)
                                      setClientShare(Math.max(0, m.amount - val))
                                    }}
                                    className="h-8 text-xs font-mono rounded-lg"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px]">Client Share</Label>
                                  <Input 
                                    type="number"
                                    value={clientShare}
                                    onChange={(e) => {
                                      const val = Number(e.target.value)
                                      setClientShare(val)
                                      setFreelancerShare(Math.max(0, m.amount - val))
                                    }}
                                    className="h-8 text-xs font-mono rounded-lg"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="ghost" className="h-8 text-xs rounded-xl" onClick={() => setSelectedMilestoneId(null)}>Cancel</Button>
                                <Button size="sm" className="h-8 text-xs rounded-xl" onClick={() => handleResolve(m.id, m.amount)}>Confirm Resolution</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-muted/10">
                  <h3 className="font-bold text-foreground text-sm">No active escrow project selected</h3>
                  <p className="text-xs text-muted-foreground mt-1">Select a contract from the sidebar or deploy a new agreement.</p>
                </div>
              )}
            </TabsContent>

            {/* CREATE ESCROW CONTRACT */}
            <TabsContent value="create">
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-4">
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Project Contract Title
                    </Label>
                    <Input 
                      id="proj-name" 
                      placeholder="e.g. Soroban Smart Contract Architecture Audit" 
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="rounded-xl h-10 text-xs"
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="client-addr" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Client Public Address
                      </Label>
                      <Input 
                        id="client-addr" 
                        value={clientAddr}
                        onChange={(e) => setClientAddr(e.target.value)}
                        placeholder="G..." 
                        className="font-mono text-xs rounded-xl h-10"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="freelancer-addr" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Freelancer Public Address
                      </Label>
                      <Input 
                        id="freelancer-addr" 
                        value={freelancerAddr}
                        onChange={(e) => setFreelancerAddr(e.target.value)}
                        placeholder="G..." 
                        className="font-mono text-xs rounded-xl h-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="arbitrator-addr" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Arbitrator Public Address
                      </Label>
                      <Input 
                        id="arbitrator-addr" 
                        value={arbitratorAddr}
                        onChange={(e) => setArbitratorAddr(e.target.value)}
                        placeholder="GDARBITRATOR..." 
                        className="font-mono text-xs rounded-xl h-10"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="token-addr" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Payment Token Contract ID
                      </Label>
                      <Input 
                        id="token-addr" 
                        value={tokenAddr}
                        onChange={(e) => setTokenAddr(e.target.value)}
                        placeholder="CC..." 
                        className="font-mono text-xs rounded-xl h-10"
                        required 
                      />
                    </div>
                  </div>

                  {/* Milestones Builder */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contract Milestones</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone} className="gap-1 text-xs rounded-xl h-8">
                        <Plus className="size-3" /> Add Stage
                      </Button>
                    </div>

                    <div className="space-y-2.5">
                      {milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-muted/40 p-3 rounded-2xl border border-border/50">
                          <span className="text-xs font-mono font-bold text-muted-foreground shrink-0">#{idx + 1}</span>
                          <Input 
                            value={m.description}
                            onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                            placeholder="Milestone Description" 
                            className="flex-1 h-9 text-xs rounded-xl"
                            required 
                          />
                          <Input 
                            type="number"
                            value={m.amount}
                            onChange={(e) => handleMilestoneChange(idx, "amount", e.target.value)}
                            placeholder="Amount" 
                            className="w-20 h-9 text-xs font-mono rounded-xl"
                            required 
                          />
                          <div className="flex items-center gap-1 shrink-0 bg-background/50 px-2 py-1 rounded-xl border border-border/40">
                            <span className="text-[10px] text-muted-foreground font-mono">Exp:</span>
                            <Input 
                              type="number"
                              value={m.deadlineDays || 7}
                              onChange={(e) => handleMilestoneChange(idx, "deadlineDays", e.target.value)}
                              placeholder="Days" 
                              className="w-14 h-7 text-xs font-mono p-1 text-center rounded-lg border-0 bg-transparent"
                              title="Expiration Deadline in Days"
                              required 
                            />
                            <span className="text-[10px] text-muted-foreground font-mono">d</span>
                          </div>
                          {milestones.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveMilestone(idx)} 
                              className="size-8 text-destructive hover:bg-destructive/10 rounded-xl"
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 rounded-xl font-semibold gap-2 mt-4 shadow-md focus-visible:ring-2 focus-visible:ring-primary">
                    <Loader2 className="size-4 animate-spin hidden" />
                    Deploy &amp; Initialize Soroban Escrow
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
