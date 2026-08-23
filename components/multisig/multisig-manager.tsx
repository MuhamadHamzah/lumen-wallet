"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Plus, 
  Key, 
  Check, 
  AlertCircle, 
  Play, 
  FileText, 
  Loader2, 
  RefreshCw 
} from "lucide-react"
import { 
  getAccountDetails, 
  getProposals, 
  createProposal, 
  signProposal, 
  executeProposal,
  type AccountDetails, 
  type MultisigProposal 
} from "@/lib/multisig"

function showToastError(err: any, defaultMsg: string) {
  let msg = defaultMsg
  if (err instanceof Error) {
    msg = err.message
  } else if (err && typeof err === "object") {
    msg = err.message || err.error || JSON.stringify(err)
  } else if (typeof err === "string") {
    msg = err
  }
  toast.error(msg)
}

function checkFreighterResult(signedResult: any) {
  if (signedResult && typeof signedResult === "object" && signedResult.error) {
    const errMsg = typeof signedResult.error === "object"
      ? (signedResult.error.message || JSON.stringify(signedResult.error))
      : String(signedResult.error)
    throw new Error(errMsg)
  }
}

export function MultisigManager() {
  const { publicKey, secretKey, network, walletType } = useWallet()
  
  const [activeTab, setActiveTab] = useState<"overview" | "proposals" | "create" | "setup">("overview")
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [proposals, setProposals] = useState<MultisigProposal[]>([])
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Setup form states
  const [newSignerKey, setNewSignerKey] = useState("")
  const [newSignerWeight, setNewSignerWeight] = useState("1")
  const [lowThreshold, setLowThreshold] = useState("1")
  const [medThreshold, setMedThreshold] = useState("1")
  const [highThreshold, setHighThreshold] = useState("1")

  // Create proposal form states
  const [proposalTitle, setProposalTitle] = useState("")
  const [proposalDesc, setProposalDesc] = useState("")
  const [proposalDest, setProposalDest] = useState("")
  const [proposalAmount, setProposalAmount] = useState("")
  const [proposalMemo, setProposalMemo] = useState("")

  const loadData = useCallback(async (isSilent = false) => {
    if (!publicKey) return
    if (!isSilent) setLoading(true)
    try {
      // 1. Fetch account details
      const details = await getAccountDetails(publicKey, network)
      if (!details) {
        // Account doesn't exist on this network: handled by the UI fallback
        setAccountDetails(null)
        setProposals([])
        return
      }
      setAccountDetails(details)
      
      // Update form default values
      setLowThreshold(String(details.thresholds.low_threshold))
      setMedThreshold(String(details.thresholds.med_threshold))
      setHighThreshold(String(details.thresholds.high_threshold))

      // 2. Fetch active proposals
      const activeProposals = await getProposals(publicKey, network)
      setProposals(activeProposals)
    } catch (err) {
      console.warn("Failed to load multisig details:", err)
      // Unexpected error, reset state
      setAccountDetails(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [publicKey, network])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData(true)
  }

  // Calculate current user's weight
  const userSignerInfo = accountDetails?.signers.find(s => s.key === publicKey)
  const userWeight = userSignerInfo?.weight ?? 0
  
  // Check if wallet is configured as multisig
  const isMultisigConfigured = accountDetails 
    ? accountDetails.signers.length > 1 || accountDetails.thresholds.med_threshold > 1 
    : false

  // Setup Multisig: Add Signer
  const handleAddSigner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountDetails || !publicKey || !secretKey) return
    
    const weightNum = Number(newSignerWeight)
    if (!newSignerKey.trim() || isNaN(weightNum) || weightNum < 0 || weightNum > 255) {
      toast.error("Please enter a valid public key and weight (0-255).")
      return
    }

    setActionLoading(true)
    try {
      const { Keypair, TransactionBuilder, Operation, BASE_FEE } = await import("@stellar/stellar-sdk")
      
      // Load source account details from server
      const serverUrl = network === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org"
      const server = new (await import("@stellar/stellar-sdk")).Horizon.Server(serverUrl)
      const sourceAccount = await server.loadAccount(publicKey)

      const passphrase = network === "mainnet" 
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015"

      // Build transaction
      const builder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: passphrase,
      })

      builder.addOperation(
        Operation.setOptions({
          signer: {
            ed25519PublicKey: newSignerKey.trim(),
            weight: weightNum
          }
        })
      )

      const tx = builder.setTimeout(60).build()
      
      // Determine if we can execute directly or must propose
      const requiredThreshold = accountDetails.thresholds.high_threshold
      if (userWeight >= requiredThreshold && requiredThreshold > 0) {
        // Sign and submit directly
        toast.info("Signing and broadcasting transaction...")
        let signedXdr = ""
        
        if (walletType === "kit" || secretKey.startsWith("kit:")) {
          const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
          const signedResult = await StellarWalletsKit.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
            address: publicKey || undefined,
          })
          signedXdr = signedResult.signedTxXdr
        } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
          const freighterApi = await import("@stellar/freighter-api")
          const signedResult = await freighterApi.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
          })
          checkFreighterResult(signedResult)
          signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
        } else {
          const kp = Keypair.fromSecret(secretKey)
          tx.sign(kp)
          signedXdr = tx.toEnvelope().toXDR("base64")
        }

        const resSubmit = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr, network }),
        })
        if (!resSubmit.ok) {
          const errData = await resSubmit.json()
          throw new Error(errData.error || "Failed to broadcast transaction")
        }
        
        toast.success(`Successfully added signer ${newSignerKey.slice(0, 5)}...`)
        setNewSignerKey("")
        loadData()
      } else {
        // We do not have enough weight. Sign and propose.
        toast.info("Threshold not met. Creating signature proposal instead...")
        let signedXdr = ""
        
        if (walletType === "kit" || secretKey.startsWith("kit:")) {
          const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
          const signedResult = await StellarWalletsKit.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
            address: publicKey || undefined,
          })
          signedXdr = signedResult.signedTxXdr
        } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
          const freighterApi = await import("@stellar/freighter-api")
          const signedResult = await freighterApi.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
          })
          checkFreighterResult(signedResult)
          signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
        } else {
          const kp = Keypair.fromSecret(secretKey)
          tx.sign(kp)
          signedXdr = tx.toEnvelope().toXDR("base64")
        }

        await createProposal({
          title: `Add Signer: ${newSignerKey.slice(0, 6)}...`,
          description: `Add public key ${newSignerKey} as a signer with weight ${weightNum}.`,
          creator: publicKey,
          xdr: signedXdr,
          network,
          targetAccount: publicKey,
          targetWeight: requiredThreshold,
          thresholdType: "high"
        })

        toast.success("Multisig add signer proposal created!")
        setNewSignerKey("")
        setActiveTab("proposals")
        loadData()
      }
    } catch (err) {
      showToastError(err, "Failed to execute option.")
    } finally {
      setActionLoading(false)
    }
  }

  // Setup Multisig: Update Thresholds
  const handleUpdateThresholds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountDetails || !publicKey || !secretKey) return

    const low = Number(lowThreshold)
    const med = Number(medThreshold)
    const high = Number(highThreshold)

    if (isNaN(low) || isNaN(med) || isNaN(high) || low < 0 || med < 0 || high < 0 || low > 255 || med > 255 || high > 255) {
      toast.error("Thresholds must be numbers between 0 and 255.")
      return
    }

    setActionLoading(true)
    try {
      const { Keypair, TransactionBuilder, Operation, BASE_FEE } = await import("@stellar/stellar-sdk")
      
      const serverUrl = network === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org"
      const server = new (await import("@stellar/stellar-sdk")).Horizon.Server(serverUrl)
      const sourceAccount = await server.loadAccount(publicKey)

      const passphrase = network === "mainnet" 
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015"

      // Build transaction
      const builder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: passphrase,
      })

      builder.addOperation(
        Operation.setOptions({
          lowThreshold: low,
          medThreshold: med,
          highThreshold: high,
        })
      )

      const tx = builder.setTimeout(60).build()
      
      // Determine if we can execute directly or must propose
      const requiredThreshold = accountDetails.thresholds.high_threshold
      if (userWeight >= requiredThreshold && requiredThreshold > 0) {
        toast.info("Signing and broadcasting transaction...")
        let signedXdr = ""
        
        if (walletType === "kit" || secretKey.startsWith("kit:")) {
          const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
          const signedResult = await StellarWalletsKit.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
            address: publicKey || undefined,
          })
          signedXdr = signedResult.signedTxXdr
        } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
          const freighterApi = await import("@stellar/freighter-api")
          const signedResult = await freighterApi.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
          })
          checkFreighterResult(signedResult)
          signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
        } else {
          const kp = Keypair.fromSecret(secretKey)
          tx.sign(kp)
          signedXdr = tx.toEnvelope().toXDR("base64")
        }

        const resSubmit = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr, network }),
        })
        if (!resSubmit.ok) {
          const errData = await resSubmit.json()
          throw new Error(errData.error || "Failed to broadcast transaction")
        }
        
        toast.success("Successfully updated account thresholds!")
        loadData()
      } else {
        toast.info("Threshold not met. Creating signature proposal instead...")
        let signedXdr = ""
        
        if (walletType === "kit" || secretKey.startsWith("kit:")) {
          const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
          const signedResult = await StellarWalletsKit.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
            address: publicKey || undefined,
          })
          signedXdr = signedResult.signedTxXdr
        } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
          const freighterApi = await import("@stellar/freighter-api")
          const signedResult = await freighterApi.signTransaction(tx.toEnvelope().toXDR("base64"), {
            networkPassphrase: passphrase,
          })
          checkFreighterResult(signedResult)
          signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
        } else {
          const kp = Keypair.fromSecret(secretKey)
          tx.sign(kp)
          signedXdr = tx.toEnvelope().toXDR("base64")
        }

        await createProposal({
          title: `Update Thresholds: L:${low} M:${med} H:${high}`,
          description: `Change thresholds to Low: ${low}, Med: ${med}, High: ${high}.`,
          creator: publicKey,
          xdr: signedXdr,
          network,
          targetAccount: publicKey,
          targetWeight: requiredThreshold,
          thresholdType: "high"
        })

        toast.success("Multisig update thresholds proposal created!")
        setActiveTab("proposals")
        loadData()
      }
    } catch (err) {
      showToastError(err, "Failed to update thresholds.")
    } finally {
      setActionLoading(false)
    }
  }

  // Create Transaction Proposal (Send Payment)
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountDetails || !publicKey || !secretKey) return

    const amountNum = Number(proposalAmount)
    if (!proposalTitle.trim() || !proposalDest.trim() || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please fill out all required fields with valid values.")
      return
    }

    setActionLoading(true)
    try {
      const { Keypair, TransactionBuilder, Operation, Asset, BASE_FEE } = await import("@stellar/stellar-sdk")
      
      const serverUrl = network === "mainnet" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org"
      const server = new (await import("@stellar/stellar-sdk")).Horizon.Server(serverUrl)
      const sourceAccount = await server.loadAccount(publicKey)

      const passphrase = network === "mainnet" 
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015"

      // Build transaction (payment)
      const builder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: passphrase,
      })

      // Determine if destination account exists. If not, use createAccount.
      let destinationExists = true
      try {
        await server.loadAccount(proposalDest.trim())
      } catch (err) {
        destinationExists = false
      }

      if (destinationExists) {
        builder.addOperation(
          Operation.payment({
            destination: proposalDest.trim(),
            asset: Asset.native(),
            amount: proposalAmount
          })
        )
      } else {
        builder.addOperation(
          Operation.createAccount({
            destination: proposalDest.trim(),
            startingBalance: proposalAmount
          })
        )
      }

      if (proposalMemo.trim()) {
        const { Memo } = await import("@stellar/stellar-sdk")
        builder.addMemo(Memo.text(proposalMemo.trim().slice(0, 28)))
      }

      const tx = builder.setTimeout(60).build()

      // Sign with our connected wallet
      let signedXdr = ""
      if (walletType === "kit" || secretKey.startsWith("kit:")) {
        const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
        const signedResult = await StellarWalletsKit.signTransaction(tx.toEnvelope().toXDR("base64"), {
          networkPassphrase: passphrase,
          address: publicKey || undefined,
        })
        signedXdr = signedResult.signedTxXdr
      } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
        const freighterApi = await import("@stellar/freighter-api")
        const signedResult = await freighterApi.signTransaction(tx.toEnvelope().toXDR("base64"), {
          networkPassphrase: passphrase,
        })
        checkFreighterResult(signedResult)
        signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
      } else {
        const kp = Keypair.fromSecret(secretKey)
        tx.sign(kp)
        signedXdr = tx.toEnvelope().toXDR("base64")
      }

      const requiredThreshold = accountDetails.thresholds.med_threshold

      // Upload proposal draft to coordinator API
      await createProposal({
        title: proposalTitle,
        description: proposalDesc || `Transfer ${proposalAmount} XLM to ${proposalDest.slice(0, 5)}...`,
        creator: publicKey,
        xdr: signedXdr,
        network,
        targetAccount: publicKey,
        targetWeight: requiredThreshold,
        thresholdType: "medium"
      })

      toast.success("Multisig transaction proposal created!")
      setProposalTitle("")
      setProposalDesc("")
      setProposalDest("")
      setProposalAmount("")
      setProposalMemo("")
      setActiveTab("proposals")
      loadData()
    } catch (err) {
      showToastError(err, "Failed to create proposal.")
    } finally {
      setActionLoading(false)
    }
  }

  // Sign an existing proposal
  const handleSignProposal = async (proposal: MultisigProposal) => {
    if (!publicKey || !secretKey || !accountDetails) return

    if (proposal.signersWhoSigned.includes(publicKey)) {
      toast.info("You have already signed this proposal.")
      return
    }

    setActionLoading(true)
    try {
      const { Keypair, TransactionBuilder } = await import("@stellar/stellar-sdk")
      
      const passphrase = network === "mainnet" 
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015"

      // 1. Rebuild transaction from XDR
      const tx = TransactionBuilder.fromXDR(proposal.xdr, passphrase)

      // 2. Add signature
      let signedXdr = ""
      if (walletType === "kit" || secretKey.startsWith("kit:")) {
        const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
        const signedResult = await StellarWalletsKit.signTransaction(tx.toEnvelope().toXDR("base64"), {
          networkPassphrase: passphrase,
          address: publicKey || undefined,
        })
        signedXdr = signedResult.signedTxXdr
      } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
        const freighterApi = await import("@stellar/freighter-api")
        const signedResult = await freighterApi.signTransaction(tx.toEnvelope().toXDR("base64"), {
          networkPassphrase: passphrase,
        })
        checkFreighterResult(signedResult)
        signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
      } else {
        const kp = Keypair.fromSecret(secretKey)
        tx.sign(kp)
        signedXdr = tx.toEnvelope().toXDR("base64")
      }

      // Calculate new weight sum
      const newWeight = proposal.currentWeight + userWeight

      // 3. Post updated XDR and signer to proposals API
      await signProposal(proposal.id, publicKey, signedXdr, newWeight)

      toast.success("Proposal signed successfully!")
      loadData()
    } catch (err) {
      showToastError(err, "Failed to sign proposal.")
    } finally {
      setActionLoading(false)
    }
  }

  // Execute/broadcast a fully signed proposal
  const handleExecuteProposal = async (proposal: MultisigProposal) => {
    if (!publicKey || !secretKey) return

    if (proposal.currentWeight < proposal.targetWeight) {
      toast.error("Weight threshold not met. Collect more signatures first.")
      return
    }

    setActionLoading(true)
    try {
      toast.info("Broadcasting transaction to Horizon network...")

      const resSubmit = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr: proposal.xdr, network }),
      })
      
      if (!resSubmit.ok) {
        const errData = await resSubmit.json().catch(() => ({}))
        throw new Error(errData.error || `Horizon submission failed with status ${resSubmit.status}`)
      }
      
      const { hash } = await resSubmit.json()

      // Update proposal state to executed
      await executeProposal(proposal.id, hash)

      toast.success("Transaction executed and broadcasted successfully!")
      loadData()
    } catch (err) {
      showToastError(err, "Broadcast failed. Please verify credentials.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!accountDetails) {
    return (
      <Card className="p-6 border-border text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-semibold">Account Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          This wallet account is not active on the Stellar {network} network. To set up multi-signature features, you must first fund it with some XLM.
        </p>
        {network === "testnet" && (
          <Button 
            disabled={actionLoading} 
            onClick={async () => {
              setActionLoading(true)
              try {
                const { fundAccount } = await import("@/lib/stellar")
                if (publicKey) {
                  await fundAccount(publicKey, network)
                  toast.success("Account funded! Refreshing...")
                  loadData()
                }
              } catch (e) {
                toast.error("Failed to fund account.")
              } finally {
                setActionLoading(false)
              }
            }}
          >
            {actionLoading ? "Funding..." : "Fund via Friendbot"}
          </Button>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">MultiSig Vault</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Status: {isMultisigConfigured ? "Multi-Signature Configured" : "Standard Single Key"}
            </p>
          </div>
        </div>
        <Button size="icon" variant="outline" className="rounded-xl size-9" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1">
        <div className="flex gap-1.5 p-1 bg-muted/40 border border-border/60 rounded-2xl w-fit min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "overview" 
                ? "bg-card text-foreground shadow-sm border border-border/60" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="inline size-3.5 mr-1.5 -mt-0.5" />
            Signer Weights
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all relative ${
              activeTab === "proposals" 
                ? "bg-card text-foreground shadow-sm border border-border/60" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="inline size-3.5 mr-1.5 -mt-0.5" />
            Signature Queue
            {proposals.filter(p => p.status === "pending").length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 rounded-full bg-primary text-[10px] font-bold text-primary-foreground font-mono">
                {proposals.filter(p => p.status === "pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "create" 
                ? "bg-card text-foreground shadow-sm border border-border/60" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Play className="inline size-3.5 mr-1.5 -mt-0.5" />
            Create Proposal
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "setup" 
                ? "bg-card text-foreground shadow-sm border border-border/60" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="inline size-3.5 mr-1.5 -mt-0.5" />
            Configure Quorum
          </button>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Signers & Thresholds Visualizer (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Signers &amp; Key Weights</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Accounts authorized to co-sign transactions from this vault.</p>
            </div>
            
            <div className="space-y-3">
              {accountDetails.signers.map((signer, index) => (
                <div key={index} className="flex items-center justify-between border border-border/50 bg-muted/30 p-3.5 rounded-2xl">
                  <div className="space-y-1 min-w-0">
                    <span className="text-xs font-mono font-medium text-foreground tracking-tight break-all">
                      {signer.key}
                    </span>
                    <div className="flex gap-2">
                      {signer.key === publicKey && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/25 rounded-full font-mono">
                          Active User
                        </span>
                      )}
                      {index === 0 && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-muted text-muted-foreground border border-border rounded-full font-mono">
                          Master Key
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-base font-mono font-extrabold text-primary">{signer.weight}</div>
                    <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Weight</div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Threshold Requirements Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted/40 rounded-xl border border-border/20">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Low</div>
                <div className="text-xl font-extrabold">{accountDetails.thresholds.low_threshold}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Trustlines / Allowances</div>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/20">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Medium</div>
                <div className="text-xl font-extrabold text-primary font-mono">{accountDetails.thresholds.med_threshold}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Payments / Swaps</div>
              </div>
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/40">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">High</div>
                <div className="text-xl font-extrabold font-mono">{accountDetails.thresholds.high_threshold}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Signer / Threshold Settings</div>
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Safe Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signers Count:</span>
                <span className="font-semibold font-mono">{accountDetails.signers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Weight:</span>
                <span className="font-semibold font-mono text-primary">{userWeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Weight (Med):</span>
                <span className="font-semibold font-mono">
                  {accountDetails.thresholds.med_threshold} weight
                </span>
              </div>
              
              <Separator />

              {/* Progress bar indicating authorization weight */}
              {isMultisigConfigured && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Your Execution Capacity:</span>
                    <span className="font-mono">{Math.round((userWeight / accountDetails.thresholds.med_threshold) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((userWeight / accountDetails.thresholds.med_threshold) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal mt-1">
                    {userWeight >= accountDetails.thresholds.med_threshold 
                      ? "Your signature is sufficient to broadcast medium-risk transactions alone." 
                      : "⚠️ Transactions will require co-signatures from other authorized signers."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Proposals Tab */}
      {activeTab === "proposals" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-6">
          <div className="pb-3 border-b border-border/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Signature Authorization Queue</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Manage ongoing transactions requiring quorum authorization.</p>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground space-y-2">
              <FileText className="size-8 mx-auto opacity-30" />
              <p className="text-xs font-mono">No active signature proposals found for this account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => {
                const hasSigned = proposal.signersWhoSigned.includes(publicKey || "")
                const canExecute = proposal.currentWeight >= proposal.targetWeight
                
                return (
                  <div key={proposal.id} className="p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-4 hover:border-primary/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          proposal.status === "executed" 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                            : proposal.status === "failed" 
                            ? "bg-destructive/15 text-destructive border border-destructive/20" 
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        }`}>
                          {proposal.status}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{proposal.title}</h4>
                        <p className="text-xs text-muted-foreground leading-normal">{proposal.description}</p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-foreground">
                          Weight: {proposal.currentWeight} / {proposal.targetWeight}
                        </div>
                        <div className="w-24 bg-muted rounded-full h-1.5 mt-1 ml-auto">
                          <div 
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${Math.min((proposal.currentWeight / proposal.targetWeight) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="border-border/30" />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                      <div className="space-y-1 font-medium text-muted-foreground leading-normal">
                        <div>Creator: <span className="font-mono text-foreground/80">{proposal.creator.slice(0, 8)}...</span></div>
                        <div>Signed by: {proposal.signersWhoSigned.map(s => s.slice(0, 5) + "...").join(", ")}</div>
                        {proposal.txHash && (
                          <div className="break-all">
                            Tx Hash:{" "}
                            <a 
                              href={network === "mainnet" ? `https://stellar.expert/explorer/public/tx/${proposal.txHash}` : `https://stellar.expert/explorer/testnet/tx/${proposal.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-mono"
                            >
                              {proposal.txHash.slice(0, 15)}...
                            </a>
                          </div>
                        )}
                      </div>

                      {proposal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={hasSigned ? "secondary" : "outline"} 
                            disabled={hasSigned || actionLoading} 
                            onClick={() => handleSignProposal(proposal)}
                            className="h-8 rounded-xl text-xs font-semibold"
                          >
                            {hasSigned ? (
                              <>
                                <Check className="size-3.5 mr-1" />
                                Signed
                              </>
                            ) : actionLoading ? (
                              "Signing..."
                            ) : (
                              <>
                                <Key className="size-3.5 mr-1" />
                                Sign Proposal
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={!canExecute || actionLoading} 
                            onClick={() => handleExecuteProposal(proposal)}
                            className="h-8 rounded-xl text-xs font-semibold shadow-sm"
                          >
                            {actionLoading ? "Executing..." : (
                              <>
                                <Play className="size-3.5 mr-1" />
                                Execute Quorum
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Proposal Tab */}
      {activeTab === "create" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-5">
          <div className="pb-3 border-b border-border/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Propose MultiSig Payment</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Draft a transaction to initiate signature collection from authorized keys.</p>
          </div>

          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="propTitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proposal Title *
                </Label>
                <Input 
                  id="propTitle"
                  placeholder="e.g. Disburse 50 XLM to core dev"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="propDest" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recipient Public Key *
                </Label>
                <Input 
                  id="propDest"
                  placeholder="starts with G..."
                  value={proposalDest}
                  onChange={(e) => setProposalDest(e.target.value.trim())}
                  className="font-mono text-xs rounded-xl h-10"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="propAmount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount (XLM) *
                </Label>
                <Input 
                  id="propAmount"
                  type="number"
                  step="0.00001"
                  min="0.00001"
                  placeholder="0.0"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(e.target.value)}
                  className="font-mono text-xs rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="propMemo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Memo (Optional)
                </Label>
                <Input 
                  id="propMemo"
                  placeholder="max 28 characters"
                  value={proposalMemo}
                  onChange={(e) => setProposalMemo(e.target.value)}
                  maxLength={28}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="propDesc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reason / Description
              </Label>
              <Textarea 
                id="propDesc"
                placeholder="Explain the purpose of this transaction..."
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                className="text-xs rounded-xl"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-xs shadow-md focus-visible:ring-2 focus-visible:ring-primary" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Proposing...
                </>
              ) : (
                "Propose & Sign Transaction"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Setup Safe Tab */}
      {activeTab === "setup" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Add Signer Form */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Add / Edit Signer</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Authorize a new key or adjust existing signing weight.</p>
            </div>
            
            <form onSubmit={handleAddSigner} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="signerKey" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Signer Public Key
                </Label>
                <Input 
                  id="signerKey"
                  placeholder="G..."
                  value={newSignerKey}
                  onChange={(e) => setNewSignerKey(e.target.value.trim())}
                  className="font-mono text-xs rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signerWeight" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Signer Weight (0-255)
                </Label>
                <Input 
                  id="signerWeight"
                  type="number"
                  min="0"
                  max="255"
                  value={newSignerWeight}
                  onChange={(e) => setNewSignerWeight(e.target.value)}
                  className="font-mono text-xs rounded-xl h-10"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10 rounded-xl font-semibold text-xs shadow-md" disabled={actionLoading}>
                {actionLoading ? "Processing..." : "Commit Signer Update"}
              </Button>
            </form>
          </div>

          {/* Update Thresholds Form */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Configure Quorum Thresholds</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Adjust required weights for low, medium, and high security tiers.</p>
            </div>

            <form onSubmit={handleUpdateThresholds} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lowThresh" className="text-xs font-semibold text-muted-foreground">Low</Label>
                  <Input 
                    id="lowThresh"
                    type="number"
                    min="0"
                    max="255"
                    value={lowThreshold}
                    onChange={(e) => setLowThreshold(e.target.value)}
                    className="font-mono text-xs rounded-xl h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="medThresh" className="text-xs font-semibold text-muted-foreground">Medium</Label>
                  <Input 
                    id="medThresh"
                    type="number"
                    min="0"
                    max="255"
                    value={medThreshold}
                    onChange={(e) => setMedThreshold(e.target.value)}
                    className="font-mono text-xs rounded-xl h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="highThresh" className="text-xs font-semibold text-muted-foreground">High</Label>
                  <Input 
                    id="highThresh"
                    type="number"
                    min="0"
                    max="255"
                    value={highThreshold}
                    onChange={(e) => setHighThreshold(e.target.value)}
                    className="font-mono text-xs rounded-xl h-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-10 rounded-xl font-semibold text-xs shadow-md" disabled={actionLoading}>
                {actionLoading ? "Processing..." : "Update Quorum Thresholds"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
