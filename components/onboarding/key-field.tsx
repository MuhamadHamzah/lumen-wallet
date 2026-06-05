"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

interface KeyFieldProps {
  label: string
  value: string
  secret?: boolean
}

export function KeyField({ label, value, secret = false }: KeyFieldProps) {
  const [revealed, setRevealed] = useState(!secret)
  const display = revealed ? value : "•".repeat(56)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {revealed ? "Hide" : "Reveal"}
          </button>
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border p-3",
          secret ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/40",
        )}
      >
        <span className="min-w-0 flex-1 break-all font-mono text-sm">{display}</span>
        <CopyButton value={value} label={`${label} copied`} className="size-7 shrink-0" />
      </div>
    </div>
  )
}
