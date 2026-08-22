"use client"

import type { ReactNode } from "react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"

interface LandingShellProps {
  children: ReactNode
  onConnectClick?: () => void
  mode?: "wallet" | "flow"
  onModeSwitch?: (mode: "wallet" | "flow") => void
  hideHeader?: boolean
}

export function LandingShell({
  children,
  onConnectClick,
  mode = "wallet",
  onModeSwitch,
  hideHeader = false,
}: LandingShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden">
      {/* Floating Modern Web3 Navbar */}
      {!hideHeader && (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl rounded-2xl border border-white/25 dark:border-white/15 bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl backdrop-saturate-200 backdrop-contrast-125 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_0_rgba(255,255,255,0.3)]">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            {/* Header Mode Switcher (Tab indicator) */}
            {onModeSwitch && (
              <div className="hidden sm:flex items-center gap-1 bg-white/[0.05] dark:bg-white/[0.03] border border-white/15 rounded-xl p-0.5 text-[11px] backdrop-blur-md">
                <button
                  onClick={() => onModeSwitch("wallet")}
                  className={`px-3 py-1.5 rounded-lg font-semibold ${
                    mode === "wallet"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Wallet
                </button>
                <button
                  onClick={() => onModeSwitch("flow")}
                  className={`px-3 py-1.5 rounded-lg font-semibold ${
                    mode === "flow"
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                      : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Flow Escrow
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NetworkSwitcher />
            <ThemeToggle />
            {onConnectClick && (
              <Button
                onClick={onConnectClick}
                className={`rounded-xl px-4 sm:px-5 py-2 font-semibold border-0 shadow-lg transition-transform duration-200 hover:scale-[1.02] text-xs sm:text-sm h-9 text-white ${
                  mode === "wallet"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/20 hover:shadow-blue-500/35"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20 hover:shadow-amber-500/35"
                }`}
                size="sm"
              >
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="inline sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Main content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4">
                <Logo />
                <span className="text-xs text-muted-foreground">
                  Built on Stellar Network
                </span>
              </div>
              
              {/* Footer Switch Overrides (Accessibility) */}
              {onModeSwitch && (
                <div className="flex items-center gap-3 text-xs border-l border-white/10 pl-0 sm:pl-6">
                  <button
                    onClick={() => onModeSwitch("wallet")}
                    className={`hover:text-blue-400 transition-colors font-medium ${
                      mode === "wallet" ? "text-blue-400 font-bold" : "text-muted-foreground"
                    }`}
                  >
                    Wallet View
                  </button>
                  <span className="text-white/10">|</span>
                  <button
                    onClick={() => onModeSwitch("flow")}
                    className={`hover:text-amber-400 transition-colors font-medium ${
                      mode === "flow" ? "text-amber-400 font-bold" : "text-muted-foreground"
                    }`}
                  >
                    Flow (Escrow) View
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    mode === "wallet" ? "bg-blue-400" : "bg-amber-400"
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    mode === "wallet" ? "bg-blue-500" : "bg-amber-500"
                  }`} />
                </span>
                <span className="text-[11px] text-muted-foreground">Stellar Network Active</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                © {new Date().getFullYear()} Lumen Wallet
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
