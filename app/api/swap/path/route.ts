import { type NextRequest, NextResponse } from "next/server"
import { getServer } from "@/lib/stellar-server"
import { Asset } from "@stellar/stellar-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sourceAssetCode = searchParams.get("sourceAssetCode")
  const sourceAssetIssuer = searchParams.get("sourceAssetIssuer")
  const destAssetCode = searchParams.get("destAssetCode")
  const destAssetIssuer = searchParams.get("destAssetIssuer")
  const amount = searchParams.get("amount")
  const network = searchParams.get("network") ?? "testnet"

  if (!sourceAssetCode || !destAssetCode || !amount) {
    return NextResponse.json(
      { error: "Missing required query parameters: sourceAssetCode, destAssetCode, amount." },
      { status: 400 }
    )
  }

  try {
    const server = getServer(network)

    // Build source asset
    const sourceAsset =
      sourceAssetCode.toUpperCase() === "XLM" || sourceAssetIssuer === "native"
        ? Asset.native()
        : new Asset(sourceAssetCode, sourceAssetIssuer!)

    // Build destination asset
    const destAsset =
      destAssetCode.toUpperCase() === "XLM" || destAssetIssuer === "native"
        ? Asset.native()
        : new Asset(destAssetCode, destAssetIssuer!)

    console.log(`Pathfinding from ${sourceAssetCode} to ${destAssetCode} for amount ${amount} on ${network}`)

    // Query Horizon for strict-send paths
    const response = await server
      .strictSendPaths(sourceAsset, amount, [destAsset])
      .call()

    if (!response.records || response.records.length === 0) {
      return NextResponse.json({
        pathExists: false,
        error: "No swap path found. There may be insufficient liquidity in the pools.",
      })
    }

    // Records are sorted with the highest destination_amount first
    const bestPath = response.records[0]

    // Format the intermediate path assets for the response
    const intermediatePath = bestPath.path.map((p) => ({
      code: p.asset_code ?? "XLM",
      issuer: p.asset_issuer ?? "native",
    }))

    const sourceAmountNum = Number(bestPath.source_amount)
    const destAmountNum = Number(bestPath.destination_amount)
    const rate = sourceAmountNum > 0 ? destAmountNum / sourceAmountNum : 0

    return NextResponse.json({
      pathExists: true,
      sourceAmount: bestPath.source_amount,
      destinationAmount: bestPath.destination_amount,
      path: intermediatePath,
      rate,
    })
  } catch (error) {
    console.error("Pathfinding error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch swap path from network." },
      { status: 500 }
    )
  }
}
