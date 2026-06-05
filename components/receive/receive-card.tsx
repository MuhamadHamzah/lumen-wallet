"use client"

import { QRCodeSVG } from "qrcode.react"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Card } from "@/components/ui/card"

export function ReceiveCard() {
  const { publicKey } = useWallet()

  return (
    <Card className="border-border p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-base font-semibold">Your wallet address</h2>
          <p className="text-sm text-muted-foreground">
            Scan the QR code or share your public key to receive XLM
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          {publicKey && (
            <QRCodeSVG value={publicKey} size={200} level="M" bgColor="#ffffff" fgColor="#0a0f1e" />
          )}
        </div>

        <div className="w-full">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Public key
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-left">
            <span className="min-w-0 flex-1 break-all font-mono text-sm">{publicKey}</span>
          </div>
          <div className="mt-3 flex justify-center">
            {publicKey && <CopyButton value={publicKey} label="Address copied to clipboard" size="sm" />}
          </div>
        </div>
      </div>
    </Card>
  )
}
