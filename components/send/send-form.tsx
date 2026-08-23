"use client"

import { useState } from "react"
import Link from "next/link"
import { useSWRConfig } from "swr"
import useSWR from "swr"
import { CheckCircle2, ExternalLink, Loader2, Send, ShieldCheck, ArrowRight, Wallet, Info } from "lucide-react"
import { toast } from "sonner"
import { getBalance, getFeeEstimate, isValidPublic, sendPayment, stellarExpertUrl, truncate } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const logInteraction = async (pubKey: string, actionName: string, txHash: string, network = "mainnet") => {
  try {
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: pubKey,
        action: actionName,
        txHash,
        network,
      }),
    })
  } catch (err) {
    console.error("Failed to log interaction:", err)
  }
}

export function SendForm() {
  const { secretKey, publicKey, network, walletType } = useWallet()
  const { mutate } = useSWRConfig()
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { data: balance } = useSWR(
    publicKey ? ["balance", publicKey, network] : null,
    () => getBalance(publicKey as string, network),
  )

  const currentBalNum = Number((balance ?? "0").replace(/,/g, ""))
  const fee = getFeeEstimate()
  const feeNum = Number(fee) || 0.00001
  const baseReserve = 1.0 // Stellar protocol mandatory minimum reserve
  const spendableBalance = Math.max(0, currentBalNum - baseReserve - feeNum)
  const destinationValid = destination === "" || isValidPublic(destination)
  const amountNum = Number(amount)
  const canSubmit =
    isValidPublic(destination) && amount !== "" && amountNum > 0 && !loading && amountNum <= spendableBalance

  const remainingBalance = Math.max(0, currentBalNum - (amountNum || 0) - feeNum)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !secretKey) return

    // StellarWalletsKit signing flow
    if (walletType === "kit" || (secretKey && secretKey.startsWith("kit:"))) {
      setLoading(true)
      try {
        const resPrepare = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: publicKey, destination, amount, memo, network }),
        })
        if (!resPrepare.ok) {
          const errData = await resPrepare.json().catch(() => ({}))
          throw new Error(errData.error || `Prepare request failed with status ${resPrepare.status}`)
        }
        const { unsignedTxXdr } = await resPrepare.json()

        const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
        const networkPassphrase = network === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedTxXdr, {
          networkPassphrase,
          address: publicKey || undefined,
        })

        if (!signedTxXdr) {
          throw new Error("Failed to retrieve signature from the wallet.")
        }

        const resSubmit = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr: signedTxXdr, network }),
        })
        if (!resSubmit.ok) {
          const errData = await resSubmit.json().catch(() => ({}))
          throw new Error(errData.error || `Submission failed with status ${resSubmit.status}`)
        }
        const { hash } = await resSubmit.json()

        setTxHash(hash)
        toast.success("Payment sent successfully via wallet")
        logInteraction(publicKey || "Unknown", "Send XLM", hash, network)
        if (publicKey) {
          mutate(["balance", publicKey, network])
          mutate(["transactions", publicKey, network])
        }
      } catch (err: any) {
        let msg = "Payment failed. Please try again."
        if (err instanceof Error) {
          msg = err.message
        } else if (err && typeof err === "object") {
          msg = err.message || err.error || JSON.stringify(err)
        } else if (typeof err === "string") {
          msg = err
        }
        toast.error(msg)
      } finally {
        setLoading(false)
      }
      return
    }

    // Freighter signing flow
    if (walletType === "freighter" || (secretKey && secretKey.startsWith("freighter:"))) {
      setLoading(true)
      try {
        const resPrepare = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: publicKey, destination, amount, memo, network }),
        })
        if (!resPrepare.ok) {
          const errData = await resPrepare.json().catch(() => ({}))
          throw new Error(errData.error || `Prepare request failed with status ${resPrepare.status}`)
        }
        const { unsignedTxXdr } = await resPrepare.json()

        const freighterApi = await import("@stellar/freighter-api")
        const isInstalled = await freighterApi.isConnected()
        if (!isInstalled) {
          throw new Error("Freighter wallet extension is not connected or installed.")
        }

        const networkPassphrase = network === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        const signedResult = await freighterApi.signTransaction(unsignedTxXdr, {
          networkPassphrase,
        })

        if (signedResult && typeof signedResult === "object" && signedResult.error) {
          const errMsg = typeof signedResult.error === "object"
            ? (signedResult.error.message || JSON.stringify(signedResult.error))
            : String(signedResult.error)
          throw new Error(errMsg)
        }

        const signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr
        if (!signedXdr) {
          throw new Error("Failed to retrieve signature from Freighter.")
        }

        const resSubmit = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr, network }),
        })
        if (!resSubmit.ok) {
          const errData = await resSubmit.json().catch(() => ({}))
          throw new Error(errData.error || `Submission failed with status ${resSubmit.status}`)
        }
        const { hash } = await resSubmit.json()

        setTxHash(hash)
        toast.success("Payment sent successfully via Freighter")
        logInteraction(publicKey || "Unknown", "Send XLM", hash, network)
        if (publicKey) {
          mutate(["balance", publicKey, network])
          mutate(["transactions", publicKey, network])
        }
      } catch (err: any) {
        let msg = "Payment failed. Please try again."
        if (err instanceof Error) {
          msg = err.message
        } else if (err && typeof err === "object") {
          msg = err.message || err.error || JSON.stringify(err)
        } else if (typeof err === "string") {
          msg = err
        }
        toast.error(msg)
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const { hash } = await sendPayment(secretKey, destination, amount, memo, network)
      setTxHash(hash)
      toast.success("Payment sent successfully")
      logInteraction(publicKey || "Unknown", "Send XLM", hash, network)
      if (publicKey) {
        mutate(["balance", publicKey, network])
        mutate(["transactions", publicKey, network])
      }
    } catch (err: any) {
      let msg = "Payment failed. Please try again."
      if (err instanceof Error) {
        msg = err.message
      } else if (err && typeof err === "object") {
        msg = err.message || err.error || JSON.stringify(err)
      } else if (typeof err === "string") {
        msg = err
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setDestination("")
    setAmount("")
    setMemo("")
    setTxHash(null)
  }

  if (txHash) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] p-6 sm:p-8 backdrop-blur-xl max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="size-8" />
          </span>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Transaction Finalized</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Sent {Number(amount).toLocaleString(undefined, { maximumFractionDigits: 7 })} XLM to{" "}
              <span className="text-foreground">{truncate(destination, 6, 6)}</span>
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
            <span className="min-w-0 truncate font-mono text-xs text-foreground">{txHash}</span>
            <CopyButton value={txHash} label="Hash copied" className="size-7 shrink-0" />
          </div>

          <div className="flex w-full flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1 gap-2 rounded-xl border-border/80 hover:bg-muted font-mono text-xs">
              <a href={stellarExpertUrl(txHash, network)} target="_blank" rel="noreferrer">
                Verify on StellarExpert
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
            <Button onClick={reset} className="flex-1 rounded-xl font-medium">
              Send Another Payment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Left 7 Columns: Payment Execution Form */}
      <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recipient Stellar Address
            </Label>
            <Input
              id="destination"
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={destination}
              onChange={(e) => setDestination(e.target.value.trim())}
              className="font-mono text-xs rounded-xl h-11"
              aria-invalid={!destinationValid}
            />
            {!destinationValid && (
              <p className="text-xs text-destructive font-mono">Invalid public key. Must start with G and contain 56 characters.</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transfer Amount
              </Label>
              <button
                type="button"
                onClick={() => setAmount(spendableBalance > 0 ? spendableBalance.toFixed(5) : "0")}
                className="text-[11px] font-mono text-primary hover:underline"
              >
                Max Spendable: {spendableBalance.toFixed(4)} XLM
              </button>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.0000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16 font-mono text-base rounded-xl h-11"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-primary">
                XLM
              </span>
            </div>
            {amountNum > spendableBalance && (
              <p className="text-xs text-destructive font-mono">
                Amount exceeds spendable balance ({spendableBalance.toFixed(4)} XLM). Stellar requires a 1.0 XLM base reserve to keep the account active.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transaction Memo <span className="text-muted-foreground/60 font-normal">(Optional Text / ID)</span>
            </Label>
            <Textarea
              id="memo"
              placeholder="Invoice ID, exchange memo, or reference note"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="resize-none rounded-xl text-xs font-mono"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-11 rounded-xl font-semibold gap-2 shadow-md focus-visible:ring-2 focus-visible:ring-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Broadcasting to Horizon…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Sign &amp; Broadcast Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right 5 Columns: Live Ledger Simulation & Pre-Flight Breakdown */}
      <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Pre-Flight Ledger Check</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Live Horizon Simulated</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Total Balance:</span>
              <span className="font-mono font-medium text-foreground">{currentBalNum.toFixed(4)} XLM</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Mandatory Base Reserve:</span>
              <span className="font-mono font-medium text-muted-foreground">1.0000 XLM</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Spendable Available:</span>
              <span className="font-mono font-medium text-emerald-400">{spendableBalance.toFixed(4)} XLM</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Transfer Outflow:</span>
              <span className="font-mono font-medium text-primary">- {(amountNum || 0).toFixed(4)} XLM</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Network Base Fee:</span>
              <span className="font-mono font-medium text-foreground">~{fee} XLM</span>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-between font-semibold">
              <span className="text-foreground">Estimated Balance After:</span>
              <span className="font-mono text-emerald-400">{remainingBalance.toFixed(4)} XLM</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Cryptographic Safeguard
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Payments on the Stellar network finalize in under 5 seconds and are cryptographically irreversible once signed.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Stellar Mainnet</span>
          <span className="text-emerald-500">Non-Custodial</span>
        </div>
      </div>
    </div>
  )
}
