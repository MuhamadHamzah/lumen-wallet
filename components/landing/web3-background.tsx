"use client"

import KineticGrid from "@/components/ui/kinetic-grid"

export function Web3Background({ mode = "wallet" }: { mode?: "wallet" | "flow" }) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Interactive Kinetic Grid Canvas */}
      <KineticGrid
        globalColor={mode === "flow" ? "amber" : "default"}
        transparentBg={true}
        className="fixed inset-0 w-full h-full min-h-screen !bg-transparent pointer-events-none"
      />

      {/* Main gradient - matches logo's deep navy */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />

      {/* Ambient blue glow - matches logo's left orbit */}
      <div
        className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full animate-float ${
          mode === "wallet" ? "opacity-35" : "opacity-10"
        }`}
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }}
      />

      {/* Amber glow - matches logo's right orbit */}
      <div
        className={`absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full animate-float ${
          mode === "flow" ? "opacity-35" : "opacity-10"
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
          animationDelay: '4s',
          animationDirection: 'reverse',
        }}
      />

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-blue-400/40 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-amber-400/30 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-2/3 left-1/2 w-1 h-1 rounded-full bg-blue-300/30 animate-float" style={{ animationDelay: '5s' }} />
      <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 rounded-full bg-amber-300/40 animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-blue-400/25 animate-float" style={{ animationDelay: '7s' }} />
    </div>
  )
}
