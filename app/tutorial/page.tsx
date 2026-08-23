"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TutorialRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/docs")
  }, [router])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-mono">Redirecting to Developer Docs…</p>
      </div>
    </div>
  )
}
