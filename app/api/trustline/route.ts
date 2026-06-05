import { type NextRequest, NextResponse } from "next/server"
import {
  getServer,
  getNetworkPassphrase,
  isValidPublicKey,
  isValidSecretKey,
  describeStellarError,
} from "@/lib/stellar-server"
import {
  TransactionBuilder,
  Operation,
  Asset,
  Keypair,
  BASE_FEE,
} from "@stellar/stellar-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface TrustlineBody {
  secret?: string
  sender?: string
  signedXdr?: string
  assetCode?: string
  assetIssuer?: string
  network?: string
}

export async function POST(request: NextRequest) {
  let body: TrustlineBody
  try {
    body = (await request.json()) as TrustlineBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const {
    secret,
    sender,
    signedXdr,
    assetCode,
    assetIssuer,
    network = "testnet",
  } = body

  // 1. Submit Signed XDR Mode (Freighter step 2)
  if (signedXdr) {
    try {
      const server = getServer(network)
      const tx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase(network))
      const result = await server.submitTransaction(tx)
      return NextResponse.json({ hash: result.hash })
    } catch (error) {
      return NextResponse.json({ error: describeStellarError(error) }, { status: 422 })
    }
  }

  // Common parameters validation for preparation & direct execution
  if (!assetCode || !assetIssuer) {
    return NextResponse.json(
      { error: "Missing required parameters: assetCode, assetIssuer." },
      { status: 400 }
    )
  }

  if (assetCode.toUpperCase() === "XLM" || assetIssuer === "native") {
    return NextResponse.json(
      { error: "Trustlines are not required for native XLM." },
      { status: 400 }
    )
  }

  const targetAsset = new Asset(assetCode, assetIssuer)
  const server = getServer(network)

  // 2. Prepare Transaction Mode (Freighter step 1)
  if (sender) {
    if (!isValidPublicKey(sender)) {
      return NextResponse.json({ error: "Invalid sender public key." }, { status: 400 })
    }

    try {
      const account = await server.loadAccount(sender)
      const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: getNetworkPassphrase(network),
      })

      builder.addOperation(
        Operation.changeTrust({
          asset: targetAsset,
        })
      )

      const tx = builder.setTimeout(60).build()
      const unsignedTxXdr = tx.toEnvelope().toXDR("base64")
      return NextResponse.json({ unsignedTxXdr })
    } catch (error) {
      return NextResponse.json({ error: describeStellarError(error) }, { status: 422 })
    }
  }

  // 3. Direct execution (Secret Key)
  if (secret) {
    if (!isValidSecretKey(secret)) {
      return NextResponse.json({ error: "Invalid Stellar secret key." }, { status: 400 })
    }

    try {
      const sourceKeypair = Keypair.fromSecret(secret)
      const senderPublicKey = sourceKeypair.publicKey()

      const account = await server.loadAccount(senderPublicKey)
      const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: getNetworkPassphrase(network),
      })

      builder.addOperation(
        Operation.changeTrust({
          asset: targetAsset,
        })
      )

      const tx = builder.setTimeout(60).build()
      tx.sign(sourceKeypair)

      const result = await server.submitTransaction(tx)
      return NextResponse.json({ hash: result.hash })
    } catch (error) {
      return NextResponse.json({ error: describeStellarError(error) }, { status: 422 })
    }
  }

  return NextResponse.json(
    { error: "Invalid request payload. Must provide 'signedXdr', 'sender', or 'secret'." },
    { status: 400 }
  )
}
