"use client"

import { useState } from "react"
import useSWR from "swr"
import { Coins, Plus, Search, ExternalLink, ArrowUpRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { type TokenInfo, getTokenInfo, isValidContractId, formatTokenAmount, stellarExpertContractUrl } from "@/lib/soroban"
import { useWallet } from "@/components/wallet-provider"
import { AppShell } from "@/components/app-shell"
import { TokenActionDialog } from "@/components/tokens/token-action-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function TokensPage() {
  const { publicKey, network } = useWallet()
  const [contractId, setContractId] = useState("")
  const [trackedContracts, setTrackedContracts] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)

  function handleAddToken() {
    const id = contractId.trim()
    if (!isValidContractId(id)) {
      toast.error("Invalid contract ID. It should start with C and be 56 characters.")
      return
    }
    if (trackedContracts.includes(id)) {
      toast.error("This token is already being tracked.")
      return
    }
    setTrackedContracts((prev) => [...prev, id])
    setContractId("")
    setIsAdding(false)
    toast.success("Token added!")
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Tokens</h1>
            <p className="text-sm text-muted-foreground">Manage your Soroban custom tokens</p>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Token
          </Button>
        </div>

        {/* Add token form */}
        {isAdding && (
          <Card className="border border-border/50 bg-card/80 backdrop-blur p-5">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1">Add Custom Token</p>
                <p className="text-xs text-muted-foreground">Enter a Soroban token contract ID to track it</p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value.trim())}
                  className="font-mono text-sm flex-1"
                />
                <Button onClick={handleAddToken} disabled={!contractId.trim()}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => { setIsAdding(false); setContractId("") }}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Native XLM card */}
        <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
              <Coins className="size-6 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Stellar Lumens</p>
              <p className="text-sm text-muted-foreground">XLM — Native asset</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Native token</p>
            </div>
          </div>
        </Card>

        {/* Tracked custom tokens */}
        {trackedContracts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Custom Tokens</p>
            {trackedContracts.map((cid) => (
              <TokenCard
                key={cid}
                contractId={cid}
                publicKey={publicKey}
                network={network}
                onRemove={() => {
                  setTrackedContracts((prev) => prev.filter((c) => c !== cid))
                  toast.success("Token removed")
                }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {trackedContracts.length === 0 && !isAdding && (
          <Card className="border border-dashed border-border/60 bg-muted/10 p-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted/50">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No custom tokens tracked</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a Soroban token contract ID to start tracking custom tokens.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 mt-2" onClick={() => setIsAdding(true)}>
                <Plus className="size-4" />
                Add your first token
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

function TokenCard({
  contractId,
  publicKey,
  network,
  onRemove,
}: {
  contractId: string
  publicKey: string | null
  network: string
  onRemove: () => void
}) {
  const [actionMode, setActionMode] = useState<"transfer" | "mint" | null>(null)

  const { data: token, isLoading, error } = useSWR(
    publicKey ? ["token", contractId, publicKey, network] : null,
    () => getTokenInfo(contractId, publicKey as string, network),
    { revalidateOnFocus: false }
  )

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-card/80 p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </Card>
    )
  }

  if (error || !token) {
    return (
      <Card className="border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-destructive">Failed to load token</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{contractId}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive shrink-0">
            Remove
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm hover:border-border/80 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
            <Coins className="size-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{token.name}</p>
            <p className="text-sm text-muted-foreground">{token.symbol}</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold tabular-nums">
              {formatTokenAmount(token.balance, token.decimals)}
            </p>
            <p className="text-xs text-muted-foreground">{token.symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 flex-1 bg-transparent"
            onClick={() => setActionMode("transfer")}
          >
            <ArrowUpRight className="size-3.5" />
            Send
          </Button>
          {token.isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 flex-1 bg-transparent"
              onClick={() => setActionMode("mint")}
            >
              <Plus className="size-3.5" />
              Mint
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 shrink-0"
            asChild
          >
            <a href={stellarExpertContractUrl(contractId, network)} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive shrink-0"
            onClick={onRemove}
          >
            Remove
          </Button>
        </div>
      </Card>

      {actionMode && (
        <TokenActionDialog
          mode={actionMode}
          token={token}
          network={network}
          open={!!actionMode}
          onOpenChange={(open) => { if (!open) setActionMode(null) }}
        />
      )}
    </>
  )
}
