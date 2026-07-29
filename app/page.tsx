"use client"

import { useState, useEffect } from "react"
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
  const [hasWallet, setHasWallet] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = localStorage.getItem("lumen_publicKey")
      setHasWallet(Boolean(key))
    }
  }, [])

  // If we are initialized and connected, render the dashboard
  if (isInitialized && isConnected) {
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

  // If we detect a wallet in localStorage but are not initialized yet, 
  // show a clean background loader instead of flashing the landing page
  if (hasWallet === true && !isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070b19]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Opening wallet...</p>
        </div>
      </div>
    )
  }

  // Otherwise, render landing page
  return (
    <LandingShell onConnectClick={() => setAuthModalOpen(true)}>
      <Hero onConnectClick={() => setAuthModalOpen(true)} />
      <Features />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </LandingShell>
  )
}
