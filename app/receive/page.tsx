"use client"

import { AppShell } from "@/components/app-shell"
import { ReceiveCard } from "@/components/receive/receive-card"

export default function ReceivePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Receive</h1>
          <p className="text-sm text-muted-foreground">Share your address to get paid in XLM</p>
        </div>
        <ReceiveCard />
      </div>
    </AppShell>
  )
}
