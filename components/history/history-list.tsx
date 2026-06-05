"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"
import { getTransactions, type TxType } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { TransactionRow } from "@/components/transaction-row"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Filter = "all" | TxType
const PAGE_SIZE = 5
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "received", label: "Received" },
]

export function HistoryList() {
  const { publicKey, network } = useWallet()
  const [filter, setFilter] = useState<Filter>("all")
  const [page, setPage] = useState(0)

  const { data: txs, isLoading } = useSWR(
    publicKey ? ["transactions", publicKey, network] : null,
    () => getTransactions(publicKey as string, network),
  )

  const filtered = useMemo(() => {
    if (!txs) return []
    return filter === "all" ? txs : txs.filter((t) => t.type === filter)
  }, [txs, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  function changeFilter(f: Filter) {
    setFilter(f)
    setPage(0)
  }

  return (
    <Card className="border-border p-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => changeFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-2 divide-y divide-border">
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : pageItems.length > 0 ? (
          pageItems.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Inbox className="size-8" />
            <p className="text-sm">No {filter !== "all" ? filter : ""} transactions found</p>
          </div>
        )}
      </div>

      {!isLoading && filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {current + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-transparent"
              disabled={current === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-transparent"
              disabled={current >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
