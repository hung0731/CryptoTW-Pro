'use client'

import { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Lock, ChevronRight, UserPlus, Link as LinkIcon, CheckCircle, Newspaper, BookOpen, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'
import { ProAccessGate } from '@/components/ProAccessGate'
import { cn } from '@/lib/utils'

export default function FeedPage() {
    const { isLoggedIn, profile, dbUser, isLoading: isAuthLoading } = useLiff()
    const [activities, setActivities] = useState<any[]>([])
    const [content, setContent] = useState<any[]>([])
    const [dataLoading, setDataLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    // Fetch Data only if authorized
    useEffect(() => {
        if (isAuthLoading) return

        const status = dbUser?.membership_status as string
        const isPro = status === 'pro' || status === 'lifetime'

        if (isPro) {
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
                    setDataLoading(false)
                }
            }
            fetchData()
        } else {
            setDataLoading(false)
        }
    }, [isAuthLoading, dbUser])

    // 1. Loading State
    const loadingStatus = dbUser?.membership_status as string
    if (isAuthLoading || (dataLoading && (loadingStatus === 'pro' || loadingStatus === 'lifetime'))) {
        return (
            <div className="min-h-screen bg-black p-4 space-y-8">
                <Skeleton className="h-12 w-full bg-neutral-900" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 bg-neutral-900" />
                    <Skeleton className="h-8 w-16 bg-neutral-900" />
                    <Skeleton className="h-8 w-16 bg-neutral-900" />
                </div>
                <Skeleton className="h-40 w-full bg-neutral-900" />
            </div>
        )
    }

    // 2. Non-Member State (Join Guide)
    const currentStatus = dbUser?.membership_status as string
    const hasAccess = currentStatus === 'pro' || currentStatus === 'lifetime'

    if (!hasAccess) {
        return <ProAccessGate />
    }

    // 3. Pro Member State (Feed)
    const categories = [
        { id: 'all', label: '全部' },
        { id: 'news', label: '快訊' },
        { id: 'alpha', label: '深度 / 原創' },
        { id: 'weekly', label: '週報' },
    ]

    const filteredContent = activeTab === 'all'
        ? content
        : content.filter(c => c.type === activeTab)

    return (
        <main className="min-h-screen font-sans bg-black text-white pb-24">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center justify-start"></div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="CryptoTW" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        {profile && (
                            <Link href="/profile">
                                <img src={profile.pictureUrl} alt="Profile" className="w-8 h-8 rounded-full ring-1 ring-white/20" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Category Filter Pills (Scrollable) */}
                <div className="w-full overflow-x-auto no-scrollbar px-4 pb-3 max-w-lg mx-auto">
                    <div className="flex space-x-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
                                    activeTab === cat.id
                                        ? "bg-white text-black"
                                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="mt-6 px-4 space-y-8 max-w-lg mx-auto min-h-screen">

                {/* Always show activities unless specific tab logic requires hiding (Usually kept on top) */}
                <MarketActivities activities={activities} />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">最新內容</h2>
                    </div>
                    <ContentList items={filteredContent} />
                </div>
            </div>

            <BottomNav />
        </main>
    )
}

function MarketActivities({ activities }: { activities: any[] }) {
    if (activities.length === 0) return null
    return (
        <section className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">交易信號</h2>
                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">即時</Badge>
            </div>
            <div className="space-y-3">
                {activities.map((act) => (
                    <Card key={act.id} className="bg-neutral-900 border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${act.is_active ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">{act.title}</h3>
                                    <span className="text-[10px] text-neutral-500 font-mono uppercase bg-black px-2 py-0.5 rounded border border-white/5">{act.exchange_name}</span>
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed">{act.description}</p>
                                {act.url && (
                                    <a href={act.url} target="_blank" className="inline-flex items-center text-[10px] text-blue-400 hover:text-blue-300 mt-2 font-medium">
                                        查看詳情 <ArrowRight className="h-3 w-3 ml-1" />
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

function ContentList({ items }: { items: any[] }) {
    if (items.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-neutral-900/50">
                <p className="text-neutral-500 text-sm">暫無內容</p>
            </div>
        )
    }
    return (
        <div className="grid gap-4 pb-12">
            {items.map((item) => (
                <Link href={`/content/${item.id}`} key={item.id} className="block group">
                    <Card className="bg-neutral-900/50 border-white/5 hover:border-white/20 transition-all hover:bg-neutral-900 overflow-hidden">
                        {item.thumbnail_url && (
                            <div className="aspect-video w-full bg-neutral-950 relative overflow-hidden text-neutral-800">
                                <img src={item.thumbnail_url} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                {!item.is_public && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1 border border-yellow-500/20">
                                        <Lock className="w-3 h-3" /> PRO 限定
                                    </div>
                                )}
                            </div>
                        )}
                        <CardContent className="p-4 space-y-3">
                            <div className="flex gap-2 items-center">
                                <Badge variant="secondary" className="bg-white/5 text-neutral-400 hover:bg-white/10 text-[10px] h-5 rounded px-1.5 font-normal tracking-wide">{item.type?.toUpperCase() || 'ARTICLE'}</Badge>
                                <span className="text-[10px] text-neutral-600 self-center">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors leading-snug">
                                {item.title}
                            </h3>
                            <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                                {item.summary || item.content?.substring(0, 100)}...
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
