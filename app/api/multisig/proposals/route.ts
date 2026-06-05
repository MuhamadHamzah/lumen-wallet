import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import type { MultisigProposal } from "@/lib/multisig"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "multisig_proposals.json")

// Helper function to read proposals safely
function readProposals(): MultisigProposal[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]))
      return []
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8")
    return JSON.parse(data) as MultisigProposal[]
  } catch (err) {
    console.error("Error reading proposals:", err)
    return []
  }
}

// Helper function to write proposals safely
function writeProposals(proposals: MultisigProposal[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(proposals, null, 2))
  } catch (err) {
    console.error("Error writing proposals:", err)
  }
}

export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account")
  const network = request.nextUrl.searchParams.get("network") ?? "testnet"

  if (!account) {
    return NextResponse.json({ error: "Missing 'account' query parameter." }, { status: 400 })
  }

  const proposals = readProposals()
  const filtered = proposals.filter(
    (p) => p.targetAccount === account && p.network === network
  )

  return NextResponse.json({ proposals: filtered })
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { action } = body

  if (action === "create") {
    const { proposal } = body
    if (!proposal || !proposal.targetAccount || !proposal.xdr) {
      return NextResponse.json({ error: "Missing proposal details or XDR." }, { status: 400 })
    }

    const proposals = readProposals()
    const newProposal: MultisigProposal = {
      ...proposal,
      id: Math.random().toString(36).substring(2, 11),
      signersWhoSigned: [proposal.creator],
      currentWeight: proposal.currentWeight ?? 1,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    proposals.push(newProposal)
    writeProposals(proposals)

    return NextResponse.json(newProposal)
  }

  if (action === "sign") {
    const { id, signer, signedXdr, newWeight } = body
    if (!id || !signer || !signedXdr) {
      return NextResponse.json({ error: "Missing 'id', 'signer', or 'signedXdr'." }, { status: 400 })
    }

    const proposals = readProposals()
    const index = proposals.findIndex((p) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 })
    }

    const proposal = proposals[index]
    if (proposal.status !== "pending") {
      return NextResponse.json({ error: "Proposal is not in pending status." }, { status: 400 })
    }

    if (!proposal.signersWhoSigned.includes(signer)) {
      proposal.signersWhoSigned.push(signer)
    }
    proposal.xdr = signedXdr
    proposal.currentWeight = newWeight

    proposals[index] = proposal
    writeProposals(proposals)

    return NextResponse.json(proposal)
  }

  if (action === "execute") {
    const { id, txHash } = body
    if (!id || !txHash) {
      return NextResponse.json({ error: "Missing 'id' or 'txHash'." }, { status: 400 })
    }

    const proposals = readProposals()
    const index = proposals.findIndex((p) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 })
    }

    const proposal = proposals[index]
    proposal.status = "executed"
    proposal.txHash = txHash
    proposal.executedAt = new Date().toISOString()

    proposals[index] = proposal
    writeProposals(proposals)

    return NextResponse.json(proposal)
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 })
}
