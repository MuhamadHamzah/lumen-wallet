/**
 * Client-side Fee Sponsorship & Gasless Transaction Utilities
 * Handles communication with the Lumen Relayer for Stellar Fee Bump transactions.
 */

export interface SponsoredTxResponse {
  success: boolean
  txHash?: string
  feeBumpXdr?: string
  error?: string
  feeSponsoredStroops?: number
  network?: string
}

export interface SponsorStatusResponse {
  enabled: boolean
  sponsorAddress: string
  maxFeeStroops: number
  gaslessAvailable: boolean
}

/**
 * Request the server relayer to sponsor the fee for an inner transaction XDR
 */
export async function sponsorAndSubmitTransaction(
  innerTxXdr: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<SponsoredTxResponse> {
  try {
    const response = await fetch("/api/sponsor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ innerTxXdr, network }),
    })

    const data = await response.json()
    if (!response.ok) {
      return {
        success: false,
        error: data.error ?? "Failed to sponsor transaction with relayer",
      }
    }

    return {
      success: true,
      txHash: data.txHash,
      feeBumpXdr: data.feeBumpXdr,
      feeSponsoredStroops: data.feeSponsoredStroops,
      network: data.network,
    }
  } catch (error) {
    console.error("[Sponsorship] Relayer request failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error contacting sponsor relayer",
    }
  }
}

/**
 * Check if the gasless relayer service is online and available
 */
export async function checkSponsorStatus(network: "testnet" | "mainnet" = "testnet"): Promise<SponsorStatusResponse> {
  try {
    const res = await fetch(/api/sponsor?network=)
    if (!res.ok) throw new Error("Status check failed")
    return await res.json()
  } catch (e) {
    return {
      enabled: false,
      sponsorAddress: "",
      maxFeeStroops: 0,
      gaslessAvailable: false,
    }
  }
}
