"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { AppShell } from "@/components/app-shell"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { LandingShell } from "@/components/landing/landing-shell"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { AuthModal } from "@/components/landing/auth-modal"

export default function Page() {
  const { isConnected, isInitialized } = useWallet()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const router = useRouter()

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="relative flex h-10 w-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-10 w-10 bg-primary" />
          </span>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing wallet...</p>
        </div>
      </div>
    )
  }

  // If connected, show dashboard
  if (isConnected) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your Stellar wallet</p>
          </div>
          <BalanceCard />
          <RecentTransactions />
        </div>
      </AppShell>
    )
  }

  // If not connected, show landing page
  return (
    <LandingShell onConnectClick={() => setAuthModalOpen(true)}>
      <Hero onConnectClick={() => setAuthModalOpen(true)} />
      <Features />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </LandingShell>
  )
}
