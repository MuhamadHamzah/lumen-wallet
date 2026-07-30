"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, History, Coins, LogOut, ShieldCheck, RefreshCw, DollarSign, BarChart2, MoreHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@/components/wallet-provider"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"
import { truncate } from "@/lib/stellar"
import { CopyButton } from "@/components/copy-button"

import { Sparkles } from "lucide-react"
import { OnboardingWizard } from "@/components/onboarding-wizard"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: ArrowUpRight },
  { href: "/receive", label: "Receive", icon: ArrowDownLeft },
  { href: "/swap", label: "Swap", icon: RefreshCw },
  { href: "/tokens", label: "Tokens", icon: Coins },
  { href: "/escrow", label: "Escrow", icon: DollarSign },
  { href: "/feedback", label: "Analytics", icon: BarChart2 },
  { href: "/history", label: "History", icon: History },
  { href: "/multisig", label: "Multisig", icon: ShieldCheck },
]

/* Primary tabs shown directly in the bottom bar */
const MOBILE_PRIMARY = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: ArrowUpRight },
  { href: "/swap", label: "Swap", icon: RefreshCw },
  { href: "/history", label: "History", icon: History },
]

/* Secondary items shown inside the "More" panel */
const MOBILE_MORE = [
  { href: "/receive", label: "Receive", icon: ArrowDownLeft },
  { href: "/tokens", label: "Tokens", icon: Coins },
  { href: "/escrow", label: "Escrow", icon: DollarSign },
  { href: "/feedback", label: "Analytics", icon: BarChart2 },
  { href: "/multisig", label: "Multisig", icon: ShieldCheck },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { isConnected, isInitialized, disconnect, publicKey } = useWallet()
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  /* Close "More" panel on route change */
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.replace("/")
    }
  }, [isInitialized, isConnected, router])

  const closeMore = useCallback(() => setMoreOpen(false), [])

  /* Check if current page is one of the "More" items (to highlight the More button) */
  const isMoreActive = MOBILE_MORE.some((item) => item.href === pathname)

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isConnected) return null

  return (
    <div className="min-h-screen bg-background">
      <TestnetBanner />
      <OnboardingWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <div className="mx-auto flex w-full max-w-6xl gap-0 lg:gap-8 px-4 py-4 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-52 shrink-0 lg:flex flex-col sticky top-6 h-fit">
          <div className="mb-7">
            <Logo />
          </div>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWizardOpen(true)}
              className="w-full justify-start gap-2 text-xs font-semibold border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
            >
              <Sparkles className="size-3.5" />
              Onboarding Guide
            </Button>
            {publicKey && (
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <span className="font-mono text-[11px] text-slate-400 truncate">{truncate(publicKey, 4, 4)}</span>
                <CopyButton value={publicKey} label="Copied" className="size-5 ml-auto" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
              onClick={disconnect}
            >
              <LogOut className="size-4" />
              Disconnect
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex w-full min-w-0 flex-col">
          {/* Mobile header */}
          <header className="mb-4 flex items-center justify-between lg:hidden">
            <Logo />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWizardOpen(true)}
                title="Onboarding Guide"
                className="size-8 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/10"
              >
                <Sparkles className="size-4" />
              </Button>
              <NetworkSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Disconnect" onClick={disconnect} className="text-slate-500 hover:text-slate-200">
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>

          {/* Desktop top bar */}
          <div className="mb-6 hidden items-center justify-end gap-3 lg:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWizardOpen(true)}
              className="gap-1.5 text-xs font-semibold border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <Sparkles className="size-3.5" />
              Onboarding Guide
            </Button>
            <NetworkSwitcher />
            <ThemeToggle />
          </div>

          <main className="pb-20 lg:pb-6">{children}</main>
        </div>
      </div>

      {/* Mobile "More" overlay backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden animate-in fade-in duration-200"
          onClick={closeMore}
        />
      )}

      {/* Mobile "More" slide-up panel */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-[52px] z-50 lg:hidden transition-all duration-300 ease-out",
          moreOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        <div className="mx-3 mb-2 rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">More</span>
            <button
              onClick={closeMore}
              className="size-6 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Panel grid */}
          <div className="grid grid-cols-3 gap-1.5 p-3">
            {MOBILE_MORE.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMore}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-[11px] font-medium transition-all",
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
          {MOBILE_PRIMARY.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-2 text-[10px] font-medium transition-all",
                  active ? "text-cyan-400" : "text-slate-500 hover:text-slate-200",
                )}
              >
                <item.icon className={cn("size-5", active && "drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]")} />
                {item.label}
              </Link>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-2 text-[10px] font-medium transition-all",
              moreOpen || isMoreActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-200",
            )}
          >
            <MoreHorizontal className="size-5" />
            More
          </button>
        </div>
      </nav>
    </div>
  )
}

export function TestnetBanner() {
  const { network } = useWallet()
  if (network !== "testnet") return null
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/5 border-b border-amber-500/15 px-4 py-1.5 text-center text-[11px] font-semibold text-amber-400/80 tracking-wide">
      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
      Stellar Testnet — funds have no real value
    </div>
  )
}
