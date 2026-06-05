import { type NextRequest, NextResponse } from "next/server"
import { fetchAccountDetails, isValidPublicKey, describeStellarError } from "@/lib/stellar-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")
  const network = request.nextUrl.searchParams.get("network") ?? "testnet"

  if (!address) {
    return NextResponse.json({ error: "Missing 'address' query parameter." }, { status: 400 })
  }
  if (!isValidPublicKey(address)) {
    return NextResponse.json({ error: "Invalid Stellar public key." }, { status: 400 })
  }

  try {
    const details = await fetchAccountDetails(address, network)
    if (!details) {
      return NextResponse.json({ error: "Account not found on network." }, { status: 404 })
    }
    return NextResponse.json(details)
  } catch (error) {
    return NextResponse.json({ error: describeStellarError(error) }, { status: 502 })
  }
}
