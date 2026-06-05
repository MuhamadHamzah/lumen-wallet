export interface MultisigProposal {
  id: string
  title: string
  description: string
  creator: string
  xdr: string // The current transaction XDR (partially signed)
  network: "testnet" | "mainnet"
  targetAccount: string // The multisig account being operated on
  signersWhoSigned: string[] // List of public keys that have signed
  currentWeight: number
  targetWeight: number
  thresholdType: "low" | "medium" | "high"
  status: "pending" | "executed" | "failed"
  createdAt: string
  executedAt?: string
  txHash?: string
}

export interface AccountDetails {
  id: string
  balances: { balance: string; asset_type: string; asset_code?: string; asset_issuer?: string }[]
  thresholds: { low_threshold: number; med_threshold: number; high_threshold: number }
  signers: { key: string; weight: number; type: string }[]
}

/** Fetch full account info (including signers & thresholds) from the balance route. */
export async function getAccountDetails(address: string, network = "testnet"): Promise<AccountDetails | null> {
  const res = await fetch(`/api/account?address=${encodeURIComponent(address)}&network=${network}`)
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to fetch account info (${res.status})`)
  }
  return res.json() as Promise<AccountDetails>
}

/** Fetch multisig transaction proposals. */
export async function getProposals(targetAccount: string, network = "testnet"): Promise<MultisigProposal[]> {
  const res = await fetch(`/api/multisig/proposals?account=${encodeURIComponent(targetAccount)}&network=${network}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch proposals")
  }
  const { proposals } = (await res.json()) as { proposals: MultisigProposal[] }
  return proposals
}

/** Create a new multisig transaction proposal. */
export async function createProposal(
  proposal: Omit<MultisigProposal, "id" | "currentWeight" | "signersWhoSigned" | "status" | "createdAt">
): Promise<MultisigProposal> {
  const res = await fetch("/api/multisig/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", proposal }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create proposal")
  }
  return res.json() as Promise<MultisigProposal>
}

/** Add a signer signature to a proposal and update the XDR. */
export async function signProposal(
  id: string,
  signer: string,
  signedXdr: string,
  newWeight: number
): Promise<MultisigProposal> {
  const res = await fetch("/api/multisig/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sign", id, signer, signedXdr, newWeight }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to sign proposal")
  }
  return res.json() as Promise<MultisigProposal>
}

/** Mark a proposal as executed after it has been broadcasted. */
export async function executeProposal(id: string, txHash: string): Promise<MultisigProposal> {
  const res = await fetch("/api/multisig/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "execute", id, txHash }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to execute proposal")
  }
  return res.json() as Promise<MultisigProposal>
}
