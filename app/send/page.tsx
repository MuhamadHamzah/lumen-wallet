"use client"

import { AppShell } from "@/components/app-shell"
import { SendForm } from "@/components/send/send-form"

export default function SendPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Send Assets</h1>
          <p className="text-xs text-muted-foreground font-mono">Stellar Horizon Peer-to-Peer Transfer Desk</p>
        </div>
        <SendForm />
      </div>
    </AppShell>
  )
}
