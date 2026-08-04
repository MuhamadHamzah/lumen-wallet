import { 
  Smartphone, 
  Zap, 
  Lock, 
  TrendingUp, 
  Wallet, 
  BarChart3,
  ShieldCheck,
  CalendarRange,
  Scale,
  Users,
  Layers,
  Award
} from "lucide-react"
import { FadeIn } from "./web3-animations"

const walletFeatures = [
  {
    icon: Smartphone,
    title: "Multiple Wallet Support",
    description: "Connect with Freighter, StellarWalletsKit, or import your custom secret key with complete non-custodial safety.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Lock,
    title: "Bank-Grade Key Security",
    description: "Your keys, your funds. Private keys stay encrypted locally in memory and are never transmitted to any server.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-300",
  },
  {
    icon: Zap,
    title: "Instant Stellar Transfers",
    description: "Send and receive XLM and custom Stellar tokens with 5-second ledger finality and sub-cent fees.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Balance Tracker",
    description: "Watch your balance update live with Horizon API SSE streaming. Track every payment and trustline instantly.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-300",
  },
  {
    icon: Wallet,
    title: "Stellar Asset Management",
    description: "Add trustlines for USDC, EURC, and custom Stellar tokens. Manage all your crypto holdings in one clean dashboard.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Ledger Transaction Explorer",
    description: "Complete transaction history with instant filtering, explorer hash links, and CSV export for accounting.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-300",
  },
]

const flowFeatures = [
  {
    icon: ShieldCheck,
    title: "Soroban Smart Contract Vaults",
    description: "Non-custodial WASM smart contracts on Stellar that securely lock project funds until contract conditions are met.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: CalendarRange,
    title: "Milestone Progress Disbursement",
    description: "Break complex deals into verified stages. Client approves deliverable -> funds auto-disburse to freelancer.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-300",
  },
  {
    icon: Scale,
    title: "Decentralized MultiSig Arbitration",
    description: "Fair 3-of-5 guardian keypair arbitration panel to resolve disputes and disburse funds without single points of failure.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Users,
    title: "Role-Based Web3 Dashboards",
    description: "Dedicated interfaces for Clients (Depositors), Freelancers (Beneficiaries), and Arbitrators with full contract audit trails.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Layers,
    title: "Sub-Cent Soroban Execution",
    description: "Execute complex smart contract operations on Stellar for less than $0.001 per transaction, making micro-escrows viable.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-300",
  },
  {
    icon: Award,
    title: "Time-Locked Safety Refunds",
    description: "Automatic contract expiration timeouts protecting clients from unresponsive contractors with zero-fee refund claims.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
]

interface FeaturesProps {
  mode?: "wallet" | "flow"
}

export function Features({ mode = "wallet" }: FeaturesProps) {
  const isWallet = mode === "wallet"
  const currentFeatures = isWallet ? walletFeatures : flowFeatures

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
            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${
              isWallet 
                ? "border-blue-500/20 bg-blue-500/10 text-blue-400" 
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}>
              {isWallet ? "LUMEN WALLET FEATURES" : "SOROBAN SMART CONTRACT ESCROW"}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {isWallet ? (
                <>
                  Powerful Features for{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Modern Crypto Users
                  </span>
                </>
              ) : (
                <>
                  On-Chain Milestone{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
                    Escrow Platform
                  </span>
                </>
              )}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isWallet 
                ? "Everything you need to manage your Stellar assets, send XLM, and execute non-custodial transactions."
                : "Establish trustless smart contract agreements, lock funds safely in Soroban vaults, and automate milestone payments."
              }
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {currentFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeIn key={feature.title} delay={100 + index * 80}>
                <div className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/50 backdrop-blur-sm p-6 h-full transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl ${
                  isWallet 
                    ? "hover:border-blue-500/25 hover:shadow-blue-500/5" 
                    : "hover:border-amber-500/25 hover:shadow-amber-500/5"
                }`}>
                  {/* Top accent line on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isWallet ? "via-blue-500/50" : "via-amber-500/50"
                  }`} />

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
