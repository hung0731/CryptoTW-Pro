'use client'

import { useLiff } from '@/components/LiffProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogIn, User, Crown, Activity } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react' // Added useState and useEffect

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

  const handleTrackClick = (act: any) => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exchange_name: act.exchange_name,
        activity_id: act.id,
        event_type: 'click',
        user_id: dbUser?.id
      })
    }).catch(console.error)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-20">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡️</span>
            <div className="font-bold text-xl tracking-tight text-slate-900">CryptoTW</div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : isLoggedIn && profile ? (
              <Link href="/profile">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-1.5 pr-3 rounded-full transition-all border border-transparent hover:border-slate-100">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={profile.pictureUrl} alt={profile.displayName} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  {/* Status Indicator */}
                  <div className={`h-2.5 w-2.5 rounded-full ${dbUser?.membership_status === 'pro' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
                </div>
              </Link>
            ) : (
              <Button size="sm" className="rounded-full font-semibold shadow-lg shadow-primary/20" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Line 登入
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 -skew-y-3 origin-top-left transform translate-y-[-50%]" />
        <div className="container px-4 py-8 relative">
          {/* Welcome / Status */}
          {!isLoading && !isLoggedIn ? (
            <div className="text-center py-10 space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
                加入 Alpha <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">核心圈 🚀</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                解鎖即時加密貨幣洞察、精選空投資訊與關鍵市場信號。
                <br /><span className="font-semibold text-slate-700">透過交易所綁定，完全免費。</span>
              </p>
              <div className="pt-4">
                <Button onClick={handleLogin} size="lg" className="rounded-full px-8 shadow-xl shadow-primary/30 h-12 text-base">
                  使用 LINE 連接 💬
                </Button>
              </div>
            </div>
          ) : isLoggedIn && dbUser && (
            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg text-slate-500 font-medium mb-1">歡迎回來，{profile?.displayName} 👋</h2>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      {dbUser.membership_status === 'pro' ? 'Alpha 指揮官 💎' : '探索者 🌱'}
                    </h1>
                    {dbUser.membership_status === 'pro' && (
                      <Badge variant="default" className="bg-gradient-to-r from-amber-400 to-orange-500 border-0 shadow-md">PRO</Badge>
                    )}
                  </div>
                </div>

                {dbUser.membership_status !== 'pro' && (
                  <Link href="/register" className="w-full md:w-auto">
                    <Button size="lg" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20">
                      解鎖 Alpha 權限 🔓
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container px-4 space-y-10">

        {/* Dynamic Content Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded-lg text-lg">📰</span> 今日快訊
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">即時</span>
            </div>
          </div>

          {loadingData ? (
            <div className="grid gap-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
            </div>
          ) : content.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground bg-white/50 border-dashed border-2">
              😴 暫無更新，市場休息中...
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {content.map((item: any) => (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white/80 backdrop-blur-sm">
                  <div className={`h-1.5 w-full ${item.type === 'alpha' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`} />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`${item.type === 'alpha' ? 'text-red-600 bg-red-50 border-red-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                        {item.type === 'alpha' ? '🔥 ALPHA' : '🗞 新聞'}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 leading-relaxed">
                    {item.access_level === 'pro' && dbUser?.membership_status !== 'pro' ? (
                      <div className="relative p-4 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                        <div className="blur-sm select-none opacity-50">
                          {item.body.substring(0, 80)}... <br />
                          深入的市場觀點隱藏於此...
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[2px]">
                          <Crown className="w-8 h-8 text-amber-500 mb-2 drop-shadow-md" />
                          <Badge className="bg-slate-900 border-0 pointer-events-none">限 Pro 會員 🔒</Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{item.body}</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    {item.access_level === 'pro' && dbUser?.membership_status !== 'pro' ? (
                      <Link href="/register" className="w-full">
                        <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold group-hover:translate-x-1 transition-transform">
                          解鎖權限 <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="w-full flex justify-end">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          閱讀全文 <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Activities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="bg-purple-100 p-1.5 rounded-lg text-lg">🎁</span> 獨家空投活動
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingData ? (
              [1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
            ) : activities.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                🤷‍♂️ 目前沒有進行中的活動。
              </div>
            ) : (
              activities.map((act: any) => (
                <Card key={act.id} className="bg-slate-900 text-white border-slate-800 overflow-hidden relative group hover:ring-2 hover:ring-primary/50 transition-all">
                  {/* Abstract BG Shape */}
                  <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />

                  <CardContent className="pt-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/10 backdrop-blur-md">
                        {act.exchange_name.toUpperCase()}
                      </Badge>
                      <Activity className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 leading-tight">{act.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{act.description}</p>

                    {dbUser?.membership_status === 'pro' ? (
                      <a href={act.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => handleTrackClick(act)}>
                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-lg shadow-lg hover:shadow-white/10 transition-all transform hover:-translate-y-0.5">
                          立即領取 🚀
                        </Button>
                      </a>
                    ) : (
                      <Link href="/register">
                        <Button variant="secondary" className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700">
                          綁定以領取 🔒
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

// Additional imports needed for the newly added icons
import { ChevronRight, ArrowRight } from 'lucide-react'

