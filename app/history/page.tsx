"use client"

import { AppShell } from "@/components/app-shell"
import { HistoryList } from "@/components/history/history-list"

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Transaction history</h1>
          <p className="text-sm text-muted-foreground">All payments sent and received</p>
        </div>
        <HistoryList />
      </div>
    </AppShell>
  )
}
