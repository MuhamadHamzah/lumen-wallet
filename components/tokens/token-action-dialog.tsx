"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { type TokenInfo, mintToken, transferToken, stellarExpertTxUrl } from "@/lib/soroban"
import { isValidPublic, truncate } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TokenActionDialogProps {
  mode: "transfer" | "mint"
  token: TokenInfo
  network: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokenActionDialog({ mode, token, network, open, onOpenChange }: TokenActionDialogProps) {
  const { secretKey, publicKey } = useWallet()
  const { mutate } = useSWRConfig()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const isMint = mode === "mint"
  const recipientValid = recipient === "" || isValidPublic(recipient)
  const amountNum = Number(amount)
  const canSubmit = isValidPublic(recipient) && amount !== "" && amountNum > 0 && !loading

  function close() {
    onOpenChange(false)
    // Reset after the close animation.
    setTimeout(() => {
      setRecipient("")
      setAmount("")
      setTxHash(null)
    }, 200)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !secretKey) return
    setLoading(true)
    try {
      const action = isMint ? mintToken : transferToken
      const { hash } = await action(secretKey, token.contractId, recipient, amount, network)
      setTxHash(hash)
      toast.success(isMint ? "Tokens minted successfully" : "Tokens sent successfully")
      if (publicKey) mutate(["token", token.contractId, publicKey, network])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md">
        {txHash ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center w-full min-w-0">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-8" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{isMint ? "Tokens minted" : "Transfer complete"}</h2>
              <p className="text-sm text-muted-foreground">
                {amountNum.toLocaleString()} {token.symbol} {isMint ? "minted to" : "sent to"}{" "}
                <span className="font-mono">{truncate(recipient)}</span>
              </p>
            </div>
            <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3 overflow-hidden">
              <span className="block flex-1 min-w-0 truncate font-mono text-xs text-muted-foreground text-left">{txHash}</span>
              <CopyButton value={txHash} label="Hash copied" className="size-7 shrink-0" />
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 gap-2 bg-transparent">
                <a href={stellarExpertTxUrl(txHash, network)} target="_blank" rel="noreferrer">
                  View on Stellar Expert
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button className="flex-1" onClick={close}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isMint ? "Mint" : "Send"} {token.symbol}
              </DialogTitle>
              <DialogDescription>
                {isMint
                  ? "Create new tokens and credit them to an address. Only the token admin can mint."
                  : `Transfer ${token.name} to another Stellar address.`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="token-recipient">{isMint ? "Mint to address" : "Recipient address"}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="token-recipient"
                    placeholder="G..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value.trim())}
                    className="font-mono"
                    aria-invalid={!recipientValid}
                  />
                  {publicKey && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 bg-transparent"
                      onClick={() => setRecipient(publicKey)}
                    >
                      Me
                    </Button>
                  )}
                </div>
                {!recipientValid && (
                  <p className="text-xs text-destructive">Enter a valid Stellar public key (starts with G).</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="token-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="token-amount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-20 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 max-w-16 truncate text-sm font-medium text-muted-foreground">
                    {token.symbol}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!canSubmit} className="w-full gap-2">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isMint ? "Minting…" : "Sending…"}
                  </>
                ) : (
                  <>{isMint ? "Mint tokens" : `Send ${token.symbol}`}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
