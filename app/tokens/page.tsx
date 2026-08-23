"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Coins, Plus, Search, ExternalLink, ArrowUpRight, Loader2, ShieldCheck, Sparkles, Trash2, Cpu, RefreshCw, Layers } from "lucide-react"
import { toast } from "sonner"
import { type TokenInfo, getTokenInfo, isValidContractId, formatTokenAmount, stellarExpertContractUrl } from "@/lib/soroban"
import { getBalance } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { AppShell } from "@/components/app-shell"
import { TokenActionDialog } from "@/components/tokens/token-action-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export default function TokensPage() {
  const { publicKey, network } = useWallet()
  const [contractId, setContractId] = useState("")
  const [trackedContracts, setTrackedContracts] = useState<string[]>([])

  // Load native XLM balance
  const { data: xlmBalance, isLoading: xlmLoading } = useSWR(
    publicKey ? ["balance", publicKey, network] : null,
    () => getBalance(publicKey as string, network),
  )

  // Load tracked contracts from localStorage on mount or network change
  useEffect(() => {
    const key = `lumen_wallet_tracked_tokens_${network}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setTrackedContracts(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored tokens", e)
      }
    } else {
      // Default tokens
      const isMainnet = (network as string) === "mainnet" || (network as string) === "public"
      const defaultToken = isMainnet
        ? "CAWDNAUATO6EPYCAD57EBY45YGLDMRE4ZHKTWN6GBMCPATMHWUMG7CLT"
        : "CCBQXWFFVSY67I7DKGM3RSC7VHZOYJRSU24NRH6BSBGNGM52IEGX4PXD"
      setTrackedContracts([defaultToken])
    }
  }, [network])

  // Save to localStorage when trackedContracts changes
  const saveTrackedContracts = (newContracts: string[]) => {
    setTrackedContracts(newContracts)
    const key = `lumen_wallet_tracked_tokens_${network}`
    localStorage.setItem(key, JSON.stringify(newContracts))
  }

  function handleAddToken() {
    const id = contractId.trim()
    if (!isValidContractId(id)) {
      toast.error("Invalid contract ID. It should start with 'C' and be 56 characters.")
      return
    }
    if (trackedContracts.includes(id)) {
      toast.error("This token contract is already being tracked.")
      return
    }
    saveTrackedContracts([...trackedContracts, id])
    setContractId("")
    toast.success("Token contract added successfully!")
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Soroban Custom Tokens</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">WASM Smart Contract Tokens &amp; SEP-41 Interfaces</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-muted/50 border border-border/60 text-muted-foreground">
              Network: <span className="text-foreground font-bold uppercase">{network}</span>
            </span>
          </div>
        </div>

        {/* Asymmetric 8 / 4 Token Studio Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          {/* Left 8 Columns: Token Holdings Portfolio */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Native Asset Lead Card */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xl shadow-sm transition-all hover:border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-11 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                    <Coins className="size-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Stellar Lumens</h3>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Native
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">XLM • Protocol Reserve Fuel</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider block">Balance</span>
                  <p className="font-mono font-bold text-base text-foreground tabular-nums">
                    {xlmLoading ? (
                      <Skeleton className="h-5 w-20 ml-auto rounded" />
                    ) : (
                      <>
                        {xlmBalance ?? "0"} <span className="text-xs text-blue-400 font-semibold">XLM</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Tracked Soroban Tokens Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  Tracked Soroban Contracts ({trackedContracts.length})
                </span>
                <span className="font-mono text-[10px] lowercase text-muted-foreground">sep-41 standard</span>
              </div>

              {trackedContracts.length > 0 ? (
                <div className="space-y-3">
                  {trackedContracts.map((cid) => (
                    <TokenCard
                      key={cid}
                      contractId={cid}
                      publicKey={publicKey}
                      network={network}
                      onRemove={() => {
                        saveTrackedContracts(trackedContracts.filter((c) => c !== cid))
                        toast.success("Token contract removed")
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 bg-muted/10 p-10 text-center space-y-3">
                  <Search className="size-8 mx-auto text-muted-foreground/40" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">No custom Soroban tokens tracked</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Register a Soroban token contract address to monitor balances and transfer tokens.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Columns: Contract Management & Spec Workbench */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Add Contract Card */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Track Soroban Token</h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">WASM Contract</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="contract-id" className="text-xs text-muted-foreground font-medium">
                    Contract Address (56 chars, starts with C)
                  </Label>
                  <Input
                    id="contract-id"
                    placeholder="e.g. CCBQXWFFVSY67I7..."
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value.trim())}
                    className="font-mono text-xs rounded-xl h-10"
                  />
                </div>

                <Button
                  onClick={handleAddToken}
                  disabled={!contractId.trim()}
                  className="w-full h-10 rounded-xl font-semibold text-xs gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Plus className="size-3.5" />
                  Register Token Contract
                </Button>
              </div>
            </div>

            {/* Soroban SEP-41 Architectural Specs */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xl space-y-3 shadow-sm text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Soroban Token Architecture
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Soroban smart tokens adhere to the SEP-41 standard with full authorization support, admin minting triggers, and sub-cent execution fees.
              </p>
              <div className="pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex justify-between">
                <span>Gas Fee</span>
                <span className="text-emerald-400 font-semibold">&lt; $0.001</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}

/** Formatter helper to split long Stellar Asset Contract (SAC) names gracefully */
function parseTokenDisplayName(rawName: string, rawSymbol: string) {
  if (!rawName) return { title: rawSymbol || "Token", subtitle: null }
  if (rawName.includes(":")) {
    const [code, issuer] = rawName.split(":")
    const shortIssuer = issuer ? `${issuer.slice(0, 6)}...${issuer.slice(-4)}` : ""
    return {
      title: code || rawSymbol || rawName,
      subtitle: shortIssuer ? `Issuer: ${shortIssuer}` : "SAC Asset",
    }
  }
  return { title: rawName, subtitle: null }
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
  const [isRetrying, setIsRetrying] = useState(false)

  const { data: token, isLoading, error, mutate } = useSWR(
    ["token", contractId, publicKey || "", network],
    () => getTokenInfo(contractId, publicKey || "", network),
    {
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1500,
    }
  )

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await mutate()
      toast.success("Retried contract query")
    } catch {
      toast.error("Retry failed. Check network or contract ID.")
    } finally {
      setIsRetrying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Skeleton className="size-11 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 rounded-xl shrink-0" />
        </div>
      </div>
    )
  }

  if (error || !token) {
    const netName = network === "mainnet" || network === "public" ? "Mainnet" : "Testnet"
    const errorMessage = error instanceof Error ? error.message : "Contract not found on this network"

    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-destructive">Failed to query contract on {netName}</span>
            <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/40 border border-border/60">
              SEP-41
            </span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground truncate max-w-md" title={contractId}>
            {contractId}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {errorMessage}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-8 text-xs rounded-xl gap-1.5"
          >
            {isRetrying ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Retry
          </Button>

          <a
            href={stellarExpertContractUrl(contractId, network)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono px-2 py-1"
          >
            Explorer
            <ExternalLink className="size-3" />
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:bg-destructive/10 text-xs rounded-xl h-8 px-2.5"
          >
            Remove
          </Button>
        </div>
      </div>
    )
  }

  const { title, subtitle } = parseTokenDisplayName(token.name, token.symbol)

  return (
    <>
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-sm hover:border-primary/40 transition-colors">
        
        {/* Token Header Row */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Token Icon & Identification */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Coins className="size-5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm sm:text-base truncate max-w-[160px] sm:max-w-xs" title={token.name}>
                  {title}
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  {token.symbol}
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground truncate max-w-[220px] sm:max-w-md">
                {subtitle ? `${subtitle} • ` : ""}{token.decimals} Decimals • Soroban WASM
              </p>
            </div>
          </div>

          {/* Right: Balance Display */}
          <div className="text-right shrink-0">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider block">Balance</span>
            <p className="font-mono font-bold text-base text-foreground tabular-nums">
              {formatTokenAmount(token.balance, token.decimals)} <span className="text-xs text-primary font-semibold">{token.symbol}</span>
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl text-xs gap-1.5"
              onClick={() => setActionMode("transfer")}
              disabled={!publicKey}
            >
              <ArrowUpRight className="size-3.5" />
              Transfer
            </Button>
            
            {token.isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-xl text-xs gap-1.5"
                onClick={() => setActionMode("mint")}
                disabled={!publicKey}
              >
                <Sparkles className="size-3.5" />
                Mint
              </Button>
            )}

            <a
              href={stellarExpertContractUrl(contractId, network)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono px-2 py-1 transition-colors"
            >
              Explorer
              <ExternalLink className="size-3" />
            </a>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive h-8 px-2 rounded-xl text-xs"
            title="Stop tracking this token"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Action Dialog */}
      {actionMode && (
        <TokenActionDialog
          open={!!actionMode}
          onOpenChange={(open) => !open && setActionMode(null)}
          token={token}
          network={network}
          mode={actionMode}
        />
      )}
    </>
  )
}
