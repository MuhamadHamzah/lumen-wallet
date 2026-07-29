"use client"

import { AppShell } from "@/components/app-shell"
import { EscrowDashboard } from "@/components/escrow/escrow-dashboard"

export default function EscrowPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <EscrowDashboard />
      </div>
    </AppShell>
  )
}
