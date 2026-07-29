import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "interactions.json")

interface InteractionLog {
  address: string
  action: string
  txHash: string
  time: string
}

function readInteractions(): InteractionLog[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]))
      return []
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
  } catch {
    return []
  }
}

function writeInteractions(data: InteractionLog[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  const interactions = readInteractions()
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

    const interactions = readInteractions()
    const newLog: InteractionLog = {
      address,
      action,
      txHash: txHash || "N/A",
      time: new Date().toISOString(),
    }

    interactions.unshift(newLog)
    writeInteractions(interactions)

    return NextResponse.json(newLog)
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}
