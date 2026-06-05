"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2, Plus, Download } from "lucide-react"
import { toast } from "sonner"
import { generateKeypair, isValidSecret, publicFromSecret, type Keypair } from "@/lib/stellar"
import { useWallet } from "@/components/wallet-provider"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkSwitcher } from "@/components/network-switcher"
import { KeyField } from "@/components/onboarding/key-field"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
    <main className="flex min-h-screen flex-col bg-background">
      <div className={cn(
        "flex items-center justify-between gap-2 px-4 py-1.5 text-center text-xs font-semibold text-white transition-colors duration-300",
        network === "mainnet" ? "bg-green-600 animate-pulse" : "bg-amber-600"
      )}>
        <span className="flex-1 text-center">
          {network === "mainnet"
            ? "Stellar Mainnet — Transactions use real funds"
            : "Stellar Testnet — For development & testing only"}
        </span>
      </div>

      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <NetworkSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Welcome to Lumen</h1>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Create a new Stellar wallet or import an existing one to get started.
            </p>
          </div>

          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create new</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
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
    <Card className="mt-4 border-border p-6">
      {!keypair ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Plus className="size-6" />
          </span>
          <div>
            <h2 className="font-semibold">Generate a new keypair</h2>
            <p className="text-sm text-muted-foreground text-pretty">
              We&apos;ll create a fresh Stellar address for you on the {network}.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full gap-2">
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Create wallet"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <KeyField label="Public key" value={keypair.publicKey} />
          <KeyField label="Secret key" value={keypair.secretKey} secret />

          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-xs text-muted-foreground text-pretty">
              Save your secret key somewhere safe. Anyone with this key can control your funds, and it can
              never be recovered if lost.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="saved-key"
              checked={saved}
              onCheckedChange={(c) => setSaved(c === true)}
              className="mt-0.5"
            />
            <Label htmlFor="saved-key" className="text-sm font-normal leading-snug text-muted-foreground">
              I have securely saved my secret key.
            </Label>
          </div>

          <Button
            disabled={!saved}
            onClick={() => {
              onComplete({ publicKey: keypair.publicKey, secretKey: keypair.secretKey })
              toast.success("Wallet created")
            }}
          >
            Continue to wallet
          </Button>
        </div>
      )}
    </Card>
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
      // Derive the real public key from the secret, locally in the browser.
      const publicKey = await publicFromSecret(secret.trim())
      onComplete({ publicKey, secretKey: secret.trim() })
      toast.success("Wallet imported")
    } catch {
      toast.error("Could not import wallet. Please check your secret key.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4 border-border p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Download className="size-6" />
          </span>
          <div>
            <h2 className="font-semibold">Import existing wallet</h2>
            <p className="text-sm text-muted-foreground text-pretty">
              Paste your secret key to restore access to your wallet.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="secret">Secret key</Label>
          <Textarea
            id="secret"
            placeholder="S..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            rows={3}
            className="font-mono text-sm"
            aria-invalid={touched && !valid}
          />
          {touched && !valid && (
            <p className="text-xs text-destructive">
              Enter a valid Stellar secret key (starts with S, 56 characters).
            </p>
          )}
        </div>

        <Button onClick={handleImport} disabled={!valid || loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Importing…
            </>
          ) : (
            "Import wallet"
          )}
        </Button>
      </div>
    </Card>
  )
}
