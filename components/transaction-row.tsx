import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { type StellarTransaction, truncate } from "@/lib/stellar"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

function formatAmount(amount: string) {
  // Trim trailing zeros for display while keeping it readable.
  const n = Number(amount)
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TransactionRow({ tx }: { tx: StellarTransaction }) {
  const received = tx.type === "received"
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          received ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {received ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {received ? "Received from" : "Sent to"}{" "}
          <span className="font-mono text-muted-foreground">{truncate(tx.counterparty)}</span>
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            received ? "text-success" : "text-foreground",
          )}
        >
          {received ? "+" : "-"}
          {formatAmount(tx.amount)} XLM
        </span>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  )
}
