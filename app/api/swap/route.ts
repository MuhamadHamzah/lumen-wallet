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

interface SwapBody {
  secret?: string
  sender?: string
  signedXdr?: string
  sourceAssetCode?: string
  sourceAssetIssuer?: string
  destAssetCode?: string
  destAssetIssuer?: string
  amount?: string
  destMinAmount?: string
  path?: Array<{ code: string; issuer: string }>
  network?: string
}

export async function POST(request: NextRequest) {
  let body: SwapBody
  try {
    body = (await request.json()) as SwapBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const {
    secret,
    sender,
    signedXdr,
    sourceAssetCode,
    sourceAssetIssuer,
    destAssetCode,
    destAssetIssuer,
    amount,
    destMinAmount,
    path = [],
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
  if (!sourceAssetCode || !destAssetCode || !amount || !destMinAmount) {
    return NextResponse.json(
      { error: "Missing required swap parameters: sourceAssetCode, destAssetCode, amount, destMinAmount." },
      { status: 400 }
    )
  }

  // Parse assets
  const sourceAsset =
    sourceAssetCode.toUpperCase() === "XLM" || sourceAssetIssuer === "native"
      ? Asset.native()
      : new Asset(sourceAssetCode, sourceAssetIssuer!)

  const destAsset =
    destAssetCode.toUpperCase() === "XLM" || destAssetIssuer === "native"
      ? Asset.native()
      : new Asset(destAssetCode, destAssetIssuer!)

  // Parse intermediate path assets
  const pathAssets = path.map((p) =>
    p.code.toUpperCase() === "XLM" || p.issuer === "native"
      ? Asset.native()
      : new Asset(p.code, p.issuer)
  )

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
        Operation.pathPaymentStrictSend({
          sendAsset: sourceAsset,
          sendAmount: amount,
          destination: sender,
          destAsset: destAsset,
          destMin: destMinAmount,
          path: pathAssets,
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
        Operation.pathPaymentStrictSend({
          sendAsset: sourceAsset,
          sendAmount: amount,
          destination: senderPublicKey,
          destAsset: destAsset,
          destMin: destMinAmount,
          path: pathAssets,
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
