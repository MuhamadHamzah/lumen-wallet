"use client"

import Link from "next/link"
import useSWR from "swr"
import { ChevronRight, Inbox, Activity } from "lucide-react"
import { getTransactions } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { TransactionRow } from "@/components/transaction-row"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentTransactions() {
  const { publicKey, network } = useWallet()
  const { data: txs, isLoading } = useSWR(
    publicKey ? ["transactions", publicKey, network] : null,
    () => getTransactions(publicKey as string, network),
  )

  return (
    <div className="h-full rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl flex flex-col justify-between space-y-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-emerald-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Ledger Feed</h2>
          </div>
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
          >
            All Transactions
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border/40">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-8 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 rounded-lg" />
                  <Skeleton className="h-2.5 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-3.5 w-16 rounded-lg" />
              </div>
            ))
          ) : txs && txs.length > 0 ? (
            txs.slice(0, 5).map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Inbox className="size-8 opacity-30" />
              <p className="text-xs font-mono">No transactions recorded on this account</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5 text-emerald-500">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
          Streaming Horizon SSE
        </span>
      </div>
    </div>
  )
}
