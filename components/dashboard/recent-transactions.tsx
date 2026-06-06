"use client"

import Link from "next/link"
import useSWR from "swr"
import { ChevronRight, Inbox } from "lucide-react"
import { getTransactions } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { TransactionRow } from "@/components/transaction-row"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentTransactions() {
  const { publicKey, network } = useWallet()
  const { data: txs, isLoading } = useSWR(
    publicKey ? ["transactions", publicKey, network] : null,
    () => getTransactions(publicKey as string, network),
  )

  return (
    <Card className="border border-border/50 bg-gradient-to-br from-card via-card to-muted/20 p-5 sm:p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="mt-2 divide-y divide-border">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          : txs && txs.length > 0
            ? txs.slice(0, 5).map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            : (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <Inbox className="size-8" />
                <p className="text-sm">No transactions yet</p>
              </div>
            )}
      </div>
    </Card>
  )
}
