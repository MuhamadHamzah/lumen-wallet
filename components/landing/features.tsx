"use client"

import { Smartphone, Zap, Lock, TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { FadeIn } from "./web3-animations"

const features = [
  {
    icon: Smartphone,
    title: "Multiple Wallet Support",
    description: "Connect with Freighter, WalletConnect, or import your secret key. Full flexibility in how you access your wallet.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Your keys, your funds. We never store or access your secret keys. All data stays encrypted on your device.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send and receive XLM instantly on the Stellar network. Transactions confirmed in seconds, not hours.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-300",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Updates",
    description: "Watch your balance update in real-time. Track every transaction with detailed history and status.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Wallet,
    title: "Token Management",
    description: "Manage multiple Stellar assets. Add custom tokens and track all your holdings in one place.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Transaction History",
    description: "Complete transaction history with filtering and search. Export your data for accounting or analysis.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-300",
  },
]

export function Features() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.8) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">
                Modern Crypto Users
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your Stellar assets securely and efficiently.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeIn key={feature.title} delay={100 + index * 80}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/50 backdrop-blur-sm p-6 h-full transition-all duration-300 hover:border-blue-500/25 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative space-y-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${feature.iconBg} ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold leading-tight">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
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
