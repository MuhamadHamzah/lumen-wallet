"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { WalletConnection } from "@/components/wallet-connection"
import { Logo } from "@/components/logo"
import { ShieldCheck, HelpCircle } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border border-white/[0.08] bg-card gap-0">
        <div className="flex flex-col md:flex-row min-h-[460px]">
          {/* Left Column - Brand Sidebar */}
          <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-b from-blue-950/20 via-background to-amber-950/10 border-r border-white/[0.06] w-72 shrink-0">
            <div className="space-y-4">
              <Logo />
              <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                Lumen Wallet connects you securely to the Stellar network. Send payments, fund escrow milestones, and manage assets with absolute custody.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="size-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Self-Custodial</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Your secret keys are never stored online or shared.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <HelpCircle className="size-4.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Support & Security</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Need help? Read our quick start guide in the repository.</p>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground/60 font-mono">
              v2.0.4 • Stellar Network
            </div>
          </div>

          {/* Right Column - Connection Options */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Connect Your Wallet</h2>
              <p className="text-xs text-muted-foreground mt-1 mb-6">Choose how you want to connect to Stellar</p>
              
              <WalletConnection onClose={() => onOpenChange(false)} />
            </div>

            <p className="text-[10px] text-muted-foreground text-center mt-6">
              By connecting a wallet, you agree to our Terms of Service and consent to our decentralized platform protocols.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
