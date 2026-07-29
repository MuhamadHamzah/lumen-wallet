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

      <div className="mx-auto flex w-full max-w-6xl gap-0 lg:gap-8 px-4 py-4 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-52 shrink-0 lg:flex flex-col sticky top-6 h-fit">
          <div className="mb-6">
            <Logo />
          </div>

          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-border">
            {publicKey && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="size-2 rounded-full bg-success" />
                <span className="font-mono text-xs text-muted-foreground truncate">{truncate(publicKey, 4, 4)}</span>
                <CopyButton value={publicKey} label="Copied" className="size-5 ml-auto" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
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
              <NetworkSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Disconnect" onClick={disconnect} className="text-muted-foreground">
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>

          {/* Desktop top bar */}
          <div className="mb-6 hidden items-center justify-end gap-3 lg:flex">
            <NetworkSwitcher />
            <ThemeToggle />
          </div>

          <main className="pb-20 lg:pb-6">{children}</main>
        </div>
      </div>

      {/* Mobile "More" overlay backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
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
        <div className="mx-3 mb-2 rounded-2xl border border-border bg-card/98 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</span>
            <button
              onClick={closeMore}
              className="size-6 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Panel grid */}
          <div className="grid grid-cols-3 gap-1 p-3">
            {MOBILE_MORE.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMore}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-[11px] font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
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
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
          {MOBILE_PRIMARY.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-2 text-[10px] font-medium transition-colors",
              moreOpen || isMoreActive ? "text-primary" : "text-muted-foreground",
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
    <div className="flex items-center justify-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs font-medium text-amber-500">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Stellar Testnet - funds have no real value
    </div>
  )
}
