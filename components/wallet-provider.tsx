"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface WalletState {
  publicKey: string | null
  secretKey: string | null
  isConnected: boolean
  isInitialized: boolean
  walletType: "freighter" | "walletconnect" | "manual" | null
  network: "testnet" | "mainnet"
  setWallet: (keys: { publicKey: string; secretKey: string }, walletType?: "freighter" | "walletconnect" | "manual") => void
  setNetwork: (network: "testnet" | "mainnet") => void
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  // Wallet credentials persisted to localStorage.
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<"freighter" | "walletconnect" | "manual" | null>(null)
  const [network, setNetworkState] = useState<"testnet" | "mainnet">("testnet")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load network and wallet from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lumen_network")
      if (saved === "mainnet" || saved === "testnet") {
        setNetworkState(saved)
      }

      const savedPublicKey = localStorage.getItem("lumen_publicKey")
      const savedSecretKey = localStorage.getItem("lumen_secretKey")
      const savedWalletType = localStorage.getItem("lumen_walletType")

      if (savedPublicKey && savedSecretKey) {
        setPublicKey(savedPublicKey)
        setSecretKey(savedSecretKey)
        if (savedWalletType === "freighter" || savedWalletType === "walletconnect" || savedWalletType === "manual") {
          setWalletType(savedWalletType)
        }
      }
      setIsInitialized(true)
    }
  }, [])

  const setWallet = useCallback((keys: { publicKey: string; secretKey: string }, type: "freighter" | "walletconnect" | "manual" = "manual") => {
    setPublicKey(keys.publicKey)
    setSecretKey(keys.secretKey)
    setWalletType(type)
    if (typeof window !== "undefined") {
      localStorage.setItem("lumen_publicKey", keys.publicKey)
      localStorage.setItem("lumen_secretKey", keys.secretKey)
      localStorage.setItem("lumen_walletType", type)
    }
  }, [])

  const setNetwork = useCallback((net: "testnet" | "mainnet") => {
    setNetworkState(net)
    if (typeof window !== "undefined") {
      localStorage.setItem("lumen_network", net)
    }
  }, [])

  const disconnect = useCallback(() => {
    setPublicKey(null)
    setSecretKey(null)
    setWalletType(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("lumen_publicKey")
      localStorage.removeItem("lumen_secretKey")
      localStorage.removeItem("lumen_walletType")
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        secretKey,
        isConnected: Boolean(publicKey),
        isInitialized,
        walletType,
        network,
        setWallet,
        setNetwork,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider")
  return ctx
}

