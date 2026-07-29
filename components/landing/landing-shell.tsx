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
      <Web3Background />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NetworkSwitcher />
            <ThemeToggle />
            {onConnectClick && (
              <Button
                onClick={onConnectClick}
                className="rounded-xl px-3 sm:px-6 py-2 font-medium bg-teal-500 hover:bg-teal-400 text-white border-0 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300"
                size="sm"
              >
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="inline sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Logo />
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Lumen Wallet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              <span className="text-xs text-muted-foreground">Network Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
