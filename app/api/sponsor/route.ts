import { NextRequest, NextResponse } from "next/server"
import {
  TransactionBuilder,
  Networks,
  Horizon,
  BASE_FEE,
} from "@stellar/stellar-sdk"
import { getSponsorKeypair, getSponsorshipConfig, checkSponsorRateLimit } from "@/lib/sponsorship-server"
import { getServer, getNetworkPassphrase } from "@/lib/stellar-server"

export async function GET(req: NextRequest) {
  try {
    const config = getSponsorshipConfig()
    return NextResponse.json({
      enabled: config.enabled,
      sponsorAddress: config.sponsorPublicKey,
      maxFeeStroops: config.maxFeeStroops,
      gaslessAvailable: config.enabled,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query relayer status" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous-client"
    if (!checkSponsorRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many gasless sponsorship requests. Please wait a minute before trying again." },
        { status: 429 }
      )
    }

    const config = getSponsorshipConfig()
    if (!config.enabled) {
      return NextResponse.json(
        { error: "Gasless fee sponsorship is currently disabled on this node." },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { innerTxXdr, network = "testnet" } = body

    if (!innerTxXdr || typeof innerTxXdr !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'innerTxXdr' payload." },
        { status: 400 }
      )
    }

    const networkPassphrase = getNetworkPassphrase(network)
    const server = getServer(network)
    const sponsorKeypair = getSponsorKeypair()

    // 1. Reconstruct the inner transaction from XDR
    const innerTx = TransactionBuilder.fromXDR(innerTxXdr, networkPassphrase)

    // 2. Build the Fee-Bump transaction wrapping the inner transaction
    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      sponsorKeypair,
      Math.min(config.maxFeeStroops, 100000).toString(),
      innerTx,
      networkPassphrase
    )

    // 3. Sign the fee bump transaction with the sponsor key
    feeBumpTx.sign(sponsorKeypair)

    // 4. Submit the sponsored transaction to Stellar network
    const submitResult = await server.submitTransaction(feeBumpTx)

    return NextResponse.json({
      success: true,
      txHash: submitResult.hash,
      feeBumpXdr: feeBumpTx.toXDR(),
      feeSponsoredStroops: parseInt(feeBumpTx.fee, 10),
      network,
    })
  } catch (error: any) {
    console.error("[API Sponsor Error]:", error?.response?.data || error?.message || error)
    
    // Extract horizon error details if available
    const horizonError = error?.response?.data?.extras?.result_codes
    return NextResponse.json(
      {
        error: horizonError
          ? Stellar rejection: 
          : error?.message || "Internal error processing sponsored transaction",
      },
      { status: 422 }
    )
  }
}
