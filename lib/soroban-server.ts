import "server-only"

import {
  rpc,
  Contract,
  TransactionBuilder,
  Keypair,
  Networks,
  BASE_FEE,
  Account,
  Address,
  StrKey,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk"

/**
 * Server-only Soroban (smart contract) helpers. Like stellar-server.ts, this
 * is the ONLY place secret keys are handled, and it never ships to the client.
 *
 * Read calls (name/symbol/decimals/balance/admin) use `simulateTransaction`,
 * which costs nothing and needs no funded source account. State-changing calls
 * (transfer/mint) are simulated, prepared, signed, submitted, and polled.
 */

const RAW_NETWORK = (process.env.STELLAR_NETWORK ?? "testnet").toLowerCase()
export const IS_MAINNET = RAW_NETWORK === "mainnet" || RAW_NETWORK === "public"

export function getSorobanRpcUrl(network?: string): string {
  const isMainnet = network
    ? (network.toLowerCase() === "mainnet" || network.toLowerCase() === "public")
    : IS_MAINNET
  return isMainnet ? "https://mainnet.sorobanrpc.com" : "https://soroban-testnet.stellar.org"
}

export function getNetworkPassphrase(network?: string): string {
  const isMainnet = network
    ? (network.toLowerCase() === "mainnet" || network.toLowerCase() === "public")
    : IS_MAINNET
  return isMainnet 
    ? "Public Global Stellar Network ; September 2015" 
    : "Test SDF Network ; September 2015"
}

// A throwaway, valid (all-zero) public key used purely as the source account
// for read-only simulations. It never needs to exist or be funded.
const READ_ONLY_SOURCE = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"

export function getRpcServer(network?: string) {
  return new rpc.Server(getSorobanRpcUrl(network))
}

export function isValidContractId(id: string): boolean {
  return StrKey.isValidContract(id)
}

export function isValidSecretKey(secret: string): boolean {
  return StrKey.isValidEd25519SecretSeed(secret)
}

export function isValidPublicKey(key: string): boolean {
  return StrKey.isValidEd25519PublicKey(key)
}

function addressToScVal(addr: string): xdr.ScVal {
  return new Address(addr).toScVal()
}

function i128ToScVal(amount: bigint): xdr.ScVal {
  return nativeToScVal(amount, { type: "i128" })
}

/** Turn a Soroban/RPC error into a human-readable message. */
export function describeSorobanError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error)
  if (/insufficient balance/i.test(msg)) return "Insufficient token balance for this transfer."
  if (/insufficient allowance/i.test(msg)) return "Insufficient allowance for this transfer."
  if (/already initialized/i.test(msg)) return "This token contract is already initialized."
  if (/Error\(Auth/i.test(msg) || /unauthorized/i.test(msg))
    return "Not authorized. Only the token admin can mint."
  if (/account not found|notfound|not found/i.test(msg))
    return "Your account was not found on this network. Fund it with XLM first."
  if (/could not find contract|MissingValue|UnexpectedSize|wasm/i.test(msg))
    return "Contract not found or not a valid token on this network. Check the contract ID and network."
  return msg
}

/** Run a read-only contract method via simulation and decode the result. */
async function simulateRead(contractId: string, method: string, args: xdr.ScVal[] = [], network?: string): Promise<unknown> {
  const server = getRpcServer(network)
  const contract = new Contract(contractId)
  const source = new Account(READ_ONLY_SOURCE, "0")

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(network),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error)
  }
  const retval = sim.result?.retval
  if (!retval) throw new Error(`No value returned from "${method}".`)
  return scValToNative(retval)
}

interface InvokeArgs {
  secret: string
  contractId: string
  method: string
  args: xdr.ScVal[]
  network?: string
}

/** Build, simulate/prepare, sign, submit, and poll a state-changing call. */
async function invoke({ secret, contractId, method, args, network }: InvokeArgs): Promise<{ hash: string }> {
  const server = getRpcServer(network)
  const keypair = Keypair.fromSecret(secret)
  const contract = new Contract(contractId)

  const account = await server.getAccount(keypair.publicKey())

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(network),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build()

  // prepareTransaction simulates the call and attaches the Soroban footprint,
  // resource fees, and auth entries required to submit it.
  const prepared = await server.prepareTransaction(tx)
  prepared.sign(keypair)

  const sent = await server.sendTransaction(prepared)
  if (sent.status === "ERROR") {
    throw new Error(`Submission failed: ${JSON.stringify(sent.errorResult ?? sent.status)}`)
  }

  let getResp = await server.getTransaction(sent.hash)
  let tries = 0
  while (getResp.status === rpc.Api.GetTransactionStatus.NOT_FOUND && tries < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    getResp = await server.getTransaction(sent.hash)
    tries += 1
  }

  if (getResp.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction did not succeed (status: ${getResp.status}).`)
  }

  return { hash: sent.hash }
}

export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
}

/** Read name/symbol/decimals from the token contract. */
export async function getTokenMetadata(contractId: string, network?: string): Promise<TokenMetadata> {
  const [name, symbol, decimals] = await Promise.all([
    simulateRead(contractId, "name", [], network),
    simulateRead(contractId, "symbol", [], network),
    simulateRead(contractId, "decimals", [], network),
  ])
  return {
    name: String(name),
    symbol: String(symbol),
    decimals: Number(decimals),
  }
}

/** Read a single address's token balance (base units, stringified). */
export async function getTokenBalance(contractId: string, address: string, network?: string): Promise<string> {
  const raw = await simulateRead(contractId, "balance", [addressToScVal(address)], network)
  return (raw as bigint).toString()
}

/** Read the token admin public key, or null if the contract has none. */
export async function getTokenAdmin(contractId: string, network?: string): Promise<string | null> {
  try {
    const admin = await simulateRead(contractId, "admin", [], network)
    return typeof admin === "string" ? admin : String(admin)
  } catch {
    return null
  }
}

interface TokenTxArgs {
  secret: string
  contractId: string
  to: string
  amount: bigint
  network?: string
}

/** Transfer tokens from the signer to `to`. */
export async function tokenTransfer({ secret, contractId, to, amount, network }: TokenTxArgs): Promise<{ hash: string }> {
  const from = Keypair.fromSecret(secret).publicKey()
  return invoke({
    secret,
    contractId,
    method: "transfer",
    args: [addressToScVal(from), addressToScVal(to), i128ToScVal(amount)],
    network,
  })
}

/** Mint new tokens to `to` (admin only). */
export async function tokenMint({ secret, contractId, to, amount, network }: TokenTxArgs): Promise<{ hash: string }> {
  return invoke({
    secret,
    contractId,
    method: "mint",
    args: [addressToScVal(to), i128ToScVal(amount)],
    network,
  })
}
