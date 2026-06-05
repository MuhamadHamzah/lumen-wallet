"use client"

import { AppShell } from "@/components/app-shell"
import { MultisigManager } from "@/components/multisig/multisig-manager"

export default function MultisigPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Multisig Safe &amp; Escrow</h1>
          <p className="text-sm text-muted-foreground">Collaborate on multi-signature accounts and transaction signing</p>
        </div>
        <MultisigManager />
      </div>
    </AppShell>
  )
}
