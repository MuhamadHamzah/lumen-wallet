"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR, { useSWRConfig } from "swr"
import { ArrowDownLeft, ArrowUpRight, Droplets, Loader2, Wallet, RefreshCw, Coins, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { getBalance, fundAccount, truncate } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function BalanceCard() {
  const { publicKey, network } = useWallet()
  const { mutate } = useSWRConfig()
  const [funding, setFunding] = useState(false)

  const isTestnet = network === "testnet"

  const { data: balance, isLoading, error } = useSWR(
    publicKey ? ["balance", publicKey, network] : null,
    () => getBalance(publicKey as string, network),
  )

  const numericBalance = Number((balance ?? "0").replace(/,/g, ""))
  const unfunded = !isLoading && !error && numericBalance === 0

  async function handleFund() {
    if (!publicKey) return
    setFunding(true)
    try {
      await fundAccount(publicKey, network)
      toast.success("Account funded with testnet XLM")
      mutate(["balance", publicKey, network])
      mutate(["transactions", publicKey, network])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Funding failed. Please try again.")
    } finally {
      setFunding(false)
    }
  }

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
      {/* Account Address Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-foreground tracking-tight">
            {publicKey ? truncate(publicKey, 8, 8) : ""}
          </span>
          {publicKey && <CopyButton value={publicKey} label="Address copied" className="size-6" />}
        </div>
        <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {network}
        </span>
      </div>

      {/* Main Net Worth & XLM Balance */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Available Liquid Balance
        </span>
        {isLoading ? (
          <Skeleton className="h-12 w-56 rounded-xl" />
        ) : error ? (
          <p className="text-base font-medium text-destructive">Couldn&apos;t load balance</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground tabular-nums">
              {balance}
            </span>
            <span className="text-lg font-bold text-primary font-mono">XLM</span>
          </div>
        )}

        {!isLoading && !error && (
          <p className="text-xs text-muted-foreground font-mono">
            ≈ ${(numericBalance * 0.11).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD Valuation
          </p>
        )}
      </div>

      {/* Testnet Friendbot Banner (when unfunded) */}
      {unfunded && isTestnet && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <Droplets className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold text-amber-500">Unfunded Testnet Account</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Request 10,000 testnet XLM from the official Stellar Friendbot faucet to initialize this address.
            </p>
            <Button size="sm" variant="outline" className="h-8 gap-2 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/20" onClick={handleFund} disabled={funding}>
              {funding ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Funding via Friendbot…
                </>
              ) : (
                <>
                  <Droplets className="size-3" />
                  Fund Account Instantly
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Direct Action Levers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <Button asChild size="sm" className="h-10 rounded-xl font-medium gap-2 shadow-sm focus-visible:ring-2 focus-visible:ring-primary">
          <Link href="/send">
            <ArrowUpRight className="size-4" />
            Send
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-xl font-medium gap-2 border-border/80 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
          <Link href="/receive">
            <ArrowDownLeft className="size-4" />
            Receive
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-xl font-medium gap-2 border-border/80 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
          <Link href="/swap">
            <RefreshCw className="size-3.5" />
            Swap
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-xl font-medium gap-2 border-border/80 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
          <Link href="/tokens">
            <Coins className="size-3.5" />
            Tokens
          </Link>
        </Button>
      </div>

      {/* Asset Trustline Allocation Mini-Bar */}
      <div className="pt-5 border-t border-border/40 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-primary" />
            Asset Holdings & Trustlines
          </span>
          <Link href="/tokens" className="text-primary hover:underline font-mono text-[11px]">
            Manage Assets →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono block">Native</span>
            <span className="font-mono font-bold text-foreground mt-0.5 block">{balance || "0"} XLM</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono block">USDC (Centre)</span>
            <span className="font-mono font-bold text-foreground mt-0.5 block">0.00 USDC</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground font-mono block">Soroban WASM</span>
            <span className="font-mono font-bold text-emerald-400 mt-0.5 block">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
