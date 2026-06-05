import { type NextRequest, NextResponse } from "next/server"
import {
  tokenMint,
  getTokenMetadata,
  isValidContractId,
  isValidSecretKey,
  isValidPublicKey,
  describeSorobanError,
} from "@/lib/soroban-server"
import { toBaseUnits } from "@/lib/soroban"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface MintBody {
  secret?: string
  contract?: string
  to?: string
  amount?: string
  network?: string
}

export async function POST(request: NextRequest) {
  let body: MintBody
  try {
    body = (await request.json()) as MintBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { secret, contract, to, amount, network } = body

  if (!secret || !contract || !to || !amount) {
    return NextResponse.json(
      { error: "Missing required fields: secret, contract, to, amount." },
      { status: 400 },
    )
  }
  if (!isValidSecretKey(secret)) {
    return NextResponse.json({ error: "Invalid Stellar secret key." }, { status: 400 })
  }
  if (!isValidContractId(contract)) {
    return NextResponse.json({ error: "Invalid token contract ID." }, { status: 400 })
  }
  if (!isValidPublicKey(to)) {
    return NextResponse.json({ error: "Invalid recipient address." }, { status: 400 })
  }
  if (!(Number(amount) > 0)) {
    return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 })
  }

  try {
    const { decimals } = await getTokenMetadata(contract, network)
    const baseUnits = toBaseUnits(amount, decimals)
    if (baseUnits <= 0n) {
      return NextResponse.json({ error: "Amount is too small for this token's precision." }, { status: 400 })
    }
    const { hash } = await tokenMint({ secret, contractId: contract, to, amount: baseUnits, network })
    return NextResponse.json({ hash })
  } catch (error) {
    return NextResponse.json({ error: describeSorobanError(error) }, { status: 422 })
  }
}
