'use client'

import { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Lock, ChevronRight, UserPlus, Link as LinkIcon, CheckCircle, Newspaper, BookOpen, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeedPage() {
    const { isLoggedIn, profile, dbUser, isLoading: isAuthLoading } = useLiff()
    const [activities, setActivities] = useState<any[]>([])
    const [content, setContent] = useState<any[]>([])
    const [dataLoading, setDataLoading] = useState(true)

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
        return (
            <main className="min-h-screen font-sans bg-black text-white flex flex-col">
                {/* Header */}
                <header className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" fill="currentColor" />
                        <span className="font-bold tracking-tight">Access Restricted</span>
                    </div>
                    {profile && (
                        <img src={profile.pictureUrl} alt="Profile" className="w-8 h-8 rounded-full ring-1 ring-white/20 opacity-50" />
                    )}
                </header>

                <div className="flex-1 px-6 pb-12 flex flex-col justify-center max-w-md mx-auto w-full space-y-10">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tighter">
                            解鎖 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600">Pro 會員</span>
                        </h1>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            您目前尚無瀏覽權限。<br />
                            請完成以下步驟加入全台最高淨值社群。
                        </p>
                    </div>
                    <div className="space-y-4 relative">
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-neutral-800 -z-10" />
                        {[
                            {
                                icon: <UserPlus className="w-5 h-5" />,
                                title: "註冊交易所",
                                desc: "使用我們的推薦連結註冊指定交易所。",
                                action: "前往註冊",
                                link: "/register"
                            },
                            {
                                icon: <LinkIcon className="w-5 h-5" />,
                                title: "綁定 UID",
                                desc: "提交您的交易所 UID 進行驗證。",
                                action: "前往綁定",
                                link: "/profile"
                            },
                            {
                                icon: <CheckCircle className="w-5 h-5" />,
                                title: "等待審核",
                                desc: "管理員將於 24 小時內開通您的權限。",
                                action: null,
                                link: null
                            }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-black ${i === 2 ? 'bg-neutral-800 text-neutral-500' : 'bg-yellow-500 text-black'}`}>
                                    {step.icon}
                                </div>
                                <div className="pb-6">
                                    <h3 className="font-bold text-lg">{step.title}</h3>
                                    <p className="text-sm text-neutral-400 mt-1 mb-3">{step.desc}</p>
                                    {step.action && (
                                        <Link href={step.link!}>
                                            <Button size="sm" variant="outline" className="h-8 rounded-full border-white/20 bg-transparent hover:bg-white/10 text-xs">
                                                {step.action} <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        )
    }

    // 3. Pro Member State (Feed)
    // Filtering Helper
    const getFilteredContent = (type: string) => {
        if (type === 'all') return content
        return content.filter(c => c.type === type)
    }

    return (
        <main className="min-h-screen font-sans bg-black text-white pb-24">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="grid grid-cols-3 items-center px-4 h-14">
                    <div className="flex items-center justify-start">
                        {/* Left Slot */}
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="CryptoTW" className="h-5 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        {profile && (
                            <Link href="/profile">
                                <img src={profile.pictureUrl} alt="Profile" className="w-8 h-8 rounded-full ring-1 ring-white/20" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabs - Inside Header to keep sticky */}
                <div className="px-4 pb-0">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start overflow-x-auto no-scrollbar border-b border-transparent">
                            <TabsTrigger value="all" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                全部
                            </TabsTrigger>
                            <TabsTrigger value="news" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                快訊
                            </TabsTrigger>
                            <TabsTrigger value="alpha" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                深度 / 原創
                            </TabsTrigger>
                            <TabsTrigger value="weekly" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                週報
                            </TabsTrigger>
                        </TabsList>

                        {/* Tabs Content - Move outside header if you want content to scroll UNDER header, 
                            BUT Tabs component structure usually wraps content. 
                            If we keep content inside Tabs, the whole Tabs component is in Header which is wrong for scrolling.
                            
                            Refactoring: We need to lift state up or use TabsPrimitive correctly to separate List and Content.
                            OR just render TabsContent OUTSIDE header.
                            
                            Let's separate standard Tabs usage.
                        */}
                    </Tabs>
                </div>
            </header>

            {/* Main Content Area - Re-implementing Tabs manually or using context if feasible. 
                Radix Tabs usually requires all in one Root. 
                To fix this, we will wrap the whole page in Tabs Root, put List in Header, and Content in Main.
            */}
            <Tabs defaultValue="all" className="w-full">
                {/* Re-declaring Tabs List in fixed header requires matching Root. 
                     Actually simpler: Keep Header sticky, put TabsList inside it. 
                     But TabsContent must be outside header to scroll.
                     
                     Solution: 
                     Wrap <main> in <Tabs>. 
                     Header contains <TabsList>.
                     Container contains <TabsContent>.
                 */}
            </Tabs>

            {/* 
               Correct approach for Sticky Header + Scrollable Content with Radix Tabs:
               1. Root wraps everything.
               2. Header (sticky) contains List.
               3. Main (scrollable) contains Content.
            */}

            <Tabs defaultValue="all" className="w-full">
                <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 pt-2">
                    <div className="grid grid-cols-3 items-center px-4 pb-2 h-14">
                        <div className="flex items-center justify-start">
                            {/* Left Slot - Empty or Back Button */}
                        </div>
                        <div className="flex items-center justify-center">
                            <img src="/logo.svg" alt="CryptoTW" className="h-5 w-auto" />
                        </div>
                        <div className="flex items-center justify-end">
                            {profile && (
                                <Link href="/profile">
                                    <img src={profile.pictureUrl} alt="Profile" className="w-8 h-8 rounded-full ring-1 ring-white/20" />
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="px-4">
                        <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start overflow-x-auto no-scrollbar border-b border-transparent">
                            <TabsTrigger value="all" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                全部
                            </TabsTrigger>
                            <TabsTrigger value="news" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                快訊
                            </TabsTrigger>
                            <TabsTrigger value="alpha" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                深度 / 原創
                            </TabsTrigger>
                            <TabsTrigger value="weekly" className="data-[state=active]:text-white text-neutral-500 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-white px-0 font-bold bg-transparent">
                                週報
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </header>

                <div className="mt-6 px-4 space-y-8 max-w-md mx-auto min-h-screen">
                    <TabsContent value="all" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <MarketActivities activities={activities} />
                        <ContentList items={content} />
                    </TabsContent>

                    <TabsContent value="news" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <MarketActivities activities={activities} />
                        <ContentList items={getFilteredContent('news')} />
                    </TabsContent>

                    <TabsContent value="alpha" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ContentList items={getFilteredContent('alpha')} />
                    </TabsContent>

                    <TabsContent value="weekly" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ContentList items={getFilteredContent('weekly')} />
                    </TabsContent>
                </div>
            </Tabs>
        </main>
    )
}

function MarketActivities({ activities }: { activities: any[] }) {
    if (activities.length === 0) return null
    return (
        <section className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Signals</h2>
                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">Live</Badge>
            </div>
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
        </section>
    )
}

function ContentList({ items }: { items: any[] }) {
    if (items.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-neutral-500 text-sm">暫無內容</p>
            </div>
        )
    }
    return (
        <div className="grid gap-4 pb-12">
            {items.map((item) => (
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
                                <Badge variant="secondary" className="bg-white/10 text-neutral-300 hover:bg-white/20 text-[10px] h-5 rounded-sm">{item.type?.toUpperCase() || 'ARTICLE'}</Badge>
                                <span className="text-[10px] text-neutral-500 self-center">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors leading-snug">
                                {item.title}
                            </h3>
                            <p className="text-sm text-neutral-400 line-clamp-2">
                                {item.summary || item.content?.substring(0, 100)}...
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
