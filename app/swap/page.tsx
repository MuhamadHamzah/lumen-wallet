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
      if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
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

        // Sign with Freighter
        const freighterApi = await import("@stellar/freighter-api")
        const networkPassphrase = network === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        
        const signedResult = await freighterApi.signTransaction(unsignedTxXdr, { networkPassphrase })
        const signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr

        if (!signedXdr) throw new Error("Transaction signature rejected by user.")

        // Submit back
        const submitRes = await fetch("/api/trustline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr, network }),
        })
        if (!submitRes.ok) {
          const errData = await submitRes.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to submit trustline transaction.")
        }
      } else {
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

    try {
      if (walletType === "freighter" || secretKey.startsWith("freighter:")) {
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

        // 2. Sign with Freighter
        const freighterApi = await import("@stellar/freighter-api")
        const networkPassphrase = network === "mainnet"
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
        
        const signedResult = await freighterApi.signTransaction(unsignedTxXdr, { networkPassphrase })
        const signedXdr = typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr

        if (!signedXdr) throw new Error("Transaction signature rejected by user.")

        // 3. Submit
        const submitRes = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr, network }),
        })
        if (!submitRes.ok) {
          const errData = await submitRes.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to submit swap transaction.")
        }
        const { hash } = await submitRes.json()
        setTxHash(hash)
      } else {
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
        }
      }

      toast.dismiss(loadingToast)
      toast.success("Assets swapped successfully!")
      
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
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Swap Assets</h1>
          <p className="text-sm text-muted-foreground">Exchange assets instantly using native Stellar Liquidity Pools</p>
        </div>

        {!accountExists && (
          <Alert variant="warning" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
            <AlertTriangle className="size-4" />
            <AlertTitle>Account Not Found</AlertTitle>
            <AlertDescription>
              Your account does not exist on this network yet. Fund it first using the Friendbot on the dashboard before swapping.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border border-border/50 bg-gradient-to-b from-card to-card/90 backdrop-blur p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Swap Interface</h2>
            <Button
              variant="ghost"
              size="icon"
              className={`text-muted-foreground hover:text-foreground shrink-0 transition-colors ${showSettings ? "bg-muted" : ""}`}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="size-5" />
            </Button>
          </div>

          {/* Slippage settings panel */}
          {showSettings && (
            <div className="mb-6 p-4 rounded-xl border border-border/40 bg-muted/40 backdrop-blur space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">Slippage Tolerance</span>
                <span className="font-mono text-xs font-semibold text-primary">{slippage}%</span>
              </div>
              <div className="flex gap-2">
                {[0.5, 1.0, 2.0].map((val) => (
                  <Button
                    key={val}
                    variant={slippage === val ? "default" : "outline"}
                    size="sm"
                    className="flex-1 bg-transparent hover:bg-muted text-xs"
                    onClick={() => setSlippage(val)}
                  >
                    {val}%
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your transaction will revert if the price changes unfavorably by more than this percentage during execution.
              </p>
            </div>
          )}

          {/* SWAP CARD BODY */}
          <div className="flex flex-col relative">
            {/* SOURCE PANEL */}
            <div className="rounded-xl border border-border/30 bg-muted/30 p-4 space-y-3 focus-within:border-primary/40 transition-colors">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>From (Send)</span>
                <span className="flex items-center gap-1">
                  Balance: <span className="font-mono text-foreground font-semibold">{srcBalance.toLocaleString(undefined, { maximumFractionDigits: 5 })} {sourceAsset.code}</span>
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
                  <SelectTrigger className="w-[110px] sm:w-[140px] bg-background/50 font-semibold border-border/40 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAssets.map((a) => (
                      <SelectItem key={`${a.code}-${a.issuer}`} value={a.code}>
                        {a.symbol}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
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
                    className="text-right font-mono font-semibold text-lg border-0 bg-transparent pr-14 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 pl-0 py-0"
                  />
                  {sourceAsset.code === "XLM" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] h-6 px-1.5 font-bold hover:bg-muted text-primary cursor-pointer"
                      onClick={() => setSourceAmount(String(Math.max(0, srcBalance - 1)))}
                    >
                      MAX
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] h-6 px-1.5 font-bold hover:bg-muted text-primary cursor-pointer"
                      onClick={() => setSourceAmount(String(srcBalance))}
                    >
                      MAX
                    </Button>
                  )}
                </div>
              </div>

              {/* Custom Source Asset input fields */}
              {isCustomSource && (
                <div className="pt-3 border-t border-border/20 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-semibold">Custom Asset Code</Label>
                    <Input
                      placeholder="e.g. BTC"
                      value={customSrcCode}
                      onChange={(e) => setCustomSrcCode(e.target.value)}
                      className="h-8 text-xs font-mono bg-background/50 border-border/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-semibold">Issuer Public Key</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="G..."
                        value={customSrcIssuer}
                        onChange={(e) => setCustomSrcIssuer(e.target.value)}
                        className="h-8 text-xs font-mono flex-1 bg-background/50 border-border/40"
                      />
                      <Button size="sm" className="h-8 text-xs shrink-0 font-semibold" onClick={() => handleApplyCustomAsset("source")}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SWITCH SWAP DIRECTION BUTTON */}
            <div className="relative h-2 flex justify-center z-10">
              <Button
                size="icon"
                variant="outline"
                className="absolute -top-3 size-8 rounded-full border border-border/60 bg-card hover:bg-muted shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                onClick={handleSwapAssets}
                type="button"
              >
                <RefreshCw className={`size-3.5 text-primary transition-transform duration-500 ${rotated ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* DESTINATION PANEL */}
            <div className="rounded-xl border border-border/30 bg-muted/30 p-4 space-y-3 focus-within:border-primary/40 transition-colors mt-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>To (Receive)</span>
                <span className="flex items-center gap-1">
                  Balance: <span className="font-mono text-foreground font-semibold">{destBalance.toLocaleString(undefined, { maximumFractionDigits: 5 })} {destAsset.code}</span>
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
                  <SelectTrigger className="w-[110px] sm:w-[140px] bg-background/50 font-semibold border-border/40 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAssets.map((a) => (
                      <SelectItem key={`${a.code}-${a.issuer}`} value={a.code}>
                        {a.symbol}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1 flex items-center justify-end h-10">
                  {pathLoading ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground mr-2" />
                  ) : destAmount ? (
                    <span className="font-mono font-semibold text-lg text-foreground pr-2">
                      {Number(destAmount).toLocaleString(undefined, { maximumFractionDigits: 5 })}
                    </span>
                  ) : (
                    <span className="font-mono text-muted-foreground text-lg pr-2">-</span>
                  )}
                </div>
              </div>

              {/* Custom Destination Asset input fields */}
              {isCustomDest && (
                <div className="pt-3 border-t border-border/20 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-semibold">Custom Asset Code</Label>
                    <Input
                      placeholder="e.g. USDC"
                      value={customDstCode}
                      onChange={(e) => setCustomDstCode(e.target.value)}
                      className="h-8 text-xs font-mono bg-background/50 border-border/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-semibold">Issuer Public Key</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="G..."
                        value={customDstIssuer}
                        onChange={(e) => setCustomDstIssuer(e.target.value)}
                        className="h-8 text-xs font-mono flex-1 bg-background/50 border-border/40"
                      />
                      <Button size="sm" className="h-8 text-xs shrink-0 font-semibold" onClick={() => handleApplyCustomAsset("dest")}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MISSING TRUSTLINE WARNING */}
          {accountExists && !destHasTrustline && (
            <div className="mt-5 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <div className="flex gap-2 text-amber-500">
                <AlertTriangle className="size-5 shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Trustline Required</p>
                  <p className="text-muted-foreground">
                    You must establish a trustline for **{destAsset.code}** to hold this asset. This requires keeping a small amount of XLM (0.5 XLM) as reserve on your account.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAddTrustline}
                disabled={actionLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-2 gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Opening Trustline...
                  </>
                ) : (
                  <>Open {destAsset.code} Trustline</>
                )}
              </Button>
            </div>
          )}

          {/* PATHFINDING DETAIL VIEW */}
          {destAmount && (
            <div className="mt-5 p-4 rounded-xl border border-border/40 bg-muted/20 text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-mono font-semibold">
                  1 {sourceAsset.code} ≈ {rate?.toFixed(5)} {destAsset.code}
                </span>
              </div>
              
              {path.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Swap Route</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-primary uppercase bg-primary/10 rounded px-2 py-0.5">
                    {sourceAsset.code}
                    <ChevronRight className="size-3 text-muted-foreground" />
                    {path.map((p, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        {p.code}
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </span>
                    ))}
                    {destAsset.code}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-border/20 pt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  Minimum Received
                  <Info className="size-3" />
                </span>
                <span className="font-mono text-foreground">
                  {destMinAmount} {destAsset.code}
                </span>
              </div>
            </div>
          )}

          {/* WARNING AND ERRORS IN PAGE FORM */}
          {exceedsBalance && (
            <p className="text-xs text-destructive text-center mt-4 font-medium animate-pulse">
              Insufficient {sourceAsset.code} balance to execute this swap.
            </p>
          )}

          {pathError && (
            <p className="text-xs text-destructive text-center mt-4 font-medium">
              {pathError}
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <div className="mt-6">
            {destHasTrustline ? (
              <Button
                onClick={handleExecuteSwap}
                disabled={!canSwap}
                className="w-full gap-2 font-semibold text-sm h-11"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Swapping assets...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Confirm &amp; Swap
                  </>
                )}
              </Button>
            ) : (
              <Button disabled className="w-full font-semibold text-sm h-11">
                Trustline Required
              </Button>
            )}
          </div>
        </Card>
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
