"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
  size?: "icon" | "sm"
}

export function CopyButton({ value, label = "Copied to clipboard", className, size = "icon" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(label)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  if (size === "sm") {
    return (
      <Button variant="outline" size="sm" onClick={handleCopy} className={cn("gap-2", className)}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Copy" onClick={handleCopy} className={className}>
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
    </Button>
  )
}
