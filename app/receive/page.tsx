"use client"

import { AppShell } from "@/components/app-shell"
import { ReceiveCard } from "@/components/receive/receive-card"

export default function ReceivePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Receive Assets</h1>
          <p className="text-xs text-muted-foreground font-mono">Inbound Stellar Payment Terminal &amp; Address Desk</p>
        </div>
        <ReceiveCard />
      </div>
    </AppShell>
  )
}
