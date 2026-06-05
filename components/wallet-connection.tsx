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

export function WalletConnection() {
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

  // Freighter connection
  const connectFreighter = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      // Use the official Freighter API package
      const freighterApi = await import("@stellar/freighter-api")

      // Check if Freighter is installed
      const isInstalled = await freighterApi.isConnected()
      if (!isInstalled) {
        throw new Error("Freighter extension not detected. Please install Freighter wallet extension.")
      }

      // Request access and get public key
      const accessObj = await freighterApi.requestAccess()
      if (accessObj.error) {
        throw new Error(accessObj.error)
      }

      const publicKey = accessObj.address
      if (!publicKey) {
        throw new Error("Failed to retrieve public key from Freighter")
      }

      // For Freighter, we get the public key but signing is handled by the extension
      // We'll store a marker that this is a Freighter wallet
      setWallet({ publicKey, secretKey: `freighter:${publicKey}` }, "freighter")
      toast.success("Connected with Freighter!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect Freighter"
      setError(message)
      toast.error(message)
      console.error("[v0] Freighter connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [setWallet])

  // WalletConnect connection
  const connectWalletConnect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      toast.info("WalletConnect support coming soon!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect WalletConnect"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
          <Sparkles className="h-4 w-4" />
          <span>Testnet Keypair Generated!</span>
        </div>

        {/* Public Key */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Public Key
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted/50 border border-border rounded-lg px-3 py-2.5 break-all select-all">
              {generatedKeypair.publicKey}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-9 w-9"
              onClick={() => copyToClipboard(generatedKeypair.publicKey, "public")}
            >
              {copiedField === "public" ? (
                <Check className="h-4 w-4 text-emerald-500" />
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
            <code className="flex-1 text-xs font-mono bg-muted/50 border border-border rounded-lg px-3 py-2.5 break-all select-all">
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
                <Check className="h-4 w-4 text-emerald-500" />
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-500 font-medium">Funded — 10,000 XLM (Testnet)</span>
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
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-xs text-amber-200/80">
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
    <div className="space-y-6 w-full max-w-md">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        {/* Generate Testnet Keypair — Primary action */}
        <Button
          onClick={generateTestnetKeypair}
          disabled={isGenerating || isLoading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300"
          size="lg"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {isGenerating ? "Generating..." : "Generate Testnet Keypair"}
        </Button>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or connect existing</span>
          </div>
        </div>

        {/* Freighter Button */}
        <Button
          onClick={connectFreighter}
          disabled={isLoading || isGenerating}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {isLoading ? "Connecting..." : "Connect with Freighter"}
        </Button>

        {/* WalletConnect Button */}
        <Button
          onClick={connectWalletConnect}
          disabled={isLoading || isGenerating}
          variant="outline"
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {isLoading ? "Connecting..." : "Connect with WalletConnect"}
        </Button>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Secret Key Button */}
        {!showSecretKeyForm ? (
          <Button
            onClick={() => setShowSecretKeyForm(true)}
            variant="secondary"
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <Lock className="mr-2 h-5 w-5" />
            Import Secret Key
          </Button>
        ) : (
          <Card className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Enter your Stellar secret key (starts with S)</p>
            <Input
              type="password"
              placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={secretKeyInput}
              onChange={(e) => setSecretKeyInput(e.target.value)}
              disabled={isLoading}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={connectWithSecretKey}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Connecting..." : "Connect"}
              </Button>
              <Button
                onClick={() => {
                  setShowSecretKeyForm(false)
                  setSecretKeyInput("")
                  setError("")
                }}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ Only import secret keys from wallets you control. Never share your secret key.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
