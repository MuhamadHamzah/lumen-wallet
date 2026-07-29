import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  
  const hasEnv = Boolean(envUrl && envKey)
  
  let testError: any = null
  let testData: any = null
  
  try {
    const { data, error } = await supabase.from("feedbacks").select("*").limit(1)
    if (error) {
      testError = error
    } else {
      testData = data
    }
  } catch (err: any) {
    testError = { message: err.message, stack: err.stack }
  }

  return NextResponse.json({
    hasEnv,
    urlLength: envUrl.length,
    keyLength: envKey.length,
    urlStart: envUrl ? envUrl.substring(0, 15) + "..." : "none",
    testData,
    testError
  })
}
