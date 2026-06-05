import { type NextRequest, NextResponse } from "next/server"
import {
  submitPayment,
  preparePayment,
  submitSignedTransaction,
  isValidPublicKey,
  isValidSecretKey,
  describeStellarError,
} from "@/lib/stellar-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface SendBody {
  secret?: string
  sender?: string
  signedXdr?: string
  destination?: string
  amount?: string
  memo?: string
  network?: string
}

export async function POST(request: NextRequest) {
  let body: SendBody
  try {
    body = (await request.json()) as SendBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { secret, sender, signedXdr, destination, amount, memo, network } = body
  console.log("POST /api/send payload:", { secret: secret ? "S..." : undefined, sender, signedXdr: signedXdr ? "XDR..." : undefined, destination, amount, memo, network })

  // 1. Submit Signed XDR Mode (Freighter step 2)
  if (signedXdr) {
    try {
      const { hash } = await submitSignedTransaction({ signedXdr, network })
      return NextResponse.json({ hash })
    } catch (error) {
      return NextResponse.json({ error: describeStellarError(error) }, { status: 422 })
    }
  }

  // 2. Prepare Transaction Mode (Freighter step 1)
  if (sender) {
    if (!destination || !amount) {
      return NextResponse.json({ error: "Missing required fields: destination, amount." }, { status: 400 })
    }
    if (!isValidPublicKey(sender)) {
      return NextResponse.json({ error: "Invalid sender public key." }, { status: 400 })
    }
    if (!isValidPublicKey(destination)) {
      return NextResponse.json({ error: "Invalid destination public key." }, { status: 400 })
    }
    const amountNum = Number(amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 })
    }
    if (memo && memo.length > 28) {
      return NextResponse.json({ error: "Memo must be 28 characters or fewer." }, { status: 400 })
    }

    try {
      const { unsignedTxXdr } = await preparePayment({ sender, destination, amount, memo, network })
      return NextResponse.json({ unsignedTxXdr })
    } catch (error) {
      return NextResponse.json({ error: describeStellarError(error) }, { status: 422 })
    }
  }

  // 3. Direct Send Mode (Manual / Secret Key)
  if (secret) {
    if (!destination || !amount) {
      return NextResponse.json({ error: "Missing required fields: destination, amount." }, { status: 400 })
    }
    if (!isValidSecretKey(secret)) {
      return NextResponse.json({ error: "Invalid Stellar secret key." }, { status: 400 })
    }
    if (!isValidPublicKey(destination)) {
      return NextResponse.json({ error: "Invalid destination public key." }, { status: 400 })
    }
    const amountNum = Number(amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number." }, { status: 400 })
    }
    if (memo && memo.length > 28) {
      return NextResponse.json({ error: "Memo must be 28 characters or fewer." }, { status: 400 })
    }

    try {
      const { hash } = await submitPayment({ secret, destination, amount, memo, network })
      return NextResponse.json({ hash })
    } catch (error) {
      return NextResponse.json({ error: describeStellarError(error) }, { status: 422 })
    }
  }

  return NextResponse.json({ error: "Invalid request payload. Must provide 'signedXdr', 'sender', or 'secret'." }, { status: 400 })
}
