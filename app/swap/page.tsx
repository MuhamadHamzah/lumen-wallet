"use client"

import { useState, useEffect, useRef } from "react"
import { useSWRConfig } from "swr"
import useSWR from "swr"
import {
  RefreshCw,
  Settings,
  ArrowDown,
  Coins,
  Info,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { useWallet } from "@/components/wallet-provider"
import { AppShell } from "@/components/app-shell"
import { getFeeEstimate, truncate, stellarExpertUrl, getSwapPath, executeSwap, createTrustline } from "@/lib/stellar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CopyButton } from "@/components/copy-button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Pre-defined popular assets configurations
const POPULAR_ASSETS = {
  testnet: [
    { code: "XLM", name: "Stellar Lumens", issuer: "native", symbol: "XLM" },
    { code: "USDC", name: "USD Coin (Centre)", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", symbol: "USDC" },
    { code: "EURC", name: "Euro Coin (Circle)", issuer: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO", symbol: "EURC" },
  ],
  mainnet: [
    { code: "XLM", name: "Stellar Lumens", issuer: "native", symbol: "XLM" },
    { code: "USDC", name: "USD Coin (Circle)", issuer: "GA5ZSEUNTZOSABW6AD4YQH6VQNDALCTWCKRTRT6WXDT3DJ6ICHQICUB7", symbol: "USDC" },
    { code: "EURC", name: "Euro Coin (Circle)", issuer: "GDUIECN2N6557HKJ23C42VBDQGDB57RLNTA5OOWEQ67554XN7LVEURC7", symbol: "EURC" },
  ],
}

interface AssetOption {
  code: string
  name: string
  issuer: string
  symbol: string
}

async function fetchAccount(address: string, net: string) {
  const res = await fetch(`/api/account?address=${encodeURIComponent(address)}&network=${net}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error("Failed to load account details.")
  }
  return await res.json()
}

const logInteraction = async (pubKey: string, actionName: string, txHash: string) => {
  try {
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: pubKey,
        action: actionName,
        txHash,
      }),
    })
  } catch (err) {
    console.error("Failed to log interaction:", err)
  }
}

export default function SwapPage() {
  const { publicKey, secretKey, network, walletType } = useWallet()
  const { mutate } = useSWRConfig()

  // SWR for Account Details
  const { data: accountDetails, error: accountError, mutate: mutateAccount } = useSWR(
    publicKey ? ["account", publicKey, network] : null,
    () => fetchAccount(publicKey!, network)
  )

  const assets = POPULAR_ASSETS[network] || POPULAR_ASSETS.testnet

  // Custom Assets Tracking State
  const [customAssets, setCustomAssets] = useState<AssetOption[]>([])
  const allAssets = [...assets, ...customAssets]

  // State
  const [sourceAsset, setSourceAsset] = useState<AssetOption>(assets[0])
  const [destAsset, setDestAsset] = useState<AssetOption>(assets[1])
  const [sourceAmount, setSourceAmount] = useState("")
  const [destAmount, setDestAmount] = useState("")
  const [rate, setRate] = useState<number | null>(null)
  const [path, setPath] = useState<Array<{ code: string; issuer: string }>>([])
  
  // Custom Asset Panel State
  const [isCustomSource, setIsCustomSource] = useState(false)
  const [isCustomDest, setIsCustomDest] = useState(false)
  const [customSrcCode, setCustomSrcCode] = useState("")
  const [customSrcIssuer, setCustomSrcIssuer] = useState("")
  const [customDstCode, setCustomDstCode] = useState("")
  const [customDstIssuer, setCustomDstIssuer] = useState("")

  // Settings & Status
  const [slippage, setSlippage] = useState(1.0) // 1.0% default
  const [showSettings, setShowSettings] = useState(false)
  const [pathLoading, setPathLoading] = useState(false)
  const [pathError, setPathError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  
  // Debounce timeout ref
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Rotate animation state for swap icon
  const [rotated, setRotated] = useState(false)

  // Reset Custom Assets when switching network
  useEffect(() => {
    setCustomAssets([])
    const newAssets = POPULAR_ASSETS[network] || POPULAR_ASSETS.testnet
    setSourceAsset(newAssets[0])
    setDestAsset(newAssets[1])
  }, [network])

  // Reset output when inputs change
  useEffect(() => {
    setDestAmount("")
    setRate(null)
    setPath([])
    setPathError(null)
  }, [sourceAsset, destAsset])

  // Pathfinding Debounce Effect
  useEffect(() => {
    const amountVal = sourceAmount.trim()
    if (!amountVal || Number(amountVal) <= 0) {
      setDestAmount("")
      setRate(null)
      setPath([])
      setPathError(null)
      return
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)

    setPathLoading(true)
    setPathError(null)

    debounceTimeout.current = setTimeout(async () => {
      try {
        const result = await getSwapPath(
          sourceAsset.code,
          sourceAsset.issuer,
          destAsset.code,
          destAsset.issuer,
          amountVal,
          network
        )

        if (result.pathExists) {
          setDestAmount(result.destinationAmount)
          setRate(result.rate)
          setPath(result.path)
        } else {
          setPathError(result.error || "No path found with sufficient liquidity.")
          setDestAmount("")
          setRate(null)
        }
      } catch (err) {
        console.error("Error finding path:", err)
        setPathError("Failed to fetch swap path. Please try again.")
        setDestAmount("")
        setRate(null)
      } finally {
        setPathLoading(false)
      }
    }, 500)

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    }
  }, [sourceAmount, sourceAsset, destAsset, network])

  // Get asset balance helpers
  const getAssetBalance = (code: string, issuer: string): number => {
    if (!accountDetails) return 0
    if (code.toUpperCase() === "XLM" || issuer === "native") {
      const native = accountDetails.balances.find((b: any) => b.asset_type === "native")
      return native ? Number(native.balance) : 0
    }
    const asset = accountDetails.balances.find(
      (b: any) => b.asset_code === code && b.asset_issuer === issuer
    )
    return asset ? Number(asset.balance) : 0
  }

  const hasTrustline = (code: string, issuer: string): boolean => {
    if (code.toUpperCase() === "XLM" || issuer === "native") return true
    if (!accountDetails) return false
    return accountDetails.balances.some(
      (b: any) => b.asset_code === code && b.asset_issuer === issuer
    )
  }

  const srcBalance = getAssetBalance(sourceAsset.code, sourceAsset.issuer)
  const destBalance = getAssetBalance(destAsset.code, destAsset.issuer)
  const destHasTrustline = hasTrustline(destAsset.code, destAsset.issuer)
  const accountExists = accountDetails !== null

  // Switch source and destination
  const handleSwapAssets = () => {
    setRotated(!rotated)
    const prevSrc = { ...sourceAsset }
    const prevDst = { ...destAsset }
    const prevCustomSrc = isCustomSource
    const prevCustomDst = isCustomDest

    setSourceAsset(prevDst)
    setDestAsset(prevSrc)
    setIsCustomSource(prevCustomDst)
    setIsCustomDest(prevCustomSrc)
    setSourceAmount(destAmount)
  }

  // Handle trustline addition
  const handleAddTrustline = async () => {
    if (!destAsset || !secretKey) return
    setActionLoading(true)

    const loadingToast = toast.loading(`Opening trustline for ${destAsset.code}...`)

    try {
      if (walletType === "kit" || secretKey.startsWith("kit:")) {
        // Prepare changeTrust XDR
        const res = await fetch("/api/trustline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: publicKey, assetCode: destAsset.code, assetIssuer: destAsset.issuer, network }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to prepare trustline transaction.")
        }
        const { unsignedTxXdr } = await res.json()

        // Sign with StellarWalletsKit
        const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
        const networkPassphrase = network === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedTxXdr, {
          networkPassphrase,
          address: publicKey || undefined,
        })

        if (!signedTxXdr) throw new Error("Transaction signature rejected by user.")

        // Submit back
        const submitRes = await fetch("/api/trustline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr: signedTxXdr, network }),
        })
        if (!submitRes.ok) {
          const errData = await submitRes.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to submit trustline transaction.")
        }
      } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
        // Direct execution (Manual/Secret Key)
        await createTrustline({
          secret: secretKey,
          assetCode: destAsset.code,
          assetIssuer: destAsset.issuer,
          network,
        })
      }

      toast.dismiss(loadingToast)
      toast.success(`Trustline for ${destAsset.code} opened successfully!`)
      logInteraction(publicKey || "Unknown", `Open Trustline (${destAsset.code})`, "N/A (Trustline)")
      mutateAccount()
    } catch (err: any) {
      toast.dismiss(loadingToast)
      toast.error(err.message || "Failed to add trustline. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Swap Execution
  const handleExecuteSwap = async () => {
    if (!sourceAmount || !destAmount || !secretKey) return
    setActionLoading(true)

    // Calculate destMinAmount based on slippage tolerance
    const destMinAmount = (Number(destAmount) * (1 - slippage / 100)).toFixed(7)

    const loadingToast = toast.loading(`Executing swap of ${sourceAmount} ${sourceAsset.code}...`)
    let successHash = ""

    try {
      if (walletType === "kit" || secretKey.startsWith("kit:")) {
        // 1. Prepare swap XDR
        const res = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: publicKey,
            sourceAssetCode: sourceAsset.code,
            sourceAssetIssuer: sourceAsset.issuer,
            destAssetCode: destAsset.code,
            destAssetIssuer: destAsset.issuer,
            amount: sourceAmount,
            destMinAmount,
            path,
            network,
          }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to prepare swap transaction.")
        }
        const { unsignedTxXdr } = await res.json()

        // 2. Sign with StellarWalletsKit
        const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
        const networkPassphrase = network === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedTxXdr, {
          networkPassphrase,
          address: publicKey || undefined,
        })

        if (!signedTxXdr) throw new Error("Transaction signature rejected by user.")

        // 3. Submit
        const submitRes = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr: signedTxXdr, network }),
        })
        if (!submitRes.ok) {
          const errData = await submitRes.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to submit swap transaction.")
        }
        const { hash } = await submitRes.json()
        setTxHash(hash)
        successHash = hash
      } else if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
        // Direct execution (Manual/Secret Key)
        const result = await executeSwap({
          secret: secretKey,
          sourceAssetCode: sourceAsset.code,
          sourceAssetIssuer: sourceAsset.issuer,
          destAssetCode: destAsset.code,
          destAssetIssuer: destAsset.issuer,
          amount: sourceAmount,
          destMinAmount,
          path,
          network,
        })
        if (result.hash) {
          setTxHash(result.hash)
          successHash = result.hash
        }
      }

      toast.dismiss(loadingToast)
      toast.success("Assets swapped successfully!")
      logInteraction(
        publicKey || "Unknown",
        `Swap ${sourceAmount} ${sourceAsset.code} to ${destAsset.code}`,
        successHash || "Success"
      )
      
      // Mutate relevant details
      mutateAccount()
      if (publicKey) {
        mutate(["balance", publicKey, network])
        mutate(["transactions", publicKey, network])
      }
    } catch (err: any) {
      toast.dismiss(loadingToast)
      toast.error(err.message || "Swap failed. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle custom asset setup
  const handleApplyCustomAsset = (type: "source" | "dest") => {
    if (type === "source") {
      if (!customSrcCode || !customSrcIssuer) {
        toast.error("Please enter code and issuer public key.")
        return
      }
      const newAsset = {
        code: customSrcCode.toUpperCase(),
        issuer: customSrcIssuer,
        name: `${customSrcCode.toUpperCase()} (Custom)`,
        symbol: customSrcCode.toUpperCase(),
      }
      if (!allAssets.some((a) => a.code === newAsset.code && a.issuer === newAsset.issuer)) {
        setCustomAssets((prev) => [...prev, newAsset])
      }
      setSourceAsset(newAsset)
      setIsCustomSource(false)
      setCustomSrcCode("")
      setCustomSrcIssuer("")
    } else {
      if (!customDstCode || !customDstIssuer) {
        toast.error("Please enter code and issuer public key.")
        return
      }
      const newAsset = {
        code: customDstCode.toUpperCase(),
        issuer: customDstIssuer,
        name: `${customDstCode.toUpperCase()} (Custom)`,
        symbol: customDstCode.toUpperCase(),
      }
      if (!allAssets.some((a) => a.code === newAsset.code && a.issuer === newAsset.issuer)) {
        setCustomAssets((prev) => [...prev, newAsset])
      }
      setDestAsset(newAsset)
      setIsCustomDest(false)
      setCustomDstCode("")
      setCustomDstIssuer("")
    }
  }

  const destMinAmount = destAmount ? (Number(destAmount) * (1 - slippage / 100)).toFixed(7) : "0"
  const exceedsBalance = Number(sourceAmount) > srcBalance
  const hasErrors = exceedsBalance || !accountExists || !destHasTrustline || !!pathError
  const canSwap = sourceAmount && destAmount && !pathLoading && !actionLoading && !hasErrors

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Swap Assets</h1>
          <p className="text-xs text-muted-foreground font-mono">Stellar Horizon Liquidity Pools &amp; Pathfinding Engine</p>
        </div>

        {!accountExists && (
          <Alert variant="default" className="border-amber-500/30 bg-amber-500/10 text-amber-500 rounded-2xl">
            <AlertTriangle className="size-4" />
            <AlertTitle>Account Not Initialized on {network.toUpperCase()}</AlertTitle>
            <AlertDescription>
              Your account does not exist on this network yet. Fund it using the Friendbot on the dashboard before swapping.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left 7 Columns: Execution Swapbox */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Swap Terminal</span>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-xl ${showSettings ? "bg-muted text-foreground" : ""}`}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="size-3.5" />
                <span>Slippage: {slippage}%</span>
              </Button>
            </div>

            {/* Slippage settings panel */}
            {showSettings && (
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/40 backdrop-blur space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-foreground">Slippage Tolerance</span>
                  <span className="font-mono text-xs font-semibold text-primary">{slippage}%</span>
                </div>
                <div className="flex gap-2">
                  {[0.5, 1.0, 2.0].map((val) => (
                    <Button
                      key={val}
                      variant={slippage === val ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs rounded-xl h-8"
                      onClick={() => setSlippage(val)}
                    >
                      {val}%
                    </Button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Transaction will revert if execution price changes unfavorably by more than {slippage}%.
                </p>
              </div>
            )}

            {/* SWAP FORM BODY */}
            <div className="space-y-3 relative">
              {/* SOURCE ASSET PANEL */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-2.5 focus-within:border-primary/50 transition-colors">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="font-semibold uppercase text-[10px] tracking-wider">Pay From</span>
                  <span className="font-mono text-[11px]">
                    Available: <span className="font-bold text-foreground">{srcBalance.toLocaleString(undefined, { maximumFractionDigits: 5 })} {sourceAsset.code}</span>
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <Select
                    value={isCustomSource ? "custom" : sourceAsset.code}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        setIsCustomSource(true)
                      } else {
                        setIsCustomSource(false)
                        const sel = allAssets.find((a) => a.code === val)
                        if (sel) setSourceAsset(sel)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[120px] sm:w-[140px] font-semibold border-border/60 rounded-xl h-11 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allAssets.map((a) => (
                        <SelectItem key={`${a.code}-${a.issuer}`} value={a.code}>
                          {a.symbol}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Token...</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={sourceAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, ".")
                        if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                          setSourceAmount(val)
                        }
                      }}
                      className="text-right font-mono font-bold text-lg border-0 bg-transparent pr-14 focus-visible:ring-0 h-11 pl-0 py-0"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-primary hover:bg-muted/60 h-7 px-2"
                      onClick={() => setSourceAmount(String(sourceAsset.code === "XLM" ? Math.max(0, srcBalance - 1) : srcBalance))}
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                {isCustomSource && (
                  <div className="pt-3 border-t border-border/40 space-y-2 animate-in fade-in duration-150">
                    <Input
                      placeholder="Custom Code (e.g. BTC)"
                      value={customSrcCode}
                      onChange={(e) => setCustomSrcCode(e.target.value)}
                      className="h-8 text-xs font-mono rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Issuer G..."
                        value={customSrcIssuer}
                        onChange={(e) => setCustomSrcIssuer(e.target.value)}
                        className="h-8 text-xs font-mono flex-1 rounded-lg"
                      />
                      <Button size="sm" className="h-8 text-xs rounded-lg" onClick={() => handleApplyCustomAsset("source")}>
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* FLIP ASSET BUTTON */}
              <div className="flex justify-center -my-2 relative z-10">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8 rounded-full border-border/80 bg-card hover:bg-muted shadow-md hover:scale-105 transition-transform cursor-pointer"
                  onClick={handleSwapAssets}
                  type="button"
                >
                  <RefreshCw className={`size-3.5 text-primary transition-transform duration-500 ${rotated ? "rotate-180" : ""}`} />
                </Button>
              </div>

              {/* DESTINATION ASSET PANEL */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-2.5 focus-within:border-primary/50 transition-colors">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="font-semibold uppercase text-[10px] tracking-wider">Receive To</span>
                  <span className="font-mono text-[11px]">
                    Balance: <span className="font-bold text-foreground">{destBalance.toLocaleString(undefined, { maximumFractionDigits: 5 })} {destAsset.code}</span>
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <Select
                    value={isCustomDest ? "custom" : destAsset.code}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        setIsCustomDest(true)
                      } else {
                        setIsCustomDest(false)
                        const sel = allAssets.find((a) => a.code === val)
                        if (sel) setDestAsset(sel)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[120px] sm:w-[140px] font-semibold border-border/60 rounded-xl h-11 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allAssets.map((a) => (
                        <SelectItem key={`${a.code}-${a.issuer}`} value={a.code}>
                          {a.symbol}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Token...</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex-1 flex items-center justify-end h-11">
                    {pathLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground mr-2" />
                    ) : destAmount ? (
                      <span className="font-mono font-bold text-lg text-foreground pr-2">
                        {Number(destAmount).toLocaleString(undefined, { maximumFractionDigits: 5 })}
                      </span>
                    ) : (
                      <span className="font-mono text-muted-foreground text-lg pr-2">-</span>
                    )}
                  </div>
                </div>

                {isCustomDest && (
                  <div className="pt-3 border-t border-border/40 space-y-2 animate-in fade-in duration-150">
                    <Input
                      placeholder="Custom Code (e.g. USDC)"
                      value={customDstCode}
                      onChange={(e) => setCustomDstCode(e.target.value)}
                      className="h-8 text-xs font-mono rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Issuer G..."
                        value={customDstIssuer}
                        onChange={(e) => setCustomDstIssuer(e.target.value)}
                        className="h-8 text-xs font-mono flex-1 rounded-lg"
                      />
                      <Button size="sm" className="h-8 text-xs rounded-lg" onClick={() => handleApplyCustomAsset("dest")}>
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TRUSTLINE NOTICE */}
            {accountExists && !destHasTrustline && (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <div className="flex gap-2 text-amber-500">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">Trustline Required for {destAsset.code}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Stellar requires establishing a trustline before your address can receive {destAsset.code}.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAddTrustline}
                  disabled={actionLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 rounded-xl gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Opening Trustline…
                    </>
                  ) : (
                    <>Open {destAsset.code} Trustline</>
                  )}
                </Button>
              </div>
            )}

            {exceedsBalance && (
              <p className="text-xs text-destructive text-center font-mono">
                Insufficient {sourceAsset.code} balance.
              </p>
            )}

            {pathError && (
              <p className="text-xs text-destructive text-center font-mono">
                {pathError}
              </p>
            )}

            {/* ACTION EXECUTION BUTTON */}
            <div className="pt-2">
              {destHasTrustline ? (
                <Button
                  onClick={handleExecuteSwap}
                  disabled={!canSwap}
                  className="w-full h-11 rounded-xl font-semibold text-sm gap-2 shadow-md focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Executing Horizon Swap…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4" />
                      Confirm &amp; Swap Assets
                    </>
                  )}
                </Button>
              ) : (
                <Button disabled className="w-full h-11 rounded-xl font-semibold text-sm">
                  Trustline Required
                </Button>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Liquidity Pathfinding & Rate Desk */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Liquidity Pathing</span>
              <span className="text-[10px] font-mono text-emerald-400">Horizon Node Synced</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Market Rate:</span>
                  <span className="font-mono font-medium text-foreground">
                    1 {sourceAsset.code} ≈ {rate?.toFixed(5) || "-"} {destAsset.code}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Guaranteed Minimum:</span>
                  <span className="font-mono font-medium text-emerald-400">{destMinAmount} {destAsset.code}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Slippage Limit:</span>
                  <span className="font-mono font-medium text-foreground">{slippage}%</span>
                </div>
              </div>

              {path.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Execution Route
                  </span>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] font-semibold text-primary">
                    <span className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{sourceAsset.code}</span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                    {path.map((p, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="bg-muted px-2 py-0.5 rounded-md border border-border">{p.code}</span>
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </span>
                    ))}
                    <span className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{destAsset.code}</span>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Automated Market Maker
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Stellar automatically discovers optimal liquidity paths across all active Order Books and AMM pools with zero intermediary spread.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Horizon SSE Streaming</span>
              <span className="text-emerald-500">Atomic Execution</span>
            </div>
          </div>
        </div>
      </div>

      {/* SWAP SUCCESS DIALOG */}
      <Dialog open={!!txHash} onOpenChange={() => setTxHash(null)}>
        <DialogContent className="sm:max-w-md bg-background border-border shadow-2xl">
          <div className="flex flex-col items-center gap-4 py-4 text-center w-full min-w-0">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success animate-bounce">
              <CheckCircle2 className="size-8" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Assets Swapped Successfully!
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Swapped {Number(sourceAmount).toLocaleString()} {sourceAsset.code} for approx. {Number(destAmount).toLocaleString()} {destAsset.code}
              </p>
            </div>
            
            <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3 mt-2 overflow-hidden">
              <span className="block flex-1 min-w-0 truncate font-mono text-xs text-muted-foreground text-left">{txHash}</span>
              <CopyButton value={txHash || ""} label="Hash copied" className="size-7 shrink-0" />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row mt-2">
              <Button asChild variant="outline" className="flex-1 gap-2 bg-transparent text-sm">
                <a href={stellarExpertUrl(txHash || "", network)} target="_blank" rel="noreferrer">
                  View on Stellar Expert
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button className="flex-1 text-sm font-semibold" onClick={() => { setTxHash(null); setSourceAmount("") }}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
