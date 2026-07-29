"use client"

import { useState, useCallback } from "react"
import { Lock, Wallet, AlertCircle, Sparkles, Copy, Check, Eye, EyeOff } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface GeneratedKeypair {
  publicKey: string
  secretKey: string
  funded: boolean
}

interface WalletConnectionProps {
  onClose?: () => void
}

export function WalletConnection({ onClose }: WalletConnectionProps = {}) {
  const { setWallet } = useWallet()
  const [secretKeyInput, setSecretKeyInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSecretKeyForm, setShowSecretKeyForm] = useState(false)
  const [error, setError] = useState("")
  const [generatedKeypair, setGeneratedKeypair] = useState<GeneratedKeypair | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  // Generate new testnet keypair
  const generateTestnetKeypair = useCallback(async () => {
    try {
      setIsGenerating(true)
      setError("")
      setGeneratedKeypair(null)

      const { Keypair } = await import("@stellar/stellar-sdk")
      const keypair = Keypair.random()
      const publicKey = keypair.publicKey()
      const secretKey = keypair.secret()

      setGeneratedKeypair({ publicKey, secretKey, funded: false })

      // Fund via Friendbot
      toast.info("Funding account via Friendbot...")
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      )

      if (!response.ok) {
        throw new Error("Friendbot funding failed. Try again later.")
      }

      setGeneratedKeypair({ publicKey, secretKey, funded: true })
      toast.success("Testnet account created & funded with 10,000 XLM!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate keypair"
      setError(message)
      toast.error(message)
      console.error("[v0] Keypair generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Connect with generated keypair
  const connectWithGenerated = useCallback(() => {
    if (!generatedKeypair) return
    setWallet(
      { publicKey: generatedKeypair.publicKey, secretKey: generatedKeypair.secretKey },
      "manual"
    )
    setGeneratedKeypair(null)
    toast.success("Wallet connected successfully!")
  }, [generatedKeypair, setWallet])

  // Connect with StellarWalletsKit
  const connectStellarWallet = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      // Close the parent dialog first so it doesn't overlap/block interaction with StellarWalletsKit modal
      if (onClose) {
        onClose()
      }

      const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
      const { address } = await StellarWalletsKit.authModal()

      setWallet({ publicKey: address, secretKey: `kit:${address}` }, "kit")
      toast.success("Wallet connected successfully!")
    } catch (err: any) {
      if (err?.message === "The user closed the modal.") {
        return
      }
      const message = err instanceof Error ? err.message : (err?.message || "Failed to connect wallet")
      setError(message)
      toast.error(message)
      console.error("[v0] StellarWalletsKit connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [setWallet, onClose])

  // Manual secret key connection
  const connectWithSecretKey = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      if (!secretKeyInput.trim()) {
        throw new Error("Please enter a secret key")
      }

      // Validate and derive public key from secret key
      const { StrKey } = await import("@stellar/stellar-sdk")

      if (!StrKey.isValidEd25519SecretSeed(secretKeyInput.trim())) {
        throw new Error("Invalid secret key format. Please enter a valid Stellar secret key.")
      }

      // Import keypair to get public key
      const { Keypair } = await import("@stellar/stellar-sdk")
      const keypair = Keypair.fromSecret(secretKeyInput.trim())
      const publicKey = keypair.publicKey()

      setWallet({ publicKey, secretKey: secretKeyInput.trim() }, "manual")
      setSecretKeyInput("")
      setShowSecretKeyForm(false)
      toast.success("Wallet connected successfully!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(message)
      toast.error(message)
      console.error("[v0] Secret key connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [secretKeyInput, setWallet])

  // If we have a generated keypair, show that UI
  if (generatedKeypair) {
    return (
      <div className="space-y-5 w-full max-w-md">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Testnet Keypair Generated!</span>
        </div>

        {/* Public Key */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Public Key
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted rounded-lg p-3 break-all select-all">
              {generatedKeypair.publicKey}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-9 w-9"
              onClick={() => copyToClipboard(generatedKeypair.publicKey, "public")}
            >
              {copiedField === "public" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Secret Key */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Secret Key
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted rounded-lg p-3 break-all select-all">
              {showSecret
                ? generatedKeypair.secretKey
                : "S" + "•".repeat(54)}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-9 w-9"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-9 w-9"
              onClick={() => copyToClipboard(generatedKeypair.secretKey, "secret")}
            >
              {copiedField === "secret" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          {generatedKeypair.funded ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary font-medium">Funded — 10,000 XLM (Testnet)</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-amber-500 font-medium">Funding in progress...</span>
            </>
          )}
        </div>

        {/* Warning */}
        <Alert className="border-border bg-muted">
          <AlertCircle className="h-4 w-4 text-foreground" />
          <AlertDescription className="text-xs text-foreground">
            Save your secret key! It will not be shown again after you connect. This is a <strong>testnet</strong> account.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={connectWithGenerated}
            disabled={!generatedKeypair.funded}
            className="flex-1 h-11 font-semibold"
          >
            {generatedKeypair.funded ? "Connect Wallet" : "Waiting for funding..."}
          </Button>
          <Button
            onClick={() => {
              setGeneratedKeypair(null)
              setError("")
            }}
            variant="outline"
            className="h-11"
          >
            Back
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6 w-full">
      {error && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        {/* Connect Stellar Wallet Card (Primary/Recommended) */}
        <div 
          onClick={(!isGenerating && !isLoading) ? connectStellarWallet : undefined}
          className={`group flex items-center p-4 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/30 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${isGenerating || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:scale-105">
            <Wallet className="size-5" />
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Connect Stellar Wallet</span>
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">Use Freighter or other browser wallets</span>
          </div>
        </div>

        {/* Generate Testnet Keypair Card */}
        <div 
          onClick={(!isGenerating && !isLoading) ? generateTestnetKeypair : undefined}
          className={`group flex items-center p-4 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/30 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${isGenerating || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-300 flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:scale-105">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Generate Testnet Keypair</span>
              <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Developer Faucet</span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">Instantly create and fund a test account</span>
          </div>
        </div>

        {/* Secret Key Card */}
        {!showSecretKeyForm ? (
          <div 
            onClick={() => setShowSecretKeyForm(true)}
            className={`group flex items-center p-4 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/30 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${isGenerating || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="size-10 rounded-xl bg-white/5 text-muted-foreground flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:scale-105">
              <Lock className="size-5" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm text-foreground">Import Secret Key</span>
              <span className="text-xs text-muted-foreground mt-0.5">Manually paste a secret key to sign transactions</span>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3.5 border border-white/[0.08] bg-white/[0.02] rounded-xl">
            <p className="text-xs text-foreground font-semibold">Enter your Stellar secret key (starts with S)</p>
            <Input
              type="password"
              placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={secretKeyInput}
              onChange={(e) => setSecretKeyInput(e.target.value)}
              disabled={isLoading}
              className="font-mono text-xs bg-muted border-none placeholder:text-muted-foreground/40 h-9"
            />
            <div className="flex gap-2">
              <Button
                onClick={connectWithSecretKey}
                disabled={isLoading}
                className="flex-1 h-9 text-xs font-semibold"
              >
                {isLoading ? "Connecting..." : "Connect Key"}
              </Button>
              <Button
                onClick={() => {
                  setShowSecretKeyForm(false)
                  setSecretKeyInput("")
                  setError("")
                }}
                disabled={isLoading}
                variant="outline"
                className="flex-1 h-9 text-xs font-semibold"
              >
                Cancel
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Only import secret keys from wallets you control. Never share your secret key.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
