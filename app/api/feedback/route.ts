import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
const DATA_DIR = isVercel ? os.tmpdir() : path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "feedbacks.json")

interface FeedbackItem {
  id: string
  user: string
  rating: number
  comment: string
  date: string
}

function readFeedbacks(): FeedbackItem[] {
  try {
    const sourceFile = path.join(process.cwd(), "data", "feedbacks.json")
    
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
    console.error("Read feedbacks error:", error)
    try {
      const sourceFile = path.join(process.cwd(), "data", "feedbacks.json")
      if (fs.existsSync(sourceFile)) {
        return JSON.parse(fs.readFileSync(sourceFile, "utf-8"))
      }
    } catch {}
    return []
  }
}

function writeFeedbacks(data: FeedbackItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Write feedbacks error (continuing without crash):", error)
  }
}

export async function GET() {
  const feedbacks = readFeedbacks()
  return NextResponse.json({ feedbacks })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Feedback POST received body:", body)
    const { user, rating, comment } = body

    if (!user || !comment) {
      console.warn("Feedback validation failed. Missing user or comment:", { user, comment })
      return NextResponse.json({ error: "Missing user or comment." }, { status: 400 })
    }

    const feedbacks = readFeedbacks()
    const newFeedback: FeedbackItem = {
      id: Math.random().toString(36).substring(2, 11),
      user,
      rating: rating ?? 5,
      comment,
      date: new Date().toISOString(),
    }

    feedbacks.unshift(newFeedback)
    writeFeedbacks(feedbacks)

    return NextResponse.json(newFeedback)
  } catch (error) {
    console.error("Feedback POST error:", error)
    return NextResponse.json({ error: "Invalid request or server error." }, { status: 400 })
  }
}
