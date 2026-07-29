import { type NextRequest, NextResponse } from "next/server"
import { readInteractions, writeInteractions, type InteractionLog } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const interactions = await readInteractions()
  const walletCalls = interactions.length
  return NextResponse.json({ interactions, walletCalls })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, action, txHash } = body

    if (!address || !action) {
      return NextResponse.json({ error: "Missing address or action." }, { status: 400 })
    }

    const interactions = await readInteractions()
    const newLog: InteractionLog = {
      address,
      action,
      txHash: txHash || "N/A",
      time: new Date().toISOString(),
    }

    interactions.unshift(newLog)
    await writeInteractions(interactions)

    return NextResponse.json(newLog)
  } catch (error) {
    console.error("Interactions POST error:", error)
    return NextResponse.json({ error: "Invalid request or server error." }, { status: 400 })
  }
}
