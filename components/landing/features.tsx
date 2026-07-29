"use client"

import { Smartphone, Zap, Lock, TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { FadeIn } from "./web3-animations"

const features = [
  {
    icon: Smartphone,
    title: "Multiple Wallet Support",
    description: "Connect with Freighter, WalletConnect, or import your secret key. Full flexibility in how you access your wallet.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Your keys, your funds. We never store or access your secret keys. All data stays encrypted on your device.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send and receive XLM instantly on the Stellar network. Transactions confirmed in seconds, not hours.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Updates",
    description: "Watch your balance update in real-time. Track every transaction with detailed history and status.",
  },
  {
    icon: Wallet,
    title: "Token Management",
    description: "Manage multiple Stellar assets. Add custom tokens and track all your holdings in one place.",
  },
  {
    icon: BarChart3,
    title: "Transaction History",
    description: "Complete transaction history with filtering and search. Export your data for accounting or analysis.",
  },
]

export function Features() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400 mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                Modern Crypto Users
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your Stellar assets securely and efficiently.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeIn key={feature.title} delay={100 + index * 100}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 h-full transition-all duration-300 hover:border-teal-500/40 hover:-translate-y-1">
                  <div className="relative space-y-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-400">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold leading-tight group-hover:text-foreground transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
