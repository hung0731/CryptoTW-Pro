'use client'

import { useLiff } from '@/components/LiffProvider'
import { Button } from '@/components/ui/button'
import { User, Zap, Send } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense, useEffect } from 'react'

function HomeContent() {
  const { isLoggedIn, profile } = useLiff()
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectPath = searchParams.get('path')

  // Performance Optimization & Fail-safe Redirect
  // If there is a redirect path, show a loader and FORCE redirect immediately.
  useEffect(() => {
    if (redirectPath) {
      // Decode URI component just in case, though usually processed by next
      const target = decodeURIComponent(redirectPath)
      console.log('Force redirecting to:', target)
      router.replace(target)
    }
  }, [redirectPath, router])

  if (redirectPath) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        <p className="text-sm text-neutral-500 font-mono animate-pulse">Redirecting...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen font-sans bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-10 w-full max-w-sm">

        {/* Minimized Logo Section */}
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute -inset-4 bg-purple-500/20 blur-xl rounded-full" />
            <img src="/logo.svg" alt="CryptoTW" className="h-20 w-auto relative drop-shadow-2xl" />
          </div>
          {/* Simple Text Logo if needed, or just keep the image clean */}
          <span className="text-2xl font-bold italic tracking-tighter text-neutral-200">
            CryptoTW <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-purple-400">Pro</span>
          </span>
        </div>

        {/* Single CTA Button */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <a
            href="https://lin.ee/cQQ52w9"
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <Button
              size="lg"
              className="w-full rounded-full bg-white text-black hover:bg-neutral-200 font-bold h-12 text-sm tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
            >
              <Send className="mr-2 h-4 w-4" />
              立即加入 LINE
            </Button>
          </a>
        </div>

      </div>
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
