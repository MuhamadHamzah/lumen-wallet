"use client"

import { QRCodeSVG } from "qrcode.react"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Card } from "@/components/ui/card"

export function ReceiveCard() {
  const { publicKey } = useWallet()

  return (
    <Card className="border border-border bg-card p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Your wallet address</h2>
          <p className="text-sm text-muted-foreground">
            Scan the QR code or share your public key to receive XLM
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          {publicKey && (
            <QRCodeSVG value={publicKey} size={200} level="M" bgColor="#ffffff" fgColor="#000000" />
          )}
        </div>

        <div className="w-full space-y-2 mt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-left">
            Public key
          </p>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <span className="min-w-0 flex-1 break-all font-mono text-sm text-left">{publicKey}</span>
            <CopyButton value={publicKey} label="Address copied to clipboard" className="shrink-0 size-8" />
          </div>
        </div>
      </div>
    </Card>
  )
}
