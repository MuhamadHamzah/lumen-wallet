// Client-side helpers for the custom token (Soroban) feature.
//
// As with the XLM wallet, all network + signing work is delegated to server
// routes in app/api/token/*. The secret key is only sent to the server when a
// state-changing call (transfer / mint) needs to be signed.
//
// Amounts on-chain are integers in "base units". A balance of 1000000000 on a
// token with 7 decimals means 100.0 tokens. The helpers below convert between
// the human value shown in the UI and the base units the contract expects.

export interface TokenInfo {
  contractId: string
  name: string
  symbol: string
  decimals: number
  /** Raw on-chain balance in base units (stringified bigint). */
  balance: string
  /** Admin public key (G...) if the contract exposes one. */
  admin: string | null
  /** True when the connected wallet is the token admin (can mint). */
  isAdmin: boolean
}

const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet").toLowerCase()
const IS_MAINNET = NETWORK === "mainnet" || NETWORK === "public"

/** Validate a Soroban contract id (C..., 56 chars, base32). */
export function isValidContractId(id: string): boolean {
  return /^C[A-Z2-7]{55}$/.test(id.trim())
}

/** Convert a human amount string ("12.5") to base units given decimals. */
export function toBaseUnits(amount: string, decimals: number): bigint {
  const trimmed = amount.trim()
  if (!trimmed) return 0n
  const negative = trimmed.startsWith("-")
  const unsigned = negative ? trimmed.slice(1) : trimmed
  const [whole = "0", frac = ""] = unsigned.split(".")
  const paddedFrac = (frac + "0".repeat(decimals)).slice(0, decimals)
  const combined = `${whole}${paddedFrac}`.replace(/^0+(?=\d)/, "")
  const value = BigInt(combined || "0")
  return negative ? -value : value
}

/** Convert base units back to a human-readable decimal string. */
export function fromBaseUnits(raw: string, decimals: number): string {
  const negative = raw.startsWith("-")
  const digits = (negative ? raw.slice(1) : raw).padStart(decimals + 1, "0")
  const cut = digits.length - decimals
  const whole = digits.slice(0, cut) || "0"
  const frac = decimals > 0 ? digits.slice(cut).replace(/0+$/, "") : ""
  const out = frac ? `${whole}.${frac}` : whole
  return negative ? `-${out}` : out
}

/** Format base units for display, grouped with thousands separators. */
export function formatTokenAmount(raw: string, decimals: number): string {
  const human = fromBaseUnits(raw, decimals)
  const n = Number(human)
  if (!Number.isFinite(n)) return human
  return n.toLocaleString(undefined, { maximumFractionDigits: Math.min(decimals, 7) })
}

export function stellarExpertContractUrl(contractId: string, network = "testnet"): string {
  const isMainnet = network === "mainnet" || network === "public"
  const net = isMainnet ? "public" : "testnet"
  return `https://stellar.expert/explorer/${net}/contract/${contractId}`
}

export function stellarExpertTxUrl(hash: string, network = "testnet"): string {
  const isMainnet = network === "mainnet" || network === "public"
  const net = isMainnet ? "public" : "testnet"
  return `https://stellar.expert/explorer/${net}/tx/${hash}`
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    return data?.error ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

/** Read token metadata + the given address's balance from the contract. */
export async function getTokenInfo(contractId: string, address: string, network = "testnet"): Promise<TokenInfo> {
  const res = await fetch(
    `/api/token/info?contract=${encodeURIComponent(contractId)}&address=${encodeURIComponent(address)}&network=${network}`,
  )
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as TokenInfo
}

/** Transfer tokens from the connected wallet to another address. */
export async function transferToken(
  secret: string,
  contractId: string,
  to: string,
  amount: string,
  network = "testnet",
): Promise<{ hash: string }> {
  const res = await fetch("/api/token/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, contract: contractId, to, amount, network }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as { hash: string }
}

/** Mint new tokens (admin only) to a destination address. */
export async function mintToken(
  secret: string,
  contractId: string,
  to: string,
  amount: string,
  network = "testnet",
): Promise<{ hash: string }> {
  const res = await fetch("/api/token/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, contract: contractId, to, amount, network }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return (await res.json()) as { hash: string }
}
