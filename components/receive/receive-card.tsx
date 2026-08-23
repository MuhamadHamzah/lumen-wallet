"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { useWallet } from "@/components/wallet-provider"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, ShieldCheck, Share2, Info, ArrowDownLeft } from "lucide-react"

export function ReceiveCard() {
  const { publicKey, network } = useWallet()
  const [requestAmount, setRequestAmount] = useState("")
  const [requestMemo, setRequestMemo] = useState("")

  // Generate SEP-0007 / Stellar Payment URI
  const paymentUri = publicKey
    ? `web+stellar:pay?destination=${publicKey}${requestAmount ? `&amount=${requestAmount}` : ""}${requestMemo ? `&memo=${encodeURIComponent(requestMemo)}` : ""}`
    : ""

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Left 5 Columns: QR Keyplate Card */}
      <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm flex flex-col items-center text-center">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono block">
            Public Stellar Keyplate
          </span>
          <h2 className="text-lg font-bold text-foreground">Scan QR Code</h2>
          <p className="text-xs text-muted-foreground">Compatible with all Stellar &amp; Freighter mobile scanners</p>
        </div>

        {/* High-Contrast Crisp QR Plate */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-md">
          {publicKey && (
            <QRCodeSVG
              value={paymentUri || publicKey}
              size={200}
              level="H"
              bgColor="#ffffff"
              fgColor="#070b19"
              imageSettings={{
                src: "/lumen-nobg.png",
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          )}
        </div>

        {/* Full Key Copy Strip */}
        <div className="w-full space-y-2 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Your Public Address
          </span>
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
            <span className="min-w-0 flex-1 break-all font-mono text-xs text-foreground select-all">
              {publicKey}
            </span>
            <CopyButton value={publicKey || ""} label="Address copied" className="shrink-0 size-8" />
          </div>
        </div>
      </div>

      {/* Right 7 Columns: Inbound Invoice Request Builder & Network Rules */}
      <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="size-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Inbound Request Builder</h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{network.toUpperCase()}</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Specify an optional amount and memo. The QR code on the left will automatically encode these parameters into a standardized Stellar payment payload.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requested XLM
              </Label>
              <Input
                id="req-amount"
                type="number"
                placeholder="0.00"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="font-mono text-xs rounded-xl h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-memo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required Memo / Invoice ID
              </Label>
              <Input
                id="req-memo"
                placeholder="e.g. INV-2026-001"
                value={requestMemo}
                onChange={(e) => setRequestMemo(e.target.value)}
                className="font-mono text-xs rounded-xl h-10"
              />
            </div>
          </div>

          {/* Generated Shareable URI */}
          {paymentUri && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Shareable Stellar Payment URI
                </span>
                <CopyButton value={paymentUri} label="Payment Link Copied" className="size-6" />
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 font-mono text-[11px] text-foreground/80 break-all">
                {paymentUri}
              </div>
            </div>
          )}
        </div>

        {/* Protocol Inbound Directives */}
        <div className="pt-4 border-t border-border/40 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-muted-foreground">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-foreground font-medium">Native XLM &amp; Trustline Assets:</strong> This address accepts native XLM immediately. For custom tokens (like USDC or EURC), ensure the sender has sufficient liquidity or the account has active trustlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
