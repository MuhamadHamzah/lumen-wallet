"use client"

import type { ReactNode } from "react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"
import { Web3Background } from "./web3-background"

interface LandingShellProps {
  children: ReactNode
  onConnectClick?: () => void
}

export function LandingShell({ children, onConnectClick }: LandingShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Web3 Background */}
      <div className="fixed inset-0 z-0">
        <Web3Background />
      </div>

      {/* Sticky navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NetworkSwitcher />
            <ThemeToggle />
            {onConnectClick && (
              <Button
                onClick={onConnectClick}
                className="rounded-xl px-4 sm:px-6 py-2 font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
                size="sm"
              >
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="inline sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* Main content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Logo />
              <span className="text-sm text-muted-foreground">
                Built on Stellar Network
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-xs text-muted-foreground">Network Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Lumen Wallet
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
