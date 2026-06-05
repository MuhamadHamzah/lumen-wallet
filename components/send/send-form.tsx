"use client"

import { useState } from "react"
import Link from "next/link"
import { useSWRConfig } from "swr"
import { CheckCircle2, ExternalLink, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { getFeeEstimate, isValidPublic, sendPayment, stellarExpertUrl, truncate } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export function SendForm() {
  const { secretKey, publicKey, network, walletType } = useWallet()
  const { mutate } = useSWRConfig()
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const fee = getFeeEstimate()
  const destinationValid = destination === "" || isValidPublic(destination)
  const amountNum = Number(amount)
  const canSubmit =
    isValidPublic(destination) && amount !== "" && amountNum > 0 && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !secretKey) return

    // Freighter signing flow
    if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
      setLoading(true)
      try {
        // Step 1: Prepare transaction to get unsigned XDR from server
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

        // Step 2: Request user to sign via Freighter extension
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

        // Step 3: Submit signed transaction XDR back to the server
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
      // Refresh on-chain balance and history for this wallet.
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
      <Card className="border-border p-6">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-8" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Payment sent</h2>
            <p className="text-sm text-muted-foreground">
              You sent {Number(amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} XLM to{" "}
              <span className="font-mono">{truncate(destination)}</span>
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{txHash}</span>
            <CopyButton value={txHash} label="Hash copied" className="size-7 shrink-0" />
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="flex-1 gap-2 bg-transparent">
              <a href={stellarExpertUrl(txHash, network)} target="_blank" rel="noreferrer">
                View on Stellar Expert
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button onClick={reset} className="flex-1">
              Send another
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="destination">Recipient address</Label>
          <Input
            id="destination"
            placeholder="G..."
            value={destination}
            onChange={(e) => setDestination(e.target.value.trim())}
            className="font-mono"
            aria-invalid={!destinationValid}
          />
          {!destinationValid && (
            <p className="text-xs text-destructive">Enter a valid Stellar public key (starts with G).</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
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
              className="pr-16 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              XLM
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="memo">
            Memo <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="memo"
            placeholder="What's this for?"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Network fee</span>
          <span className="font-mono">~{fee} XLM</span>
        </div>

        <Button type="submit" disabled={!canSubmit} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Confirm &amp; send
            </>
          )}
        </Button>

        <Button asChild variant="ghost" type="button" className="text-muted-foreground">
          <Link href="/">Cancel</Link>
        </Button>
      </form>
    </Card>
  )
}
