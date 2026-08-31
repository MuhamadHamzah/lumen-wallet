"use client"

import { useState, useEffect } from "react"
import { WifiOff, RefreshCw } from "lucide-react"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    if (!navigator.onLine) {
      setIsOffline(true)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-400 px-4 py-2 text-xs font-mono flex items-center justify-between sticky top-0 z-50 backdrop-blur-md animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2 mx-auto">
        <WifiOff className="size-4 animate-pulse text-amber-400" />
        <span>You are currently in Offline Mode. Cached assets are active; Stellar RPC sync paused.</span>
      </div>
    </div>
  )
}
