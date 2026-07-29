"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Plus, Trash, Check, Ban, ShieldAlert, Sparkles, User, Info, Loader2, ArrowRight } from "lucide-react"
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
  const { publicKey } = useWallet()
  const [projects, setProjects] = useState<EscrowProject[]>([])
  const [activeProject, setActiveProject] = useState<EscrowProject | null>(null)
  
  // Form State
  const [projName, setProjName] = useState("")
  const [clientAddr, setClientAddr] = useState("")
  const [freelancerAddr, setFreelancerAddr] = useState("")
  const [arbitratorAddr, setArbitratorAddr] = useState("")
  const [tokenAddr, setTokenAddr] = useState("CCBQXWFFVSY67I7DKGM3RSC7VHZOYJRSU24NRH6BSBGNGM52IEGX4PXD")
  const [tokenSymbol, setTokenSymbol] = useState("USDC")
  const [milestones, setMilestones] = useState<{ description: string; amount: number }[]>([
    { description: "Milestone 1: Design & Architecture", amount: 100 },
    { description: "Milestone 2: Smart Contract & Deployment", amount: 150 }
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

  // Set default client to logged-in user
  useEffect(() => {
    if (publicKey) {
      setClientAddr(publicKey)
    }
  }, [publicKey])

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: `Milestone ${milestones.length + 1}`, amount: 100 }])
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleMilestoneChange = (index: number, field: "description" | "amount", value: any) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projName || !clientAddr || !freelancerAddr || !arbitratorAddr) {
      toast.error("Please fill in all address fields")
      return
    }

    const newProject: EscrowProject = {
      id: `CC${Math.random().toString(36).substring(2, 15).toUpperCase()}ESCROW`,
      name: projName,
      client: clientAddr,
      freelancer: freelancerAddr,
      arbitrator: arbitratorAddr,
      tokenAddress: tokenAddr,
      tokenSymbol: tokenSymbol,
      milestones: milestones.map((m, idx) => ({
        id: idx + 1,
        description: m.description,
        amount: Number(m.amount),
        status: 0 // Created
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
      case 0: return <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-medium">Created</span>
      case 1: return <span className="rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 text-xs font-medium">Funded</span>
      case 2: return <span className="rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium">Submitted</span>
      case 3: return <span className="rounded-full bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-0.5 text-xs font-medium">Released</span>
      case 4: return <span className="rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-0.5 text-xs font-medium">Disputed</span>
      case 5: return <span className="rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2.5 py-0.5 text-xs font-medium">Resolved / Refunded</span>
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

  // Log wallet interaction to server-side API for persistence
  const incrementWalletMetrics = async (actionName: string, _count = 1) => {
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: publicKey || "Unknown Wallet",
          action: actionName,
          txHash: "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + "...testnet",
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">LumenFlow Escrow</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Secure, milestone-based decentralized payment flow on Stellar Soroban.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsSimulated(true)}
            className={`text-xs h-8 rounded-full px-4 ${isSimulated ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
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
            className={`text-xs h-8 rounded-full px-4 ${!isSimulated ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Live Stellar Testnet
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side: Escrow Projects List */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border border-border bg-card p-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center justify-between">
              <span>My Projects</span>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{projects.length}</span>
            </h2>
            
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No escrow contracts initialized yet.</p>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 ${
                      activeProject?.id === proj.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="font-semibold truncate">{proj.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate">{proj.id}</div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-muted-foreground">Milestones: {proj.milestones.length}</span>
                      <span className="font-semibold text-primary">
                        {proj.milestones.reduce((acc, m) => acc + m.amount, 0)} {proj.tokenSymbol}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Active Project Details & Create tab */}
        <div className="md:col-span-2">
          <Tabs defaultValue="manage">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
              <TabsTrigger value="manage">Active Escrow</TabsTrigger>
              <TabsTrigger value="create">New Escrow Contract</TabsTrigger>
            </TabsList>

            {/* MANAGE ESCROW */}
            <TabsContent value="manage">
              {activeProject ? (
                <div className="space-y-6">
                  {/* Escrow Meta info */}
                  <Card className="border border-border bg-card p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{activeProject.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-mono">Contract: {activeProject.id}</span>
                          <CopyButton value={activeProject.id} label="Contract ID copied" className="size-5" />
                        </div>
                      </div>
                      
                      {isSimulated && (
                        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            <Sparkles className="size-3" /> Sandbox Mode
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-xs">
                      <div>
                        <div className="text-muted-foreground font-medium mb-1">Client Address:</div>
                        <div className="font-mono bg-muted p-2 rounded-md truncate flex items-center justify-between">
                          <span>{activeProject.client}</span>
                          {userIsClient && <span className="bg-primary/20 text-primary text-[8px] px-1 rounded ml-1">You</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground font-medium mb-1">Freelancer Address:</div>
                        <div className="font-mono bg-muted p-2 rounded-md truncate flex items-center justify-between">
                          <span>{activeProject.freelancer}</span>
                          {userIsFreelancer && <span className="bg-primary/20 text-primary text-[8px] px-1 rounded ml-1">You</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground font-medium mb-1">Arbitrator Address:</div>
                        <div className="font-mono bg-muted p-2 rounded-md truncate flex items-center justify-between">
                          <span>{activeProject.arbitrator}</span>
                          {userIsArbitrator && <span className="bg-primary/20 text-primary text-[8px] px-1 rounded ml-1">You</span>}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Milestones list */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Project Milestones</h3>
                    {activeProject.milestones.map((m) => (
                      <Card key={m.id} className="border border-border bg-card p-4 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-muted-foreground">#{m.id}</span>
                              <h4 className="font-semibold text-base">{m.description}</h4>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="font-mono text-sm font-bold text-primary">
                                {m.amount} {activeProject.tokenSymbol}
                              </span>
                              {getStatusBadge(m.status)}
                            </div>
                          </div>

                          {/* Action panel based on role & status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* CLIENT actions */}
                            {userIsClient && m.status === 0 && (
                              <Button size="sm" variant="default" onClick={() => handleDeposit(m.id, m.amount)} className="gap-1.5">
                                <Plus className="size-3.5" /> Deposit & Lock
                              </Button>
                            )}

                            {userIsFreelancer && m.status === 1 && (
                              <Button size="sm" variant="default" onClick={() => handleSubmitWork(m.id)} className="gap-1.5">
                                <Plus className="size-3.5" /> Submit Work
                              </Button>
                            )}

                            {userIsClient && (m.status === 1 || m.status === 2 || m.status === 4) && (
                              <Button size="sm" variant="default" onClick={() => handleRelease(m.id, m.amount)} className="gap-1.5">
                                <Check className="size-3.5" /> Release Funds
                              </Button>
                            )}

                            {/* Dispute can be triggered by client/freelancer in Funded/Submitted */}
                            {(userIsClient || userIsFreelancer) && (m.status === 1 || m.status === 2) && (
                              <Button size="sm" variant="destructive" onClick={() => handleDispute(m.id)} className="gap-1.5">
                                <ShieldAlert className="size-3.5" /> File Dispute
                              </Button>
                            )}

                            {/* Voluntary refund by freelancer */}
                            {userIsFreelancer && (m.status === 1 || m.status === 2) && (
                              <Button size="sm" variant="outline" onClick={() => handleRefund(m.id, m.amount)} className="gap-1.5">
                                <Ban className="size-3.5" /> Refund Client
                              </Button>
                            )}

                            {/* ARBITRATOR Actions */}
                            {userIsArbitrator && m.status === 4 && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedMilestoneId(m.id)
                                  setFreelancerShare(m.amount / 2)
                                  setClientShare(m.amount / 2)
                                }}
                                className="gap-1.5"
                              >
                                <ShieldAlert className="size-3.5" /> Resolve Dispute
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Arbitrator Dispute resolution overlay */}
                        {selectedMilestoneId === m.id && (
                          <div className="mt-4 pt-4 border-t border-border space-y-3 bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
                              <Info className="size-3.5" />
                              Arbitrator Panel: Allocate the {m.amount} {activeProject.tokenSymbol} between client and freelancer.
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label htmlFor={`f-share-${m.id}`} className="text-xs">Freelancer Share ({activeProject.tokenSymbol})</Label>
                                <Input 
                                  id={`f-share-${m.id}`}
                                  type="number"
                                  value={freelancerShare}
                                  onChange={(e) => {
                                    const val = Number(e.target.value)
                                    setFreelancerShare(val)
                                    setClientShare(Math.max(0, m.amount - val))
                                  }}
                                  className="h-8 text-xs font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`c-share-${m.id}`} className="text-xs">Client Share ({activeProject.tokenSymbol})</Label>
                                <Input 
                                  id={`c-share-${m.id}`}
                                  type="number"
                                  value={clientShare}
                                  onChange={(e) => {
                                    const val = Number(e.target.value)
                                    setClientShare(val)
                                    setFreelancerShare(Math.max(0, m.amount - val))
                                  }}
                                  className="h-8 text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedMilestoneId(null)}>Cancel</Button>
                              <Button size="sm" variant="default" onClick={() => handleResolve(m.id, m.amount)}>Confirm Resolution</Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg border-border">
                  <h3 className="font-bold text-foreground">No active project selected</h3>
                  <p className="text-sm text-muted-foreground mt-1">Please select an escrow project from the sidebar list or initialize a new one.</p>
                </div>
              )}
            </TabsContent>

            {/* CREATE ESCROW CONTRACT */}
            <TabsContent value="create">
              <Card className="border border-border bg-card p-6">
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proj-name">Project Name</Label>
                    <Input 
                      id="proj-name" 
                      placeholder="e.g. Logo Design for Stellar Startup" 
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-addr">Client Wallet Address</Label>
                      <Input 
                        id="client-addr" 
                        value={clientAddr}
                        onChange={(e) => setClientAddr(e.target.value)}
                        placeholder="G..." 
                        className="font-mono text-xs"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freelancer-addr">Freelancer Wallet Address</Label>
                      <Input 
                        id="freelancer-addr" 
                        value={freelancerAddr}
                        onChange={(e) => setFreelancerAddr(e.target.value)}
                        placeholder="G..." 
                        className="font-mono text-xs"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="arbitrator-addr">Arbitrator Address</Label>
                      <Input 
                        id="arbitrator-addr" 
                        value={arbitratorAddr}
                        onChange={(e) => setArbitratorAddr(e.target.value)}
                        placeholder="GDARBITRATOR..." 
                        className="font-mono text-xs"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-addr">Arbitration Payment Token Contract</Label>
                      <Input 
                        id="token-addr" 
                        value={tokenAddr}
                        onChange={(e) => setTokenAddr(e.target.value)}
                        placeholder="CC..." 
                        className="font-mono text-xs"
                        required 
                      />
                    </div>
                  </div>

                  {/* Milestones Builder */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Contract Milestones</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone} className="gap-1 text-xs">
                        <Plus className="size-3" /> Add Milestone
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-muted p-3 rounded-lg">
                          <span className="text-xs font-bold text-muted-foreground shrink-0">#{idx + 1}</span>
                          <Input 
                            value={m.description}
                            onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                            placeholder="Milestone Description" 
                            className="flex-1 h-9 text-xs"
                            required
                          />
                          <Input 
                            type="number"
                            value={m.amount}
                            onChange={(e) => handleMilestoneChange(idx, "amount", e.target.value)}
                            placeholder="Amount" 
                            className="w-24 h-9 text-xs font-mono"
                            required
                          />
                          {milestones.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveMilestone(idx)} 
                              className="size-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" variant="default" className="w-full gap-2 mt-4 font-semibold">
                    <Loader2 className="size-4 animate-spin hidden" />
                    Deploy & Initialize Escrow Contract
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
