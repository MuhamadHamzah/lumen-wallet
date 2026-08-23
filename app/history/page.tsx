"use client"

import { AppShell } from "@/components/app-shell"
import { HistoryList } from "@/components/history/history-list"

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Explorer History</h1>
          <p className="text-xs text-muted-foreground font-mono">Horizon Ledger Event Ingestion &amp; Transaction Hashes</p>
        </div>
        <HistoryList />
      </div>
    </AppShell>
  )
}
