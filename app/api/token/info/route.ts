import { type NextRequest, NextResponse } from "next/server"
import {
  getTokenMetadata,
  getTokenBalance,
  getTokenAdmin,
  isValidContractId,
  isValidPublicKey,
  describeSorobanError,
} from "@/lib/soroban-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contractId = searchParams.get("contract")?.trim()
  const address = searchParams.get("address")?.trim()
  const network = searchParams.get("network")?.trim() ?? "testnet"

  if (!contractId || !isValidContractId(contractId)) {
    return NextResponse.json({ error: "Invalid contract ID (must start with C)." }, { status: 400 })
  }
  if (address && !isValidPublicKey(address)) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 })
  }

  try {
    const metadata = await getTokenMetadata(contractId, network)
    const [balance, admin] = await Promise.all([
      address ? getTokenBalance(contractId, address, network) : Promise.resolve("0"),
      getTokenAdmin(contractId, network),
    ])

    return NextResponse.json({
      contractId,
      name: metadata.name,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      balance,
      admin,
      isAdmin: Boolean(admin && address && admin === address),
    })
  } catch (error) {
    return NextResponse.json({ error: describeSorobanError(error) }, { status: 422 })
  }
}
