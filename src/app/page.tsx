'use client'

import { useLiff } from '@/components/LiffProvider'
import { Button } from '@/components/ui/button'
import { User, Zap, Send } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function HomeContent() {
  const { isLoggedIn, profile } = useLiff()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('path')

  // Performance Optimization: 
  // If there is a redirect path, show a loader immediately instead of the landing page.
  // This prevents the "Flash of Landing Page" during client-side redirects (RouteHandler).
  // Ideally middleware handles this, but this is a fail-safe for perceived speed.
  if (redirectPath) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        <p className="text-sm text-neutral-500 font-mono animate-pulse">Redirecting...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen font-sans bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-white/[0.03] blur-3xl rounded-full pointer-events-none" />

      {/* Header (Minimal) */}
      <header className="absolute top-0 z-50 w-full p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Small Logo for Brand Presence */}
          <img src="/logo.svg" alt="CryptoTW" className="h-6 w-auto opacity-80" />

          {isLoggedIn && profile && (
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-white/20 hover:ring-white/50 transition-all">
                <AvatarImage src={profile.pictureUrl} />
                <AvatarFallback className="bg-neutral-800 text-neutral-400"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative space-y-8">

        {/* Logo / Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur-sm animate-in fade-in zoom-in duration-1000">
          <Zap className="w-3 h-3 text-white" fill="currentColor" />
          ALPHA COMMUNITY
        </div>

        {/* Logo */}
        <div className="animate-in fade-in zoom-in duration-1000 flex items-center justify-center gap-2">
          <img src="/logo.svg" alt="CryptoTW" className="h-24 w-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]" />
          <span className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-purple-400 pb-2">
            Pro
          </span>
        </div>

        {/* Hero Title (Optional, keeping purely visual logo might be cleaner, but user asked to PUT logo) */}
        {/* <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          CryptoTW Pro
        </h1> */}

        {/* Single CTA Button */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 w-full max-w-xs">
          <a
            href="https://lin.ee/cQQ52w9"
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <Button
              size="lg"
              className="w-full rounded-full bg-white text-black hover:bg-neutral-200 font-bold h-14 text-base shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
            >
              <Send className="mr-2 h-5 w-5" />
              立即加入 LINE 加入 Pro 會員
            </Button>
          </a>
        </div>

      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-[10px] text-neutral-700 font-mono tracking-widest uppercase opacity-50">
          Member Only Access
        </p>
      </footer>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
