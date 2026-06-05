// Client-side Stellar helpers.
//
// Network operations (balance, history, payments, funding) are delegated to
// server-side API routes in app/api/* so that secret keys are only ever
// handled on the server when signing. Keypair creation / derivation happens
// locally in the browser via a lazily-loaded SDK so a freshly generated
// secret never touches the network until the user chooses to send.

export type TxType = "sent" | "received"
export type TxStatus = "success" | "pending" | "failed"

export interface StellarTransaction {
  id: string
  hash: string
  type: TxType
  amount: string // XLM, e.g. "120.5000000"
  counterparty: string // public key of the other party
  date: string // ISO string
  status: TxStatus
  memo?: string
}

export interface Keypair {
  publicKey: string
  secretKey: string
}

const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet").toLowerCase()
const IS_MAINNET = NETWORK === "mainnet" || NETWORK === "public"

// Base network fee for a single operation: 100 stroops = 0.00001 XLM.
const FEE_XLM = "0.00001"

export function getFeeEstimate(): string {
  return FEE_XLM
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    return data?.error ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

/** Fetch the real native XLM balance from Horizon (via the server route). */
export async function getBalance(publicKey: string, network = "testnet"): Promise<string> {
  const res = await fetch(`/api/balance?address=${encodeURIComponent(publicKey)}&network=${network}`)
  if (!res.ok) throw new Error(await readError(res))
  const { balance } = (await res.json()) as { balance: string }
  return formatBalance(balance)
}

/** Fetch real transaction history from Horizon (via the server route). */
export async function getTransactions(publicKey: string, network = "testnet"): Promise<StellarTransaction[]> {
  const res = await fetch(`/api/transactions?address=${encodeURIComponent(publicKey)}&network=${network}`)
  if (!res.ok) throw new Error(await readError(res))
  const { transactions } = (await res.json()) as { transactions: StellarTransaction[] }
  return transactions
}

/** Sign & submit a real payment. The secret is sent to the server route only for signing. */
export async function sendPayment(
  secret: string,
  destination: string,
  amount: string,
  memo?: string,
  network = "testnet",
): Promise<{ hash: string }> {
  const res = await fetch("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, destination, amount, memo, network }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as { hash: string }
}

/** Fund an account on testnet using Friendbot (via the server route). */
export async function fundAccount(publicKey: string, network = "testnet"): Promise<{ hash: string }> {
  const res = await fetch(`/api/fund?address=${encodeURIComponent(publicKey)}&network=${network}`)
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as { hash: string }
}

/** Generate a real Ed25519 Stellar keypair locally in the browser. */
export async function generateKeypair(): Promise<Keypair> {
  const { Keypair } = await import("@stellar/stellar-sdk")
  const kp = Keypair.random()
  return { publicKey: kp.publicKey(), secretKey: kp.secret() }
}

/** Derive the real public key from a secret key locally in the browser. */
export async function publicFromSecret(secret: string): Promise<string> {
  const { Keypair } = await import("@stellar/stellar-sdk")
  return Keypair.fromSecret(secret.trim()).publicKey()
}

/** Validate a Stellar secret key (S..., 56 chars, base32). */
export function isValidSecret(secret: string): boolean {
  return /^S[A-Z2-7]{55}$/.test(secret.trim())
}

/** Validate a Stellar public key (G..., 56 chars, base32). */
export function isValidPublic(key: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(key.trim())
}

/** Format a raw balance string into a friendly display value. */
export function formatBalance(raw: string): string {
  const n = Number(raw)
  if (!Number.isFinite(n)) return "0"
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function truncate(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail) return address
  return `${address.slice(0, lead)}...${address.slice(-tail)}`
}

export function stellarExpertUrl(hash: string, network = "testnet"): string {
  const isMainnet = network === "mainnet" || network === "public"
  const net = isMainnet ? "public" : "testnet"
  return `https://stellar.expert/explorer/${net}/tx/${hash}`
}

export interface SwapPathResult {
  pathExists: boolean
  sourceAmount: string
  destinationAmount: string
  path: Array<{ code: string; issuer: string }>
  rate: number
  error?: string
}

export async function getSwapPath(
  sourceCode: string,
  sourceIssuer: string,
  destCode: string,
  destIssuer: string,
  amount: string,
  network = "testnet"
): Promise<SwapPathResult> {
  const res = await fetch(
    `/api/swap/path?sourceAssetCode=${encodeURIComponent(sourceCode)}&sourceAssetIssuer=${encodeURIComponent(
      sourceIssuer
    )}&destAssetCode=${encodeURIComponent(destCode)}&destAssetIssuer=${encodeURIComponent(
      destIssuer
    )}&amount=${encodeURIComponent(amount)}&network=${network}`
  )
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as SwapPathResult
}

export interface ExecuteSwapArgs {
  secret?: string
  sender?: string
  signedXdr?: string
  sourceAssetCode: string
  sourceAssetIssuer: string
  destAssetCode: string
  destAssetIssuer: string
  amount: string
  destMinAmount: string
  path: Array<{ code: string; issuer: string }>
  network?: string
}

export async function executeSwap(args: ExecuteSwapArgs): Promise<{ hash?: string; unsignedTxXdr?: string }> {
  const res = await fetch("/api/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(await readError(res))
  return await res.json()
}

export interface CreateTrustlineArgs {
  secret?: string
  sender?: string
  signedXdr?: string
  assetCode: string
  assetIssuer: string
  network?: string
}

export async function createTrustline(args: CreateTrustlineArgs): Promise<{ hash?: string; unsignedTxXdr?: string }> {
  const res = await fetch("/api/trustline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(await readError(res))
  return await res.json()
}

