"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/wallet-provider"
import { AppShell } from "@/components/app-shell"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { LandingPageContainer } from "@/components/landing/landing-page-container"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Cockpit</h1>
              <p className="text-xs text-muted-foreground font-mono">Portfolio Overview • Stellar Horizon Node</p>
            </div>
          </div>
          
          {/* Asymmetric 7 / 5 Cockpit Grid */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              <BalanceCard />
            </div>
            <div className="lg:col-span-5">
              <RecentTransactions />
            </div>
          </div>
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

  // Otherwise, render landing page with page-peel transitions
  return (
    <LandingPageContainer
      onConnectClick={() => setAuthModalOpen(true)}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
    />
  )
}
