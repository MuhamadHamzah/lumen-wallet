import "server-only"

import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  Networks,
  BASE_FEE,
  StrKey,
} from "@stellar/stellar-sdk"

import type { StellarTransaction, TxStatus, TxType } from "@/lib/stellar"

/**
 * Server-only Stellar helpers. These run inside API routes and are the ONLY
 * place secret keys are ever handled. Nothing here is shipped to the client.
 */

const RAW_NETWORK = (process.env.STELLAR_NETWORK ?? "testnet").toLowerCase()
export const IS_MAINNET = RAW_NETWORK === "mainnet" || RAW_NETWORK === "public"

export function getHorizonUrl(network?: string): string {
  const isMainnet = network
    ? (network.toLowerCase() === "mainnet" || network.toLowerCase() === "public")
    : IS_MAINNET
  return isMainnet ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org"
}

export function getNetworkPassphrase(network?: string): string {
  const isMainnet = network
    ? (network.toLowerCase() === "mainnet" || network.toLowerCase() === "public")
    : IS_MAINNET
  return isMainnet ? Networks.PUBLIC : Networks.TESTNET
}

const FRIENDBOT_URL = "https://friendbot.stellar.org"

export function getServer(network?: string) {
  return new Horizon.Server(getHorizonUrl(network))
}

export function isValidPublicKey(key: string): boolean {
  return StrKey.isValidEd25519PublicKey(key)
}

export function isValidSecretKey(secret: string): boolean {
  return StrKey.isValidEd25519SecretSeed(secret)
}

/** True when Horizon returns a 404 (account does not exist / not yet funded). */
function isNotFound(error: unknown): boolean {
  const e = error as { response?: { status?: number } }
  return e?.response?.status === 404
}

/**
 * Convert a Horizon error into a human-readable message, surfacing the
 * transaction result codes when available.
 */
export function describeStellarError(error: unknown): string {
  const e = error as {
    response?: { data?: { extras?: { result_codes?: { transaction?: string; operations?: string[] } } } }
    message?: string
  }
  const codes = e?.response?.data?.extras?.result_codes
  if (codes) {
    const op = codes.operations?.filter(Boolean).join(", ")
    if (op) {
      if (op.includes("op_no_destination")) return "Destination account does not exist on this network."
      if (op.includes("op_underfunded")) return "Insufficient balance to complete this payment."
      if (op.includes("op_low_reserve")) return "Amount is below the minimum account reserve."
      return `Transaction failed: ${op}`
    }
    if (codes.transaction) {
      if (codes.transaction === "tx_insufficient_balance") return "Insufficient balance to cover the amount plus network fee."
      if (codes.transaction === "tx_bad_seq") return "Transaction sequence error. Please retry."
      return `Transaction failed: ${codes.transaction}`
    }
  }
  return e?.message ?? "An unknown network error occurred."
}

/** Fetch the native XLM balance. Returns "0" for unfunded accounts. */
export async function fetchBalance(publicKey: string, network?: string): Promise<string> {
  const server = getServer(network)
  try {
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find((b) => b.asset_type === "native")
    return native ? native.balance : "0"
  } catch (error) {
    if (isNotFound(error)) return "0"
    throw error
  }
}

/** Fetch full account details including signers and thresholds. */
export async function fetchAccountDetails(publicKey: string, network?: string) {
  const server = getServer(network)
  try {
    const account = await server.loadAccount(publicKey)
    return {
      id: account.id,
      balances: account.balances,
      thresholds: account.thresholds,
      signers: account.signers,
    }
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

/** Fetch recent payment / create_account activity, newest first. */
export async function fetchTransactions(publicKey: string, limit = 50, network?: string): Promise<StellarTransaction[]> {
  const server = getServer(network)
  try {
    const page = await server.payments().forAccount(publicKey).order("desc").limit(limit).call()

    const records = page.records.filter(
      (r) => r.type === "payment" || r.type === "create_account",
    )

    return records.map((r): StellarTransaction => {
      // Operation records expose whether the parent tx succeeded.
      const successful = (r as unknown as { transaction_successful?: boolean }).transaction_successful
      const status: TxStatus = successful === false ? "failed" : "success"

      if (r.type === "create_account") {
        const rec = r as unknown as { funder: string; account: string; starting_balance: string }
        const received = rec.account === publicKey
        const type: TxType = received ? "received" : "sent"
        return {
          id: r.id,
          hash: r.transaction_hash,
          type,
          amount: rec.starting_balance,
          counterparty: received ? rec.funder : rec.account,
          date: r.created_at,
          status,
        }
      }

      const rec = r as unknown as { from: string; to: string; amount: string; asset_type: string }
      const received = rec.to === publicKey
      const type: TxType = received ? "received" : "sent"
      return {
        id: r.id,
        hash: r.transaction_hash,
        type,
        // Non-native assets are still listed but the UI is XLM-first.
        amount: rec.amount,
        counterparty: received ? rec.from : rec.to,
        date: r.created_at,
        status,
      }
    })
  } catch (error) {
    if (isNotFound(error)) return []
    throw error
  }
}

interface SubmitPaymentArgs {
  secret: string
  destination: string
  amount: string
  memo?: string
  network?: string
}

/**
 * Build, sign, and submit a native XLM payment. If the destination account
 * does not yet exist, a create_account operation is used instead so the
 * payment still succeeds (the amount must meet the base reserve).
 */
export async function submitPayment({ secret, destination, amount, memo, network }: SubmitPaymentArgs): Promise<{ hash: string }> {
  const server = getServer(network)
  const source = Keypair.fromSecret(secret)

  let account
  try {
    account = await server.loadAccount(source.publicKey())
  } catch (error) {
    if (isNotFound(error)) {
      const net = network || (IS_MAINNET ? "mainnet" : "testnet")
      throw new Error(`Your account does not exist on ${net}. Please fund it first.`)
    }
    throw error
  }

  // Determine whether the destination needs to be created.
  let destinationExists = true
  try {
    await server.loadAccount(destination)
  } catch (error) {
    if (isNotFound(error)) destinationExists = false
    else throw error
  }

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(network),
  })

  if (destinationExists) {
    builder.addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      }),
    )
  } else {
    builder.addOperation(
      Operation.createAccount({
        destination,
        startingBalance: amount,
      }),
    )
  }

  if (memo && memo.trim().length > 0) {
    builder.addMemo(Memo.text(memo.trim().slice(0, 28)))
  }

  const tx = builder.setTimeout(60).build()
  tx.sign(source)

  const result = await server.submitTransaction(tx)
  return { hash: result.hash }
}

/** Fund an account on testnet using Friendbot. Disabled on mainnet. */
export async function fundAccount(publicKey: string, network?: string): Promise<{ hash: string }> {
  const isMainnet = network
    ? (network.toLowerCase() === "mainnet" || network.toLowerCase() === "public")
    : IS_MAINNET
  if (isMainnet) {
    throw new Error("Friendbot funding is only available on testnet.")
  }
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`)
  const data = (await res.json()) as { hash?: string; detail?: string; status?: number }
  if (!res.ok) {
    throw new Error(data?.detail || "Friendbot funding failed. The account may already be funded.")
  }
  return { hash: data.hash ?? "" }
}

/** Build an unsigned payment transaction XDR (base64) for Freighter to sign on the client. */
export async function preparePayment({
  sender,
  destination,
  amount,
  memo,
  network,
}: {
  sender: string
  destination: string
  amount: string
  memo?: string
  network?: string
}): Promise<{ unsignedTxXdr: string }> {
  const server = getServer(network)
  let account
  try {
    account = await server.loadAccount(sender)
  } catch (error) {
    if (isNotFound(error)) {
      const net = network || (IS_MAINNET ? "mainnet" : "testnet")
      throw new Error(`Your account does not exist on ${net}. Please fund it first.`)
    }
    throw error
  }

  // Determine whether the destination needs to be created.
  let destinationExists = true
  try {
    await server.loadAccount(destination)
  } catch (error) {
    if (isNotFound(error)) destinationExists = false
    else throw error
  }

  console.log("preparePayment input network:", network, "resolved passphrase:", getNetworkPassphrase(network))
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(network),
  })

  if (destinationExists) {
    builder.addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      }),
    )
  } else {
    builder.addOperation(
      Operation.createAccount({
        destination,
        startingBalance: amount,
      }),
    )
  }

  if (memo && memo.trim().length > 0) {
    builder.addMemo(Memo.text(memo.trim().slice(0, 28)))
  }

  const tx = builder.setTimeout(60).build()
  const unsignedTxXdr = tx.toEnvelope().toXDR("base64")
  return { unsignedTxXdr }
}

/** Submit a transaction signed by Freighter back to Horizon. */
export async function submitSignedTransaction({
  signedXdr,
  network,
}: {
  signedXdr: string
  network?: string
}): Promise<{ hash: string }> {
  const server = getServer(network)
  const tx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase(network))
  const result = await server.submitTransaction(tx)
  return { hash: result.hash }
}
