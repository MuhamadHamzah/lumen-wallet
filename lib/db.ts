import fs from "fs"
import path from "path"
import os from "os"
import { kv } from "@vercel/kv"

const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
const DATA_DIR = isVercel ? os.tmpdir() : path.join(process.cwd(), "data")

const FEEDBACKS_FILE = path.join(DATA_DIR, "feedbacks.json")
const INTERACTIONS_FILE = path.join(DATA_DIR, "interactions.json")

// Helper to check if Vercel KV is configured
const hasKV = Boolean(
  process.env.KV_URL && 
  process.env.KV_REST_API_URL && 
  process.env.KV_REST_API_TOKEN
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
}

// ==========================================
// FEEDBACK DATABASE OPERATIONS
// ==========================================

export async function readFeedbacks(): Promise<FeedbackItem[]> {
  if (hasKV) {
    try {
      const data = await kv.get<FeedbackItem[]>("lumen_feedbacks")
      return data || []
    } catch (error) {
      console.error("Vercel KV read feedbacks error, falling back:", error)
    }
  }

  // Local File Fallback
  try {
    const sourceFile = path.join(process.cwd(), "data", "feedbacks.json")
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    
    if (!fs.existsSync(FEEDBACKS_FILE)) {
      if (fs.existsSync(sourceFile)) {
        const sourceData = fs.readFileSync(sourceFile, "utf-8")
        fs.writeFileSync(FEEDBACKS_FILE, sourceData)
      } else {
        fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify([]))
      }
    }
    return JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"))
  } catch (error) {
    console.error("Local file read feedbacks error:", error)
    try {
      const sourceFile = path.join(process.cwd(), "data", "feedbacks.json")
      if (fs.existsSync(sourceFile)) {
        return JSON.parse(fs.readFileSync(sourceFile, "utf-8"))
      }
    } catch {}
    return []
  }
}

export async function writeFeedbacks(data: FeedbackItem[]): Promise<void> {
  if (hasKV) {
    try {
      await kv.set("lumen_feedbacks", data)
      return
    } catch (error) {
      console.error("Vercel KV write feedbacks error, falling back:", error)
    }
  }

  // Local File Fallback
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Local file write feedbacks error:", error)
  }
}

// ==========================================
// INTERACTIONS DATABASE OPERATIONS
// ==========================================

export async function readInteractions(): Promise<InteractionLog[]> {
  if (hasKV) {
    try {
      const data = await kv.get<InteractionLog[]>("lumen_interactions")
      return data || []
    } catch (error) {
      console.error("Vercel KV read interactions error, falling back:", error)
    }
  }

  // Local File Fallback
  try {
    const sourceFile = path.join(process.cwd(), "data", "interactions.json")
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    
    if (!fs.existsSync(INTERACTIONS_FILE)) {
      if (fs.existsSync(sourceFile)) {
        const sourceData = fs.readFileSync(sourceFile, "utf-8")
        fs.writeFileSync(INTERACTIONS_FILE, sourceData)
      } else {
        fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify([]))
      }
    }
    return JSON.parse(fs.readFileSync(INTERACTIONS_FILE, "utf-8"))
  } catch (error) {
    console.error("Local file read interactions error:", error)
    try {
      const sourceFile = path.join(process.cwd(), "data", "interactions.json")
      if (fs.existsSync(sourceFile)) {
        return JSON.parse(fs.readFileSync(sourceFile, "utf-8"))
      }
    } catch {}
    return []
  }
}

export async function writeInteractions(data: InteractionLog[]): Promise<void> {
  if (hasKV) {
    try {
      await kv.set("lumen_interactions", data)
      return
    } catch (error) {
      console.error("Vercel KV write interactions error, falling back:", error)
    }
  }

  // Local File Fallback
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Local file write interactions error:", error)
  }
}
