"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, ChevronDown, Check } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

export function NetworkSwitcher() {
  const { network, setNetwork } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-card/90 transition-all duration-300 text-xs font-medium shadow-sm hover-lift glass cursor-pointer"
        aria-label="Select stellar network"
      >
        <Globe className={`size-3.5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
        <span className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${network === "mainnet" ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
          <span className="hidden sm:inline">
            {network === "mainnet" ? "Stellar Mainnet" : "Stellar Testnet"}
          </span>
        </span>
        <ChevronDown className={`size-3 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""} hidden sm:block`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl z-50 py-1.5 animate-scale-in origin-top-right">
          <button
            onClick={() => {
              setNetwork("mainnet")
              setIsOpen(false)
            }}
            className="flex w-full items-center justify-between px-4 py-2 text-left text-xs font-medium hover:bg-primary/10 transition-colors duration-200"
          >
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500" />
              Stellar Mainnet
            </span>
            {network === "mainnet" && <Check className="size-3.5 text-primary" />}
          </button>
          <button
            onClick={() => {
              setNetwork("testnet")
              setIsOpen(false)
            }}
            className="flex w-full items-center justify-between px-4 py-2 text-left text-xs font-medium hover:bg-primary/10 transition-colors duration-200"
          >
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" />
              Stellar Testnet
            </span>
            {network === "testnet" && <Check className="size-3.5 text-primary" />}
          </button>
        </div>
      )}
    </div>
  )
}
