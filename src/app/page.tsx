'use client'

import { useLiff } from '@/components/LiffProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogIn, User, Crown, Zap, Activity, ChevronRight, TrendingUp, Sparkles, Send } from 'lucide-react'
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
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container h-16 flex items-center justify-between px-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">CryptoTW</span>
          </div>

          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : isLoggedIn && profile ? (
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-slate-100">
                  <AvatarImage src={profile.pictureUrl} />
                  <AvatarFallback className="bg-slate-200 text-slate-600"><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button onClick={handleLogin} size="sm" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-4 font-medium">
                登入
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container px-6 py-8 max-w-5xl mx-auto space-y-12">

        {/* Hero & Feature Grid */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              掌握市場脈動 <span className="text-slate-400">/ 領先一步</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              專為高淨值交易者打造的 Alpha 資訊聚合平台。
            </p>
          </div>

          {!isLoggedIn && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">立即加入核心圈</h3>
                <p className="text-slate-500 text-sm">解鎖所有 Alpha 資訊與 VIP 權限，完全免費。</p>
              </div>
              <Button onClick={handleLogin} size="lg" className="rounded-xl px-8 bg-[#06C755] hover:bg-[#05b34c] text-white shadow-sm w-full md:w-auto font-bold tracking-wide">
                LINE 一鍵登入
              </Button>
            </div>
          )}

          {/* Feature Cards (Bento Grid) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Alpha Content */}
            <Link href="#news" className="col-span-2 row-span-2 group relative overflow-hidden rounded-3xl bg-slate-900 p-6 md:p-8 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-32 w-32 -rotate-12" />
              </div>
              <div className="relative h-full flex flex-col justify-between z-10 space-y-4">
                <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Alpha 核心圈</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">即時加密貨幣洞察、鏈上數據分析與潛力項目追蹤。</p>
                </div>
              </div>
            </Link>

            {/* VIP Program */}
            <Link href="/vip" className="col-span-1 row-span-2 group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 shadow-sm transition-all hover:border-amber-400/50 hover:shadow-md hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col justify-between z-10 space-y-4">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">VIP 通道</h3>
                  <p className="text-slate-500 text-xs">專屬客戶經理與機構級費率。</p>
                </div>
              </div>
            </Link>

            {/* Exchange Offers */}
            <Link href="/register" className="col-span-1 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-blue-400/50 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">交易所優惠</h3>
              </div>
            </Link>

            {/* Community (Placeholder) */}
            <a href="https://line.me/ti/g2/YOUR_GROUP_LINK" target="_blank" className="col-span-1 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-green-400/50 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <Send className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-green-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">社群討論</h3>
              </div>
            </a>

          </div>
        </section>

        {/* Dynamic Sections */}
        <div className="grid lg:grid-cols-2 gap-12" id="news">

          {/* Latest News */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-slate-900 rounded-full" /> 最新快訊
            </h2>

            <div className="space-y-4">
              {loadingData ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : content.length === 0 ? (
                <div className="text-slate-400 text-sm py-4">暫無快訊</div>
              ) : (
                content.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4">
                    <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold ${item.type === 'alpha' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {item.type === 'alpha' ? 'α' : 'News'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.type === 'alpha' && <span className="text-[10px] font-bold text-amber-500">PRO ONLY</span>}
                      </div>
                      <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">{item.body || '點擊查看詳情...'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Activities */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-slate-900 rounded-full" /> 精選活動
            </h2>

            <div className="space-y-4">
              {loadingData ? (
                <Skeleton className="h-32 w-full rounded-2xl" />
              ) : activities.length === 0 ? (
                <div className="text-slate-400 text-sm py-4">暫無活動</div>
              ) : (
                activities.map((act: any) => (
                  <div key={act.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="h-10 w-10 shrink-0 bg-slate-50 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-100">
                        {act.exchange_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{act.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{act.description}</p>
                      </div>
                    </div>
                    <a href={act.url} target="_blank" className="shrink-0 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
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
