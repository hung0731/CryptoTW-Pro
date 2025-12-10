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
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">⚡️</span>
            <div className="font-bold text-xl tracking-tight text-slate-900">CryptoTW</div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : isLoggedIn && profile ? (
              <Link href="/profile">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-1.5 pr-3 rounded-full transition-all">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={profile.pictureUrl} alt={profile.displayName} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  {/* Status Indicator */}
                  <div className={`h-2.5 w-2.5 rounded-full ${dbUser?.membership_status === 'pro' ? 'bg-primary shadow-sm' : 'bg-slate-300'}`} />
                </div>
              </Link>
            ) : (
              <Button size="sm" className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Line 登入
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden mb-8 bg-white border-b border-slate-100">
        <div className="container px-4 py-12 relative">
          {/* Welcome / Status */}
          {!isLoading && !isLoggedIn ? (
            <div className="text-center py-6 space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
                加入 Alpha <span className="text-primary">核心圈 🚀</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                解鎖即時加密貨幣洞察、精選空投資訊與關鍵市場信號。
                <br /><span className="font-semibold text-slate-900">透過交易所綁定，完全免費。</span>
              </p>
              <div className="pt-4">
                <Button onClick={handleLogin} size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base shadow-sm">
                  使用 LINE 連接 💬
                </Button>
              </div>
            </div>
          ) : isLoggedIn && dbUser && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
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
                      <Badge variant="default" className="bg-primary text-primary-foreground border-0 shadow-sm hover:bg-primary/90">PRO</Badge>
                    )}
                  </div>
                </div>

                {dbUser.membership_status !== 'pro' && (
                  <Link href="/register" className="w-full md:w-auto">
                    <Button size="lg" className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
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
              <span className="bg-slate-100 p-1.5 rounded-lg text-lg">📰</span> 今日快訊
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
              {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-md" />)}
            </div>
          ) : content.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground bg-white border-dashed border-2">
              😴 暫無更新，市場休息中...
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
              {content.map((item: any) => (
                <Card key={item.id} className="flex flex-row w-full gap-0 rounded-md shadow-sm overflow-hidden py-0 border-slate-200 group hover:shadow-md transition-all">
                  <div className={`flex w-16 shrink-0 items-center justify-center text-xl font-bold ${item.type === 'alpha' ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-500'}`}>
                    {item.type === 'alpha' ? 'α' : '📰'}
                  </div>
                  <CardContent className="flex flex-1 items-center justify-between truncate p-0 bg-white">
                    <div className="flex-1 truncate px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.type === 'alpha' && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary">ALPHA</Badge>}
                      </div>
                      <h3 className="font-medium text-slate-900 truncate group-hover:text-primary transition-colors text-base">
                        {item.title}
                      </h3>
                      {item.access_level === 'pro' && dbUser?.membership_status !== 'pro' ? (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> 限 Pro 會員查看
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {item.body}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pr-3">
                      {item.access_level === 'pro' && dbUser?.membership_status !== 'pro' ? (
                        <Link href="/register">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100">
                            <Crown className="h-4 w-4 text-slate-400" />
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100">
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Activities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="bg-slate-100 p-1.5 rounded-lg text-lg">🎁</span> 獨家空投活動
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
            {loadingData ? (
              [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-md" />)
            ) : activities.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                🤷‍♂️ 目前沒有進行中的活動。
              </div>
            ) : (
              activities.map((act: any) => (
                <Card key={act.id} className="flex flex-row w-full gap-0 rounded-md shadow-sm overflow-hidden py-0 border-slate-200 group hover:shadow-md transition-all">
                  <div className="flex w-16 shrink-0 items-center justify-center bg-slate-900 text-white text-xs font-bold p-1 text-center break-words leading-tight">
                    {act.exchange_name.toUpperCase().slice(0, 4)}
                  </div>
                  <CardContent className="flex flex-1 items-center justify-between truncate p-0 bg-white">
                    <div className="flex-1 truncate px-4 py-3">
                      <h3 className="font-medium text-slate-900 truncate text-base group-hover:text-primary transition-colors">
                        {act.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {act.description}
                      </p>
                    </div>

                    <div className="shrink-0 pr-3">
                      {dbUser?.membership_status === 'pro' ? (
                        <a href={act.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => handleTrackClick(act)}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                            <Activity className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Link href="/register">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400">
                            <Crown className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
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

