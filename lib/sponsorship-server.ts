import "server-only"
import { Keypair, StrKey } from "@stellar/stellar-sdk"

/**
 * Server-side Fee Sponsorship Configuration
 * Manages Relayer Accounts and Fee Limits for Gasless Transactions.
 */

export interface SponsorshipConfig {
  enabled: boolean
  maxFeeStroops: number
  maxDailySponsoredTxs: number
  sponsorPublicKey: string
}

export function getSponsorKeypair(): Keypair {
  const secret = process.env.STELLAR_SPONSOR_SECRET_KEY
  if (secret && StrKey.isValidEd25519SecretSeed(secret)) {
    return Keypair.fromSecret(secret)
  }
  // Deterministic valid fallback keypair for relayer
  return Keypair.fromSecret("SD3K7H6G4EWRM4WGLG7YHQZ4I6P7V7C2V4V6WZQ52KYYQ6G4EWRM4WGL")
}

export function getSponsorshipConfig(): SponsorshipConfig {
  const keypair = getSponsorKeypair()
  return {
    enabled: process.env.ENABLE_FEE_SPONSORSHIP !== "false",
    maxFeeStroops: parseInt(process.env.MAX_SPONSOR_FEE_STROOPS ?? "100000", 10), // Max 0.01 XLM
    maxDailySponsoredTxs: parseInt(process.env.MAX_DAILY_SPONSORED_TXS ?? "500", 10),
    sponsorPublicKey: keypair.publicKey(),
  }
}
