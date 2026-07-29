import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DATA_DIR = path.join(process.cwd(), "data")
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

function writeFeedbacks(data: FeedbackItem[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  const feedbacks = readFeedbacks()
  return NextResponse.json({ feedbacks })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, rating, comment } = body

    if (!user || !comment) {
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
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}
