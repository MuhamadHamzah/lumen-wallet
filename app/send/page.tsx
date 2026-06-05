"use client"

import { AppShell } from "@/components/app-shell"
import { SendForm } from "@/components/send/send-form"

export default function SendPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Send payment</h1>
          <p className="text-sm text-muted-foreground">Transfer XLM to any Stellar address</p>
        </div>
        <SendForm />
      </div>
    </AppShell>
  )
}
