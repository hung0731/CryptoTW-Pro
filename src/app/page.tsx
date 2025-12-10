'use client'

import { useLiff } from '@/components/LiffProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Crown, Zap, Activity, ChevronRight, TrendingUp, Sparkles, Send, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const { isLoggedIn, profile } = useLiff()

  return (
    <main className="min-h-screen font-sans bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />

      {/* Header (Minimal) */}
      <header className="absolute top-0 z-50 w-full p-6">
        <div className="container mx-auto flex justify-between items-center">
          <span className="font-bold text-lg tracking-tight text-white">CryptoTW Pro</span>
          {isLoggedIn && profile && (
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-white/20">
                <AvatarImage src={profile.pictureUrl} />
                <AvatarFallback className="bg-neutral-800 text-neutral-400"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative">
        <div className="space-y-8 max-w-xl mx-auto animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>The Alpha Community</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
            CryptoTW <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
              Pro Access
            </span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-sm mx-auto leading-relaxed">
            加入全台最高淨值加密貨幣社群。
            <br />
            解鎖機構級數據、私密觀點與頂級人脈。
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
            {/* Button 1: Add LINE */}
            <a
              href="https://line.me/R/ti/p/@821mnwsw" // Replace with actual Line ID if needed or env
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold h-14 px-8 shadow-[0_0_20px_rgba(6,199,85,0.3)] transition-all hover:scale-105">
                <Send className="mr-2 h-5 w-5" />
                加入官方 LINE
              </Button>
            </a>

            {/* Button 2: Join Pro */}
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-14 px-8 backdrop-blur-sm transition-all hover:scale-105">
                <Crown className="mr-2 h-5 w-5" />
                加入 Pro 會員
              </Button>
            </Link>
          </div>

          {/* Trust / Social Proof */}
          <div className="pt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos or simple text */}
            <div className="text-xs text-neutral-600 font-mono">TRUSTED BY 500+ PRO TRADERS</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-[10px] text-neutral-600">
        © 2024 CryptoTW Pro. All rights reserved.
      </footer>
    </main>
  )
}
