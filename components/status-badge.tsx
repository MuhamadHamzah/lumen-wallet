import type { TxStatus } from "@/lib/stellar"
import { cn } from "@/lib/utils"

const STYLES: Record<TxStatus, string> = {
  success: "bg-success/15 text-success",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  failed: "bg-destructive/15 text-destructive",
}

const LABELS: Record<TxStatus, string> = {
  success: "Success",
  pending: "Pending",
  failed: "Failed",
}

export function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  )
}
