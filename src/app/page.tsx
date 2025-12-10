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
    // Fire and forget
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="font-bold text-xl tracking-tight text-slate-900">CryptoTW</div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : isLoggedIn && profile ? (
              <Link href="/profile">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-sm font-medium hidden sm:inline-block">{profile.displayName}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.pictureUrl} alt={profile.displayName} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                </div>
              </Link>
            ) : (
              <Button size="sm" variant="ghost" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        {/* Helper for Dev/Testing if not in LINE */}
        {!isLoading && !isLoggedIn && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800 mb-4">
                Detailed market insights and exclusive alpha await. Sign in with LINE to access.
              </p>
              <Button onClick={handleLogin} className="w-full bg-[#00B900] hover:bg-[#009900]">
                Login with LINE
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Membership Status Card */}
        {isLoggedIn && dbUser && (
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Your Status</CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">
                  {dbUser.membership_status === 'pro' ? 'Alpha Member' : 'Free Member'}
                </span>
                {dbUser.membership_status === 'pro' ? (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600"><Crown className="w-3 h-3 mr-1" /> PRO</Badge>
                ) : (
                  <Badge variant="secondary">Basic</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbUser.membership_status !== 'pro' && (
                <p className="text-sm text-muted-foreground">
                  Register an exchange account to unlock full Alpha access and exclusive airdrops.
                </p>
              )}
            </CardContent>
            {dbUser.membership_status !== 'pro' && (
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button className="w-full">Unlock Alpha Access</Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        )}

        {/* Dynamic Content Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Today's Brief</h2>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>

          {loadingData ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : content.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">No content updates today.</Card>
          ) : (
            content.map((item: any) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className="mb-2" variant={item.type === 'alpha' ? 'destructive' : 'secondary'}>
                      {item.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {/* Protection Logic: If requires Pro and not pro, blur/truncate */}
                  {item.access_level === 'pro' && dbUser?.membership_status !== 'pro' ? (
                    <div className="relative">
                      <p className="blur-sm select-none">{item.body.substring(0, 50)}...</p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="outline" className="bg-white/90 backdrop-blur">Pro Only</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{item.body}</p>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  {item.access_level === 'pro' && dbUser?.membership_status !== 'pro' ? (
                    <Link href="/register" className="w-full">
                      <div className="text-xs text-primary font-medium cursor-pointer flex items-center">
                        <Crown className="w-3 h-3 mr-1" /> Unlock for full access
                      </div>
                    </Link>
                  ) : (
                    <div className="text-xs text-muted-foreground">read more</div>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </section>

        {/* Dynamic Activities */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Exclusive Events</h2>
          <div className="grid gap-4">
            {loadingData ? (
              <Skeleton className="h-32 w-full" />
            ) : activities.length === 0 ? (
              <span className="text-sm text-muted-foreground">No active events.</span>
            ) : (
              activities.map((act: any) => (
                <Card key={act.id} className="bg-slate-900 text-white border-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        {act.exchange_name.toUpperCase()}
                      </Badge>
                      <Activity className="h-5 w-5 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{act.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{act.description}</p>

                    {dbUser?.membership_status === 'pro' ? (
                      <a href={act.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => handleTrackClick(act)}>
                        <Button variant="secondary" className="w-full">View Details</Button>
                      </a>
                    ) : (
                      <Link href="/register">
                        <div className="p-3 bg-slate-800 rounded text-center text-sm text-slate-400 hover:bg-slate-700 cursor-pointer">
                          Bind Exchange to View
                        </div>
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
