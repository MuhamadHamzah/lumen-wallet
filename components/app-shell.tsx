"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, History, Coins, LogOut, ShieldCheck, RefreshCw, DollarSign, BarChart2, MoreHorizontal, X, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@/components/wallet-provider"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"
import { truncate } from "@/lib/stellar"
import { CopyButton } from "@/components/copy-button"

import { Compass } from "lucide-react"
import { OnboardingWizard } from "@/components/onboarding-wizard"

const NAV_SECTIONS = [
  {
    title: "Portfolio",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/send", label: "Send Assets", icon: ArrowUpRight },
      { href: "/receive", label: "Receive", icon: ArrowDownLeft },
      { href: "/swap", label: "Swap Tokens", icon: RefreshCw },
      { href: "/tokens", label: "Soroban Assets", icon: Coins },
    ],
  },
  {
    title: "Contracts & Governance",
    items: [
      { href: "/escrow", label: "Milestone Escrow", icon: DollarSign },
      { href: "/multisig", label: "MultiSig Vault", icon: ShieldCheck },
    ],
  },
  {
    title: "Ledger Insights",
    items: [
      { href: "/history", label: "Explorer History", icon: History },
      { href: "/feedback", label: "Telemetry & Feed", icon: BarChart2 },
      { href: "/docs", label: "Developer Docs", icon: BookOpen },
    ],
  },
]

/* Flat list for active checking */
const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

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
  { href: "/multisig", label: "Multisig", icon: ShieldCheck },
  { href: "/feedback", label: "Analytics", icon: BarChart2 },
  { href: "/docs", label: "Docs", icon: BookOpen },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { isConnected, isInitialized, disconnect, publicKey, network } = useWallet()
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

  /* Check if current page is one of the "More" items */
  const isMoreActive = MOBILE_MORE.some((item) => item.href === pathname)

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Connecting to Horizon node…</p>
        </div>
      </div>
    )
  }

  if (!isConnected) return null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <OnboardingWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 lg:gap-8 px-4 py-4 lg:px-8 lg:py-6">
        {/* Desktop Domain-Structured Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:flex flex-col sticky top-6 h-[calc(100vh-3rem)] justify-between pb-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <Logo />
            </div>

            <nav className="space-y-5" aria-label="Main Navigation">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            active
                              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent",
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Account & Session Management Footer */}
          <div className="pt-4 border-t border-border/50 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWizardOpen(true)}
              className="w-full justify-start gap-2 text-xs font-medium border-primary/20 text-primary hover:bg-primary/10 transition-all focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Compass className="size-3.5" />
              Onboarding Guide
            </Button>
            {publicKey && (
              <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-mono text-[11px] text-foreground truncate">{truncate(publicKey, 4, 4)}</span>
                </div>
                <CopyButton value={publicKey} label="Address copied" className="size-6 shrink-0" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive"
              onClick={disconnect}
            >
              <LogOut className="size-3.5" />
              Disconnect Wallet
            </Button>
          </div>
        </aside>

        {/* Main Application Cockpit Frame */}
        <div className="flex w-full min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <header className="mb-4 flex items-center justify-between lg:hidden border-b border-border/40 pb-3">
            <Logo />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWizardOpen(true)}
                title="Onboarding Guide"
                className="size-8 text-primary border-primary/25 hover:bg-primary/10"
              >
                <Compass className="size-4" />
              </Button>
              <NetworkSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Disconnect" onClick={disconnect} className="text-muted-foreground hover:text-destructive">
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>

          {/* Desktop Top Status Ribbon */}
          <div className="mb-6 hidden items-center justify-between border-b border-border/40 pb-3 lg:flex">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className="font-mono uppercase font-semibold text-foreground/80 tracking-wide">Stellar Horizon</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1.5 text-emerald-500 font-mono text-[11px]">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live SSE Synced
              </span>
              {network === "mainnet" ? (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[10px] font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Stellar Mainnet Public
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 font-mono text-[10px] font-semibold">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Testnet Sandbox
                  </span>
                </>
              )}
              <span className="text-muted-foreground/40">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono text-[10px] font-medium" title="Stellar Fee Bump relayer is online and sponsoring gas fees">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                ⚡ Gasless Relayer Active
              </span>
            </div>
            <div className="flex items-center gap-3">
              <NetworkSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <main className="flex-1 pb-24 lg:pb-8 focus:outline-none" tabIndex={-1}>{children}</main>
        </div>
      </div>

      {/* Mobile "More" overlay backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden animate-in fade-in duration-200"
          onClick={closeMore}
        />
      )}

      {/* Mobile "More" slide-up panel */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-[54px] z-50 lg:hidden transition-all duration-300 ease-out",
          moreOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        <div className="mx-3 mb-2 rounded-2xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">More Services</span>
            <button
              onClick={closeMore}
              className="size-6 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Panel grid */}
          <div className="grid grid-cols-3 gap-2 p-3">
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
                      ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent",
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
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
          {MOBILE_PRIMARY.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-2 text-[10px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary",
                  active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-5", active && "drop-shadow-sm")} />
                {item.label}
              </Link>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-2 text-[10px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary",
              moreOpen || isMoreActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
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
