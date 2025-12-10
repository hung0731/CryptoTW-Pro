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
  const { isLoggedIn, profile, dbUser, isLoading, liffObject } = useLiff()
  const [content, setContent] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const handleLogin = () => {
    if (!liffObject) return
    liffObject.login()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cx, ax] = await Promise.all([
          fetch('/api/content').then(r => r.json()),
          fetch('/api/activities').then(r => r.json())
        ])
        if (cx.content) setContent(cx.content)
        if (ax.activities) setActivities(ax.activities)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  return (
    <main className="min-h-screen font-sans pb-20 bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container h-16 flex items-center justify-between px-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">CryptoTW</span>
          </div>

          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full bg-neutral-800" />
            ) : isLoggedIn && profile ? (
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-white/20">
                  <AvatarImage src={profile.pictureUrl} />
                  <AvatarFallback className="bg-neutral-800 text-neutral-400"><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button onClick={handleLogin} size="sm" className="rounded-full bg-white text-black hover:bg-neutral-200 px-4 font-medium h-8 text-xs transition-colors">
                登入
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container px-6 py-12 max-w-5xl mx-auto space-y-16">

        {/* Hero Section */}
        <section className="space-y-6 text-center max-w-2xl mx-auto pt-8">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            為高淨值交易者 <br />
            <span className="text-neutral-500">打造的 Alpha 資訊平台</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed">
            我們協助您過濾雜訊，鎖定真正具有價值的市場機會。
          </p>

          {!isLoggedIn && (
            <div className="pt-4 flex justify-center">
              <Button onClick={handleLogin} size="lg" className="rounded-full px-8 bg-white text-black hover:bg-neutral-200 h-12 text-sm font-medium shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
                開始使用 (LINE)
              </Button>
            </div>
          )}
        </section>

        {/* Feature Cards (Bento Grid) - OpenAI Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Alpha Content - Large Card */}
          <Link href="#news" className="col-span-2 row-span-2 group relative overflow-hidden rounded-2xl bg-neutral-900/50 border border-white/5 p-6 md:p-8 hover:bg-neutral-900 hover:border-white/10 transition-all duration-300">
            <div className="relative h-full flex flex-col justify-between z-10 space-y-8">
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Alpha 核心圈</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  每日精選的加密貨幣洞察與鏈上數據分析，為您節省 90% 的研究時間。
                </p>
              </div>
            </div>
          </Link>

          {/* VIP Program */}
          <Link href="/vip" className="col-span-1 row-span-2 group relative overflow-hidden rounded-2xl bg-neutral-900/50 border border-white/5 p-6 hover:bg-neutral-900 hover:border-white/10 transition-all duration-300">
            <div className="relative h-full flex flex-col justify-between z-10 space-y-8">
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-white mb-1">VIP 通道</h3>
                <p className="text-neutral-400 text-xs">專屬經理與機構費率。</p>
              </div>
            </div>
          </Link>

          {/* Exchange Offers */}
          <Link href="/register" className="col-span-1 group rounded-2xl bg-neutral-900/50 border border-white/5 p-5 flex flex-col justify-between hover:bg-neutral-900 hover:border-white/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">交易所優惠</h3>
            </div>
          </Link>

          {/* Community */}
          <a href="https://line.me/ti/g2/YOUR_GROUP_LINK" target="_blank" className="col-span-1 group rounded-2xl bg-neutral-900/50 border border-white/5 p-5 flex flex-col justify-between hover:bg-neutral-900 hover:border-white/10 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
                <Send className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">社群討論</h3>
            </div>
          </a>
        </div>

        {/* Dynamic Sections */}
        <div className="grid lg:grid-cols-2 gap-12 pt-8 border-t border-white/5" id="news">

          {/* Latest News */}
          <section className="space-y-6">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
              Latest Insights
            </h2>

            <div className="space-y-0 divide-y divide-white/5">
              {loadingData ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-none bg-neutral-900" />
                  <Skeleton className="h-16 w-full rounded-none bg-neutral-900" />
                </div>
              ) : content.length === 0 ? (
                <div className="text-neutral-600 text-sm py-8">暫無快訊</div>
              ) : (
                content.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="group py-4 hover:bg-white/5 transition-colors -mx-4 px-4 rounded-xl cursor-default">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      {item.type === 'alpha' && <span className="text-[10px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">PRO</span>}
                    </div>
                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{item.body}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Activities */}
          <section className="space-y-6">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
              Events
            </h2>

            <div className="space-y-3">
              {loadingData ? (
                <Skeleton className="h-24 w-full rounded-xl bg-neutral-900" />
              ) : activities.length === 0 ? (
                <div className="text-neutral-600 text-sm py-8">暫無活動</div>
              ) : (
                activities.map((act: any) => (
                  <div key={act.id} className="bg-neutral-900/30 rounded-xl p-4 border border-white/5 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="h-8 w-8 shrink-0 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-400 border border-white/5">
                        {act.exchange_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-white truncate text-sm">{act.title}</h4>
                        <p className="text-xs text-neutral-500 truncate">{act.description}</p>
                      </div>
                    </div>
                    <a href={act.url} target="_blank" className="text-white hover:text-blue-400 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
