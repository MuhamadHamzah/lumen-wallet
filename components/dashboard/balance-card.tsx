"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR, { useSWRConfig } from "swr"
import { ArrowDownLeft, ArrowUpRight, Droplets, Loader2, Wallet } from "lucide-react"
import { toast } from "sonner"
import { getBalance, fundAccount, truncate } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
    <Card className="overflow-hidden border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5">
          <Wallet className="size-4 text-muted-foreground" />
          <span className="font-mono text-sm font-medium">{publicKey ? truncate(publicKey, 6, 6) : "—"}</span>
          {publicKey && <CopyButton value={publicKey} label="Address copied" className="size-5" />}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Balance</p>
        {isLoading ? (
          <Skeleton className="h-12 w-56" />
        ) : error ? (
          <p className="text-base font-medium text-destructive">Couldn&apos;t load balance</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-5xl font-bold tracking-tighter tabular-nums text-foreground">{balance}</span>
            <span className="text-lg font-semibold text-muted-foreground">XLM</span>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="mt-2 h-4 w-24" />
        ) : error ? (
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        ) : (
          <p className="text-sm text-muted-foreground font-medium">
            ≈ ${(numericBalance * 0.11).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </p>
        )}
      </div>

      {unfunded && isTestnet && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <Droplets className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Account not funded</p>
            <p className="text-xs text-muted-foreground mt-1">
              Get free testnet XLM from Friendbot to start sending payments.
            </p>
            <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={handleFund} disabled={funding}>
              {funding ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Funding…
                </>
              ) : (
                <>
                  <Droplets className="size-3" />
                  Fund with testnet XLM
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button asChild size="lg" className="flex-1 gap-2 font-medium">
          <Link href="/send">
            <ArrowUpRight className="size-4" />
            Send
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1 gap-2 font-medium">
          <Link href="/receive">
            <ArrowDownLeft className="size-4" />
            Receive
          </Link>
        </Button>
      </div>
    </Card>
  )
}
