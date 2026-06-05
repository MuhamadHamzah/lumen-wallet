import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo_lumen.png"
        alt="Lumen Wallet"
        width={32}
        height={32}
        className="size-8 rounded-lg object-contain"
      />
      <span className="text-lg font-semibold tracking-tight">Lumen</span>
    </div>
  )
}
