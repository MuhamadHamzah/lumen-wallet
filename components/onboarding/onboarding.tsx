"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2, Plus, Download, ShieldCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { generateKeypair, isValidSecret, publicFromSecret, type Keypair } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { KeyField } from "@/components/onboarding/key-field"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function Onboarding() {
  const router = useRouter()
  const { isConnected, setWallet, network } = useWallet()

  useEffect(() => {
    if (isConnected) router.replace("/")
  }, [isConnected, router])

  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      <div className={cn(
        "flex items-center justify-between gap-2 px-4 py-1.5 text-center text-xs font-mono font-semibold text-white transition-colors duration-300",
        network === "mainnet" ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
      )}>
        <span className="flex-1 text-center">
          {network === "mainnet"
            ? "Stellar Mainnet: Real Asset Execution"
            : "Stellar Testnet: Development & Sandbox Simulation"}
        </span>
      </div>

      <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <Logo />
        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" /> Secure Stellar Non-Custodial Keyring
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome to Lumen</h1>
            <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
              Initialize a high-performance cryptographic keypair on Stellar Horizon or import an existing secret.
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl h-11 p-1 bg-muted/40 border border-border/60">
              <TabsTrigger value="create" className="rounded-xl text-xs font-semibold">Create Keypair</TabsTrigger>
              <TabsTrigger value="import" className="rounded-xl text-xs font-semibold">Import Secret</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <CreateWallet onComplete={setWallet} network={network} />
            </TabsContent>

            <TabsContent value="import">
              <ImportWallet onComplete={setWallet} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

function CreateWallet({ onComplete, network }: { onComplete: (k: { publicKey: string; secretKey: string }) => void; network: string }) {
  const [generating, setGenerating] = useState(false)
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const kp = await generateKeypair()
      setKeypair(kp)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-4">
      {!keypair ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary">
            <Plus className="size-7" />
          </span>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-foreground">Generate New Ed25519 Keypair</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Creates a local keypair on the {network} without transmitting keys over the wire.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full h-11 rounded-xl font-semibold text-xs gap-2">
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating Keypair…
              </>
            ) : (
              "Generate Stellar Keypair"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <KeyField label="Public key (Account Address)" value={keypair.publicKey} />
          <KeyField label="Secret key (Private Signing Key)" value={keypair.secretKey} secret />

          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <p className="leading-relaxed">
              Backup your secret key securely. Anyone with access to this secret key possesses full custody over on-chain assets.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
            <Checkbox
              id="saved-key"
              checked={saved}
              onCheckedChange={(c) => setSaved(c === true)}
            />
            <Label htmlFor="saved-key" className="text-xs font-medium text-foreground cursor-pointer">
              I have safely backed up my secret key.
            </Label>
          </div>

          <Button
            disabled={!saved}
            className="h-11 rounded-xl font-semibold text-xs shadow-md"
            onClick={() => {
              onComplete({ publicKey: keypair.publicKey, secretKey: keypair.secretKey })
              toast.success("Wallet initialized")
            }}
          >
            Enter Lumen Wallet
          </Button>
        </div>
      )}
    </div>
  )
}

function ImportWallet({ onComplete }: { onComplete: (k: { publicKey: string; secretKey: string }) => void }) {
  const [secret, setSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const valid = isValidSecret(secret)
  const touched = secret.length > 0

  async function handleImport() {
    if (!valid) return
    setLoading(true)
    try {
      const publicKey = await publicFromSecret(secret.trim())
      onComplete({ publicKey, secretKey: secret.trim() })
      toast.success("Wallet imported successfully")
    } catch {
      toast.error("Could not import wallet. Please verify your secret key.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl shadow-sm space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary">
            <Download className="size-6" />
          </span>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-foreground">Import Existing Key</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Provide your 56-character Stellar secret key (starts with S).
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="secret" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Secret Key
          </Label>
          <Textarea
            id="secret"
            placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            rows={3}
            className="font-mono text-xs rounded-xl"
            aria-invalid={touched && !valid}
          />
          {touched && !valid && (
            <p className="text-[11px] font-mono text-destructive">
              Must start with &apos;S&apos; and be exactly 56 characters.
            </p>
          )}
        </div>

        <Button onClick={handleImport} disabled={!valid || loading} className="w-full h-11 rounded-xl font-semibold text-xs gap-2 shadow-md">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Importing Keypair…
            </>
          ) : (
            "Import Wallet"
          )}
        </Button>
      </div>
    </div>
  )
}
