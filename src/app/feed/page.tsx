'use client'

import { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Bell, Zap, FileText, Lock } from 'lucide-react'
import Link from 'next/link'

export default function FeedPage() {
    const { isLoggedIn, profile } = useLiff()
    const [activities, setActivities] = useState<any[]>([])
    const [content, setContent] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [actRes, contRes] = await Promise.all([
                    fetch('/api/activities').then(r => r.json()),
                    fetch('/api/content').then(r => r.json())
                ])
                if (actRes.activities) setActivities(actRes.activities)
                if (contRes.content) setContent(contRes.content)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <main className="min-h-screen font-sans bg-black text-white pb-24">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-white" fill="currentColor" />
                    <span className="font-bold tracking-tight">Alpha Feed</span>
                </div>
                {profile && (
                    <Link href="/profile">
                        <img src={profile.pictureUrl} alt="Profile" className="w-8 h-8 rounded-full ring-1 ring-white/20" />
                    </Link>
                )}
            </header>

            <div className="p-4 space-y-8 max-w-md mx-auto">

                {/* Market Activities (Signals) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Market Signals</h2>
                        <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">Live</Badge>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full bg-neutral-900" />
                            <Skeleton className="h-24 w-full bg-neutral-900" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="p-8 text-center border border-white/5 rounded-xl bg-neutral-900/50">
                            <Zap className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
                            <p className="text-neutral-500 text-sm">暫無市場訊號</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.map((act) => (
                                <Card key={act.id} className="bg-neutral-900 border-white/5 overflow-hidden group">
                                    <CardContent className="p-4 flex items-start gap-4 relaltive">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${act.is_active ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{act.title}</h3>
                                                <span className="text-[10px] text-neutral-600 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">{act.exchange_name}</span>
                                            </div>
                                            <p className="text-sm text-neutral-400 leading-relaxed">{act.description}</p>
                                            {act.url && (
                                                <a href={act.url} target="_blank" className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 mt-2 font-medium">
                                                    查看詳情 <ArrowRight className="h-3 w-3 ml-1" />
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Exclusive Research (Content) */}
                <section className="space-y-4 pb-12">
                    <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Research & Alpha</h2>

                    {loading ? (
                        <Skeleton className="h-40 w-full bg-neutral-900" />
                    ) : content.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
                            <p className="text-neutral-500 text-sm">即將發布</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {content.map((item) => (
                                <Link href={`/content/${item.id}`} key={item.id} className="block group">
                                    <Card className="bg-transparent border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.02]">
                                        {item.thumbnail_url && (
                                            <div className="aspect-video w-full bg-neutral-900 relative overflow-hidden rounded-t-lg">
                                                <img src={item.thumbnail_url} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                                {!item.is_public && (
                                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1 border border-yellow-500/20">
                                                        <Lock className="w-3 h-3" /> PRO ONLY
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="bg-white/10 text-neutral-300 hover:bg-white/20 text-[10px] h-5 rounded-sm">{item.category || 'Alpha'}</Badge>
                                                <span className="text-[10px] text-neutral-500 self-center">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors leading-snug">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-neutral-400 line-clamp-2">
                                                {item.summary || item.content.substring(0, 100)}...
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    )
}
