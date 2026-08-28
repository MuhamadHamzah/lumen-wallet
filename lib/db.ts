import fs from "fs"
import path from "path"
import os from "os"
import { supabase } from "@/lib/supabase"
import type { MultisigProposal } from "@/lib/multisig"

const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
const DATA_DIR = isVercel ? os.tmpdir() : path.join(process.cwd(), "data")

const FEEDBACKS_FILE = path.join(DATA_DIR, "feedbacks.json")
const INTERACTIONS_FILE = path.join(DATA_DIR, "interactions.json")
const ESCROWS_FILE = path.join(DATA_DIR, "escrow_projects.json")
const PROPOSALS_FILE = path.join(DATA_DIR, "multisig_proposals.json")

// Mendeteksi apakah Supabase terkonfigurasi
const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export interface FeedbackItem {
  id: string
  user: string
  rating: number
  comment: string
  date: string
}

export interface InteractionLog {
  address: string
  action: string
  txHash: string
  time: string
  network?: string
}

export interface EscrowProject {
  id: string
  name: string
  client: string
  freelancer: string
  arbitrator: string
  tokenAddress: string
  tokenSymbol: string
  milestones: any[]
}

// ==========================================
// 1. FITUR UMPAN BALIK (FEEDBACK)
// ==========================================

export async function readFeedbacks(): Promise<FeedbackItem[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("date", { ascending: false })
      
      if (error) throw error
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          user: item.user,
          rating: item.rating,
          comment: item.comment,
          date: item.date,
        }))
      }
    } catch (err) {
      console.error("Kesalahan Supabase readFeedbacks, menggunakan fallback file:", err)
    }
  }

  // Fallback ke penyimpanan berkas lokal
  try {
    const sourceFile = path.join(process.cwd(), "data", "feedbacks.json")
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(FEEDBACKS_FILE)) {
      if (fs.existsSync(sourceFile)) {
        fs.writeFileSync(FEEDBACKS_FILE, fs.readFileSync(sourceFile, "utf-8"))
      } else {
        fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify([]))
      }
    }
    return JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"))
  } catch (err) {
    console.error("Gagal membaca berkas feedbacks lokal:", err)
    return []
  }
}

export async function writeFeedbacks(data: FeedbackItem[]): Promise<void> {
  if (hasSupabase) {
    try {
      // Melakukan upsert data ke tabel feedbacks
      const formatted = data.map(item => ({
        id: item.id,
        user: item.user,
        rating: item.rating,
        comment: item.comment,
        date: item.date,
      }))
      const { error } = await supabase.from("feedbacks").upsert(formatted)
      if (error) throw error
      return
    } catch (err) {
      console.error("Kesalahan Supabase writeFeedbacks, menulis ke lokal:", err)
    }
  }

  // Fallback ke penyimpanan berkas lokal
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Gagal menulis berkas feedbacks lokal:", err)
  }
}

// ==========================================
// 2. FITUR CATATAN INTERAKSI (INTERACTIONS)
// ==========================================

function parseLogNetwork(item: any): "mainnet" | "testnet" {
  const hash = item.tx_hash || item.txHash || ""
  const action = (item.action || "").toLowerCase()
  const time = item.time || ""
  
  if (
    hash.toLowerCase().includes("testnet") ||
    action.includes("testnet") ||
    action.includes("friendbot") ||
    action.includes("test usdc") ||
    action.includes("escrow") ||
    action.includes("milestone") ||
    (time && new Date(time).getTime() < new Date("2026-08-20").getTime())
  ) {
    return "testnet"
  }
  
  if (item.network === "testnet" || item.network === "mainnet") {
    return item.network
  }

  return "mainnet"
}

export async function readInteractions(): Promise<InteractionLog[]> {
  const sourceFile = path.join(process.cwd(), "data", "interactions.json")
  let localData: InteractionLog[] = []
  try {
    if (fs.existsSync(sourceFile)) {
      localData = JSON.parse(fs.readFileSync(sourceFile, "utf-8"))
        .filter((item: any) => !item.action?.includes("Connect Wallet"))
        .map((item: any) => ({
          ...item,
          network: parseLogNetwork(item),
        }))
    }
  } catch (err) {
    console.error("Local interactions read error:", err)
  }

  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("interactions")
        .select("*")
        .order("time", { ascending: false })
      
      if (error) throw error
      if (data && data.length > 0) {
        const supabaseLogs = data
          .filter((item: any) => !item.action?.includes("Connect Wallet"))
          .map((item: any) => ({
            address: item.address,
            action: item.action,
            txHash: item.tx_hash,
            time: item.time,
            network: parseLogNetwork(item),
          }))
        
        const seen = new Set<string>()
        const combined: InteractionLog[] = []
        for (const item of [...supabaseLogs, ...localData]) {
          const key = `${item.address}-${item.action}-${item.txHash}`
          if (!seen.has(key)) {
            seen.add(key)
            combined.push(item)
          }
        }
        return combined
      }
    } catch (err) {
      console.error("Kesalahan Supabase readInteractions, menggunakan fallback:", err)
    }
  }

  return localData
}

export async function writeInteractions(data: InteractionLog[]): Promise<void> {
  const filteredData = data.filter(item => !item.action?.includes("Connect Wallet"))
  if (hasSupabase) {
    try {
      const newItem = filteredData[0]
      if (newItem) {
        const isTestnet = (newItem.network || "").toLowerCase() === "testnet" ||
          newItem.action?.toLowerCase().includes("testnet") ||
          newItem.action?.toLowerCase().includes("friendbot")
        
        let actionLabel = newItem.action
        if (isTestnet && !actionLabel.toLowerCase().includes("testnet") && !actionLabel.toLowerCase().includes("friendbot")) {
          actionLabel = `${actionLabel} (Testnet)`
        }

        const formatted = {
          address: newItem.address,
          action: actionLabel,
          tx_hash: newItem.txHash || "N/A",
          time: newItem.time || new Date().toISOString(),
        }
        const { error } = await supabase.from("interactions").insert([formatted])
        if (error) {
          console.error("Kesalahan Supabase writeInteractions insert:", error)
        }
      }
    } catch (err) {
      console.error("Kesalahan Supabase writeInteractions:", err)
    }
  }

  // Fallback dan sinkronisasi ke penyimpanan berkas lokal
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(filteredData, null, 2))
  } catch (err) {
    console.error("Gagal menulis berkas interactions lokal:", err)
  }
}

// ==========================================
// 3. FITUR PENAMPUNGAN DANA (ESCROW)
// ==========================================

export async function readProjects(): Promise<EscrowProject[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("escrows")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          client: item.client,
          freelancer: item.freelancer,
          arbitrator: item.arbitrator,
          tokenAddress: item.token_address,
          tokenSymbol: item.token_symbol,
          milestones: typeof item.milestones === "string" ? JSON.parse(item.milestones) : item.milestones,
        }))
      }
    } catch (err) {
      console.error("Kesalahan Supabase readProjects, menggunakan fallback:", err)
    }
  }

  // Fallback ke penyimpanan berkas lokal
  try {
    const sourceFile = path.join(process.cwd(), "data", "escrow_projects.json")
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(ESCROWS_FILE)) {
      if (fs.existsSync(sourceFile)) {
        fs.writeFileSync(ESCROWS_FILE, fs.readFileSync(sourceFile, "utf-8"))
      } else {
        fs.writeFileSync(ESCROWS_FILE, JSON.stringify([]))
      }
    }
    return JSON.parse(fs.readFileSync(ESCROWS_FILE, "utf-8"))
  } catch (err) {
    console.error("Gagal membaca berkas escrows lokal:", err)
    return []
  }
}

export async function writeProjects(data: EscrowProject[]): Promise<void> {
  if (hasSupabase) {
    try {
      const formatted = data.map(item => ({
        id: item.id,
        name: item.name,
        client: item.client,
        freelancer: item.freelancer,
        arbitrator: item.arbitrator,
        token_address: item.tokenAddress,
        token_symbol: item.tokenSymbol,
        milestones: item.milestones,
      }))
      const { error } = await supabase.from("escrows").upsert(formatted)
      if (error) throw error
      return
    } catch (err) {
      console.error("Kesalahan Supabase writeProjects, menulis ke lokal:", err)
    }
  }

  // Fallback ke penyimpanan berkas lokal
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(ESCROWS_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Gagal menulis berkas escrows lokal:", err)
  }
}

// ==========================================
// 4. FITUR MULTISIG PROPOSALS
// ==========================================

export async function readProposals(): Promise<MultisigProposal[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase
        .from("multisig_proposals")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          creator: item.creator,
          xdr: item.xdr,
          network: item.network as "testnet" | "mainnet",
          targetAccount: item.target_account,
          signersWhoSigned: typeof item.signers_who_signed === "string" ? JSON.parse(item.signers_who_signed) : item.signers_who_signed,
          currentWeight: item.current_weight,
          targetWeight: item.target_weight,
          thresholdType: item.threshold_type as "low" | "medium" | "high",
          status: item.status as "pending" | "executed" | "failed",
          createdAt: item.created_at,
          executedAt: item.executed_at || undefined,
          txHash: item.tx_hash || undefined,
        }))
      }
    } catch (err) {
      console.error("Kesalahan Supabase readProposals, menggunakan fallback:", err)
    }
  }

  // Fallback ke penyimpanan berkas lokal
  try {
    const sourceFile = path.join(process.cwd(), "data", "multisig_proposals.json")
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(PROPOSALS_FILE)) {
      if (fs.existsSync(sourceFile)) {
        fs.writeFileSync(PROPOSALS_FILE, fs.readFileSync(sourceFile, "utf-8"))
      } else {
        fs.writeFileSync(PROPOSALS_FILE, JSON.stringify([]))
      }
    }
    return JSON.parse(fs.readFileSync(PROPOSALS_FILE, "utf-8"))
  } catch (err) {
    console.error("Gagal membaca berkas proposals lokal:", err)
    return []
  }
}

export async function writeProposals(data: MultisigProposal[]): Promise<void> {
  if (hasSupabase) {
    try {
      const formatted = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        creator: item.creator,
        xdr: item.xdr,
        network: item.network,
        target_account: item.targetAccount,
        signers_who_signed: item.signersWhoSigned,
        current_weight: item.currentWeight,
        target_weight: item.targetWeight,
        threshold_type: item.thresholdType,
        status: item.status,
        created_at: item.createdAt,
        executed_at: item.executedAt || null,
        tx_hash: item.txHash || null,
      }))
      const { error } = await supabase.from("multisig_proposals").upsert(formatted)
      if (error) throw error
      return
    } catch (err) {
      console.error("Kesalahan Supabase writeProposals, menulis ke lokal:", err)
    }
  }

  // Fallback ke penyimpanan berkas lokal
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(PROPOSALS_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Gagal menulis berkas proposals lokal:", err)
  }
}

export async function logInteraction(address: string, action: string, txHash: string, network = "mainnet"): Promise<void> {
  try {
    const list = await readInteractions()
    list.unshift({
      address,
      action,
      txHash,
      time: new Date().toISOString(),
      network,
    })
    await writeInteractions(list.slice(0, 100))
  } catch (err) {
    console.error("Gagal mencatat interaksi:", err)
  }
}

