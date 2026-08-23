"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Inbox, Filter as FilterIcon, Activity } from "lucide-react"
import { getTransactions, type TxType } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { TransactionRow } from "@/components/transaction-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Filter = "all" | TxType
const PAGE_SIZE = 8
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "sent", label: "Outbound (Sent)" },
  { value: "received", label: "Inbound (Received)" },
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
    <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Ledger Feed Filter</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 border border-border/60 rounded-2xl">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => changeFilter(f.value)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                filter === f.value
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/40">
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 py-3.5">
              <Skeleton className="size-9 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded-lg" />
                <Skeleton className="h-3 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          ))
        ) : pageItems.length > 0 ? (
          pageItems.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Inbox className="size-8 opacity-30" />
            <p className="text-xs font-mono">No {filter !== "all" ? filter : ""} transactions recorded on this account</p>
          </div>
        )}
      </div>

      {!isLoading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs font-mono text-muted-foreground">
          <p>
            Page {current + 1} of {totalPages} ({filtered.length} total events)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 rounded-xl h-8 text-xs font-mono"
              disabled={current === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 rounded-xl h-8 text-xs font-mono"
              disabled={current >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
