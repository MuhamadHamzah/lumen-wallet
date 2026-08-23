"use client"

import { AppShell } from "@/components/app-shell"
import { MultisigManager } from "@/components/multisig/multisig-manager"

export default function MultisigPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <MultisigManager />
      </div>
    </AppShell>
  )
}
