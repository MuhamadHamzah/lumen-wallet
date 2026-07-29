import { type NextRequest, NextResponse } from "next/server"
import { readFeedbacks, writeFeedbacks, type FeedbackItem } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const feedbacks = await readFeedbacks()
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

    const feedbacks = await readFeedbacks()
    const newFeedback: FeedbackItem = {
      id: Math.random().toString(36).substring(2, 11),
      user,
      rating: rating ?? 5,
      comment,
      date: new Date().toISOString(),
    }

    feedbacks.unshift(newFeedback)
    await writeFeedbacks(feedbacks)

    return NextResponse.json(newFeedback)
  } catch (error) {
    console.error("Feedback POST error:", error)
    return NextResponse.json({ error: "Invalid request or server error." }, { status: 400 })
  }
}
