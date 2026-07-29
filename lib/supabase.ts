import { createClient } from "@supabase/supabase-js"

// Gunakan nilai placeholder saat kompilasi build agar tidak terjadi crash karena kunci kosong
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Peringatan: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur. Operasi basis data akan dialihkan ke penyimpanan lokal.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
