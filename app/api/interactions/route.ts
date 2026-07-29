import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
const DATA_DIR = isVercel ? os.tmpdir() : path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "interactions.json")

interface InteractionLog {
  address: string
  action: string
  txHash: string
  time: string
}

function readInteractions(): InteractionLog[] {
  try {
    const sourceFile = path.join(process.cwd(), "data", "interactions.json")

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    
    if (!fs.existsSync(DATA_FILE)) {
      if (fs.existsSync(sourceFile)) {
        const sourceData = fs.readFileSync(sourceFile, "utf-8")
        fs.writeFileSync(DATA_FILE, sourceData)
      } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]))
      }
    }
    
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
  } catch (error) {
    console.error("Read interactions error:", error)
    try {
      const sourceFile = path.join(process.cwd(), "data", "interactions.json")
      if (fs.existsSync(sourceFile)) {
        return JSON.parse(fs.readFileSync(sourceFile, "utf-8"))
      }
    } catch {}
    return []
  }
}

function writeInteractions(data: InteractionLog[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Write interactions error (continuing without crash):", error)
  }
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
  } catch (error) {
    console.error("Interactions POST error:", error)
    return NextResponse.json({ error: "Invalid request or server error." }, { status: 400 })
  }
}
