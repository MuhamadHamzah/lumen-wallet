"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Wallet, Droplets, ArrowRightLeft, MessageSquare, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

interface OnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingWizard({ open, onOpenChange }: OnboardingWizardProps) {
  const { publicKey, connectWallet } = useWallet()
  const [step, setStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: "Connect Stellar Wallet",
      description: "Connect via Freighter browser extension, WalletConnect, or auto-generate a Testnet Secret Key.",
      icon: Wallet,
    },
    {
      id: 2,
      title: "Fund with Testnet Friendbot",
      description: "Get 10,000 free testnet XLM instantly using the built-in Stellar Friendbot faucet.",
      icon: Droplets,
    },
    {
      id: 3,
      title: "Execute Your First DEX Swap / Escrow",
      description: "Swap XLM for USDC/EURC or lock milestone funds in Soroban smart contract escrow.",
      icon: ArrowRightLeft,
    },
    {
      id: 4,
      title: "Submit Feedback & Onboarding Form",
      description: "Provide your wallet address, name, email, and rating to complete testnet validation.",
      icon: MessageSquare,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] border border-border bg-card/95 backdrop-blur-md text-foreground p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="size-4" />
            <span>Interactive Onboarding Tour</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Welcome to Lumen Wallet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Step {step} of {steps.length}: {steps[step - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-4 gap-2 my-3">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.id <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="py-4 space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/40">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {(() => {
                const IconComponent = steps[step - 1].icon
                return <IconComponent className="size-5" />
              })()}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                {steps[step - 1].title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {steps[step - 1].description}
              </p>
            </div>
          </div>

          {/* Action Callout for Current Step */}
          {step === 1 && (
            <div className="p-3 rounded-lg bg-card border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono truncate max-w-[280px]">
                {publicKey ? `Connected: ${publicKey.substring(0, 8)}...` : "Wallet disconnected"}
              </span>
              {!publicKey ? (
                <Button size="sm" onClick={() => connectWallet("freighter")} className="h-8 text-xs gap-1.5 font-medium">
                  <Wallet className="size-3.5" /> Connect Freighter
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <CheckCircle2 className="size-4" /> Connected
                </span>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
              💡 Tip: Click the <strong className="text-foreground">"Fund 10,000 XLM"</strong> button in the wallet header to instantly receive testnet tokens via Friendbot.
            </div>
          )}

          {step === 3 && (
            <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
              ⚡ Try swapping 10 XLM for USDC on the <strong className="text-foreground">Swap Assets</strong> tab or create a decentralized escrow milestone in <strong className="text-foreground">LumenFlow Escrow</strong>.
            </div>
          )}

          {step === 4 && (
            <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
              📝 Visit the <strong className="text-foreground">Feedback & Analytics</strong> page to submit your wallet address, name, email, rating, and product feedback.
            </div>
          )}
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={step === 1}
            className="text-xs gap-1"
          >
            <ChevronLeft className="size-4" /> Previous
          </Button>

          <Button size="sm" onClick={handleNext} className="text-xs gap-1 font-semibold">
            {step === steps.length ? "Finish Tour" : "Next Step"}
            {step < steps.length && <ChevronRight className="size-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
