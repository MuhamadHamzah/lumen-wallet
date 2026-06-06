"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, History, Coins, LogOut, ShieldCheck, RefreshCw, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@/components/wallet-provider"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: ArrowUpRight },
  { href: "/receive", label: "Receive", icon: ArrowDownLeft },
  { href: "/swap", label: "Swap", icon: RefreshCw },
  { href: "/tokens", label: "Tokens", icon: Coins },
  { href: "/history", label: "History", icon: History },
  { href: "/multisig", label: "Multisig Safe", icon: ShieldCheck },
]

const MOBILE_PRIMARY = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: ArrowUpRight },
  { href: "/swap", label: "Swap", icon: RefreshCw },
  { href: "/tokens", label: "Tokens", icon: Coins },
]

const MOBILE_SECONDARY = [
  { href: "/receive", label: "Receive", icon: ArrowDownLeft },
  { href: "/history", label: "History", icon: History },
  { href: "/multisig", label: "Multisig Safe", icon: ShieldCheck },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { isConnected, isInitialized, disconnect } = useWallet()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.replace("/")
    }
  }, [isInitialized, isConnected, router])

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

  if (!isConnected) return null

  return (
    <div className="min-h-screen bg-background">
      <TestnetBanner />

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 lg:px-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex bg-gradient-to-b from-card/50 to-muted/20 rounded-xl border border-border/30 p-4 h-fit sticky top-20">
          <div className="px-2 pb-2 mb-4 border-b border-border/50">
            <Logo />
          </div>
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <div className="mt-auto pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10"
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
          <header className="mb-6 flex items-center justify-between lg:hidden rounded-xl border border-border/30 bg-card/50 backdrop-blur px-4 py-3">
            <Logo />
            <div className="flex items-center gap-2">
              <NetworkSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Disconnect" onClick={disconnect} className="text-muted-foreground hover:text-foreground">
                <LogOut className="size-5" />
              </Button>
            </div>
          </header>

          {/* Desktop top bar */}
          <div className="mb-6 hidden items-center justify-end gap-3 lg:flex">
            <NetworkSwitcher />
            <ThemeToggle />
          </div>

          <main className="pb-24 lg:pb-6">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-1.5">
          {MOBILE_PRIMARY.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            )
          })}

          {/* More menu dropdown for secondary tabs */}
          {(() => {
            const isSecondaryActive = MOBILE_SECONDARY.some((item) => pathname === item.href)
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors outline-none cursor-pointer",
                      isSecondaryActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <MoreHorizontal className="size-5" />
                    <span>More</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur border-border/50">
                  {MOBILE_SECONDARY.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer w-full",
                          pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="size-4 animate-in fade-in zoom-in duration-200" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })()}
        </div>
      </nav>
    </div>
  )
}

export function TestnetBanner() {
  const { network } = useWallet()
  if (network !== "testnet") return null
  return (
    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-md">
      <span className="inline-block size-1.5 animate-pulse rounded-full bg-white/80" />
      Connected to Stellar Testnet — funds have no real value
    </div>
  )
}
