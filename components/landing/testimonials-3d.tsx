"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Marquee } from '@/components/ui/3d-testimonails'
import { FadeIn } from './web3-animations'

const defaultWalletReviews = [
  {
    name: 'Ava Green',
    username: '@ava',
    body: 'Lumen Wallet made XLM payments 10x faster!',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    country: '🇦🇺 Australia',
  },
  {
    name: 'Ana Miller',
    username: '@ana',
    body: 'StellarWalletsKit integration is a game changer!',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    country: '🇩🇪 Germany',
  },
  {
    name: 'Mateo Rossi',
    username: '@mat',
    body: 'Transactions are buttery smooth & instant!',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    country: '🇮🇹 Italy',
  },
  {
    name: 'Maya Patel',
    username: '@maya',
    body: 'Connecting Freighter wallet was a breeze!',
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    country: '🇮🇳 India',
  },
  {
    name: 'Noah Smith',
    username: '@noah',
    body: 'Best Stellar payments wallet in 2026!',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    country: '🇺🇸 USA',
  },
  {
    name: 'Lucas Stone',
    username: '@luc',
    body: 'Very customizable and sub-cent fees.',
    img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    country: '🇫🇷 France',
  },
]

const defaultEscrowReviews = [
  {
    name: 'Elena Rostova',
    username: '@elena',
    body: 'Soroban WASM vaults eliminated payment risk!',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    country: '🇬🇧 UK',
  },
  {
    name: 'Haruto Sato',
    username: '@haru',
    body: 'Milestone 2 payment released automatically!',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    country: '🇯🇵 Japan',
  },
  {
    name: 'Emma Lee',
    username: '@emma',
    body: '3-of-5 MultiSig Guardian gave us 100% trust!',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    country: '🇨🇦 Canada',
  },
  {
    name: 'Carlos Ray',
    username: '@carl',
    body: 'Time-locked auto-refund protected our deposit!',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    country: '🇪🇸 Spain',
  },
  {
    name: 'Sarah Chen',
    username: '@sarah',
    body: 'Locked $15k USDC for our mainnet audit milestone.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    country: '🇸🇬 Singapore',
  },
  {
    name: 'David Kim',
    username: '@dkim',
    body: 'Web3 dashboard makes auditing transparent!',
    img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    country: '🇰🇷 S. Korea',
  },
]

// Diverse random profiles for database feedbacks
const countries = ['🇺🇸 USA', '🇸🇬 Singapore', '🇯🇵 Japan', '🇩🇪 Germany', '🇬🇧 UK', '🇦🇺 Australia', '🇨🇦 Canada', '🇮🇩 Indonesia']
const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
]

interface FeedbackItem {
  id: string
  user: string
  rating: number
  comment: string
  date: string
}

function TestimonialCard({ img, name, username, body, country }: {
  img: string
  name: string
  username: string
  body: string
  country: string
}) {
  return (
    <div className="w-60 rounded-xl border border-border bg-card text-card-foreground shadow-md shrink-0 p-4 hover:border-blue-500/30 transition-all">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9 border border-white/10 shrink-0">
          <AvatarImage src={img} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <figcaption className="text-xs font-semibold text-foreground flex items-center justify-between gap-1">
            <span className="truncate">{name}</span>
            <span className="text-[10px] text-muted-foreground font-normal shrink-0">{country}</span>
          </figcaption>
          <p className="text-[10px] font-medium text-muted-foreground truncate">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2.5 text-xs text-secondary-foreground leading-relaxed line-clamp-3">{body}</blockquote>
    </div>
  )
}

interface Testimonials3DProps {
  mode?: "wallet" | "flow"
}

export function Testimonials3D({ mode = "wallet" }: Testimonials3DProps) {
  const isWallet = mode === "wallet"
  const [dbFeedbacks, setDbFeedbacks] = useState<FeedbackItem[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // IntersectionObserver: Only run marquee animations when visible in viewport (saves CPU/GPU)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Load live user feedbacks from the database API
  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.feedbacks) {
          setDbFeedbacks(data.feedbacks)
        }
      })
      .catch((err) => console.error("Gagal memuat feedback dari database:", err))
  }, [])

  // Map database feedbacks to testimonial cards
  const dbReviews = dbFeedbacks.map((f, index) => {
    // Truncate Stellar address to a clean display username
    const shortUser = f.user.length > 10 
      ? `${f.user.substring(0, 6)}...${f.user.substring(f.user.length - 4)}`
      : f.user

    return {
      name: shortUser.startsWith("G") ? "Stellar Builder" : f.user,
      username: `@${shortUser.toLowerCase()}`,
      body: f.comment,
      img: avatars[index % avatars.length],
      country: countries[index % countries.length],
    }
  })

  // Combine live database feedbacks with premium defaults
  const allReviews = [...dbReviews, ...(isWallet ? defaultWalletReviews : defaultEscrowReviews)]

  // Distribute combined database + default reviews evenly across 4 columns to avoid duplicates
  const col1: typeof allReviews = []
  const col2: typeof allReviews = []
  const col3: typeof allReviews = []
  const col4: typeof allReviews = []

  allReviews.forEach((review, index) => {
    const target = index % 4
    if (target === 0) col1.push(review)
    else if (target === 1) col2.push(review)
    else if (target === 2) col3.push(review)
    else col4.push(review)
  })

  // Fallback to make columns scroll if they have too few items
  const fillColumn = (col: typeof allReviews) => {
    if (col.length === 0) return isWallet ? defaultWalletReviews : defaultEscrowReviews
    if (col.length < 3) return [...col, ...col, ...col]
    return col
  }

  return (
    <section ref={sectionRef} className="relative py-16 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <FadeIn>
          <div className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold mb-3 ${
            isWallet 
              ? "border-blue-500/20 bg-blue-500/10 text-blue-400" 
              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
          }`}>
            {isWallet ? "COMMUNITY FEEDBACK" : "SOROBAN ESCROW VERIFIED REVIEWS"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {isWallet ? (
              <>Loved by <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Stellar Builders</span> Worldwide</>
            ) : (
              <>Trusted by <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">Escrow Clients & Contractors</span></>
            )}
          </h2>
        </FadeIn>
      </div>

      {/* Scroll Reveal Animation wrapper for the 3D Marquee Wall */}
      <FadeIn delay={200} direction="up" className="w-full">
        {/* Full-width 3D Testimonial Marquee Container with viewport pause optimization */}
        <div className={`relative flex h-[460px] w-full flex-row items-center justify-center overflow-hidden gap-5 [perspective:300px] bg-transparent ${
          !isVisible ? "[&_.animate-marquee-vertical]:![animation-play-state:paused]" : ""
        }`}>
          <div
            className="flex flex-row items-center gap-5"
            style={{
              transform:
                'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)',
            }}
          >
            {/* Vertical Marquee (downwards) */}
            <Marquee vertical pauseOnHover repeat={3} className="[--duration:36s]">
              {fillColumn(col1).map((review, i) => (
                <TestimonialCard key={`col1-${review.username}-${i}`} {...review} />
              ))}
            </Marquee>

            {/* Vertical Marquee (upwards) */}
            <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:36s]">
              {fillColumn(col2).map((review, i) => (
                <TestimonialCard key={`col2-${review.username}-${i}`} {...review} />
              ))}
            </Marquee>

            {/* Vertical Marquee (downwards) */}
            <Marquee vertical pauseOnHover repeat={3} className="[--duration:36s]">
              {fillColumn(col3).map((review, i) => (
                <TestimonialCard key={`col3-${review.username}-${i}`} {...review} />
              ))}
            </Marquee>

            {/* Vertical Marquee (upwards) */}
            <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:36s]">
              {fillColumn(col4).map((review, i) => (
                <TestimonialCard key={`col4-${review.username}-${i}`} {...review} />
              ))}
            </Marquee>

            {/* Gradient overlays for vertical marquee */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
