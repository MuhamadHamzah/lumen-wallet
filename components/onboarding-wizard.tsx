"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Wallet, Droplets, ArrowRightLeft, MessageSquare, ChevronRight, ChevronLeft, ShieldCheck, Zap } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

interface OnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingWizard({ open, onOpenChange }: OnboardingWizardProps) {
  const { publicKey } = useWallet()
  const [step, setStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: "Connect Stellar Wallet",
      description: "Connect your Freighter extension, WalletConnect, or auto-generate a Testnet keypair.",
      icon: Wallet,
      badge: "Step 1: Identity",
    },
    {
      id: 2,
      title: "Fund Account via Friendbot",
      description: "Claim 10,000 free testnet XLM instantly from the official Stellar Friendbot faucet.",
      icon: Droplets,
      badge: "Step 2: Liquidity",
    },
    {
      id: 3,
      title: "Execute DEX Swap or Escrow",
      description: "Perform instant asset swaps or lock funds into Soroban milestone escrow contracts.",
      icon: ArrowRightLeft,
      badge: "Step 3: Smart Contract",
    },
    {
      id: 4,
      title: "Submit Verification & Feedback",
      description: "Submit your name, email, rating, and feedback to complete testnet validation.",
      icon: MessageSquare,
      badge: "Step 4: Active Proof",
    },
  ]

  const handleNext = () => {
    if (step < steps.length) {
      setStep((prev) => prev + 1)
    } else {
      onOpenChange(false)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  const current = steps[step - 1]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md border border-cyan-500/20 bg-slate-950/95 backdrop-blur-2xl text-foreground p-5 sm:p-6 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.12)] overflow-hidden">
        {/* Decorative Glow Elements */}
        <div className="absolute -top-24 -right-24 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <DialogHeader className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="size-3.5" />
              {current.badge}
            </span>
            <span className="text-xs font-mono text-muted-foreground font-semibold">
              {step} / {steps.length}
            </span>
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-white pt-1">
            {current.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 leading-relaxed">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-4 gap-2 my-4 relative z-10">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`h-2 rounded-full transition-all duration-300 ${
                s.id === step
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  : s.id < step
                  ? "bg-cyan-500/40"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Step Card Container */}
        <div className="py-2 relative z-10">
          <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner">
                {(() => {
                  const IconComponent = current.icon
                  return <IconComponent className="size-6" />
                })()}
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  {current.title}
                  {publicKey && step === 1 && (
                    <ShieldCheck className="size-4 text-emerald-400 inline" />
                  )}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Follow the interactive prompt below to execute this action.
                </p>
              </div>
            </div>

            {/* Contextual Action Cards */}
            {step === 1 && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs gap-2 overflow-hidden">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Wallet Address</div>
                  <div className="font-mono text-cyan-300 text-[11px] truncate">
                    {publicKey ? `${publicKey.slice(0, 10)}...${publicKey.slice(-6)}` : "Not connected"}
                  </div>
                </div>
                {!publicKey ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      onOpenChange(false)
                      window.location.href = "/onboarding"
                    }}
                    className="h-7 text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shrink-0 gap-1 px-3"
                  >
                    <Wallet className="size-3" /> Connect
                  </Button>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold shrink-0">
                    <CheckCircle2 className="size-3.5" /> Ready
                  </span>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                💡 <strong className="text-cyan-400">Pro Tip:</strong> Use the <span className="font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded">Fund 10,000 XLM</span> button in the top navigation bar to trigger automated Friendbot testnet funding.
              </div>
            )}

            {step === 3 && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                ⚡ <strong className="text-cyan-400">Smart Contract Action:</strong> Navigate to <strong className="text-white">Swap Assets</strong> to execute Path Payment swaps or launch a milestone contract in <strong className="text-white">LumenFlow Escrow</strong>.
              </div>
            )}

            {step === 4 && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                📝 <strong className="text-cyan-400">Onboarding Proof:</strong> Head over to <strong className="text-white">Analytics & Feedback</strong> to submit your details and rate your experience.
              </div>
            )}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={step === 1}
            className="text-xs gap-1 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="size-4" /> Previous
          </Button>

          <Button
            size="sm"
            onClick={handleNext}
            className="text-xs gap-1 font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            {step === steps.length ? "Complete Tour" : "Next Step"}
            {step < steps.length && <ChevronRight className="size-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
