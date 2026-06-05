"use client"

import { Smartphone, Zap, Lock, TrendingUp, Wallet, BarChart3 } from "lucide-react"
import { FadeIn, GlowCard } from "./web3-animations"

const features = [
  {
    icon: Smartphone,
    title: "Multiple Wallet Support",
    description: "Connect with Freighter, WalletConnect, or import your secret key. Full flexibility in how you access your wallet.",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Your keys, your funds. We never store or access your secret keys. All data stays encrypted on your device.",
    gradient: "from-purple-500 to-violet-500",
    glowColor: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send and receive XLM instantly on the Stellar network. Transactions confirmed in seconds, not hours.",
    gradient: "from-emerald-500 to-green-500",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Updates",
    description: "Watch your balance update in real-time. Track every transaction with detailed history and status.",
    gradient: "from-orange-500 to-amber-500",
    glowColor: "rgba(249, 115, 22, 0.15)",
  },
  {
    icon: Wallet,
    title: "Token Management",
    description: "Manage multiple Stellar assets. Add custom tokens and track all your holdings in one place.",
    gradient: "from-pink-500 to-rose-500",
    glowColor: "rgba(236, 72, 153, 0.15)",
  },
  {
    icon: BarChart3,
    title: "Transaction History",
    description: "Complete transaction history with filtering and search. Export your data for accounting or analysis.",
    gradient: "from-cyan-500 to-teal-500",
    glowColor: "rgba(6, 182, 212, 0.15)",
  },
]

export function Features() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.8) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Modern Crypto Users
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your Stellar assets securely and efficiently.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeIn key={feature.title} delay={100 + index * 100}>
                <GlowCard glowColor={feature.glowColor} className="h-full">
                  <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 h-full transition-all duration-500 hover:border-border/80 hover:bg-card/80 hover:shadow-xl hover:-translate-y-1">
                    {/* Top gradient line */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative space-y-4">
                      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} bg-opacity-10 overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-15`} />
                        <Icon className="w-6 h-6 text-foreground relative z-10 group-hover:scale-110 transition-transform duration-300" />
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
                </GlowCard>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
