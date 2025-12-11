'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar, Users, Clock, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface Activity {
    id: string
    title: string
    description: string
    content: string
    exchange_name: string
    url: string
    end_date: string | null
    created_at: string
}

export default function EventsPage() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

    // Filter Tabs
    const tabs = [
        { id: 'all', label: '全部' },
        { id: 'vip', label: '大客戶' },
        { id: 'pro', label: 'Pro' },
        { id: 'binance', label: 'Binance' },
        { id: 'okx', label: 'OKX' },
        { id: 'bybit', label: 'Bybit' },
    ]

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch('/api/activities')
                const data = await res.json()
                if (data.activities) {
                    setActivities(data.activities)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchActivities()
    }, [])

    const getExchangeColor = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes('binance')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        if (n.includes('okx')) return 'bg-white/10 text-white border-white/20'
        if (n.includes('bybit')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
        if (n.includes('vip')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        if (n.includes('pro')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        return 'bg-neutral-800 text-neutral-400 border-white/10'
    }

    const filteredActivities = activeTab === 'all'
        ? activities
        : activities.filter(a => a.exchange_name.toLowerCase() === activeTab)

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 space-y-2 pb-2">
                <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <h1 className="text-sm font-bold tracking-tight">活動與福利</h1>
                    </div>
                </div>
                {/* Scrollable Tabs */}
                <div className="w-full overflow-x-auto no-scrollbar px-4 pb-2 max-w-lg mx-auto">
                    <div className="flex space-x-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-white text-black"
                                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto p-4 space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-40 w-full bg-neutral-900 rounded-xl" />
                        </div>
                    ))
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center text-neutral-500 py-12 flex flex-col items-center gap-3">
                        <Calendar className="w-8 h-8 opacity-20" />
                        <span className="text-xs">目前此類別沒有活動</span>
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <Card
                            key={activity.id}
                            className="bg-neutral-900 border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer group"
                            onClick={() => setSelectedActivity(activity)}
                        >
                            <CardHeader className="pb-3 pt-4 px-4">
                                <div className="flex justify-between items-start gap-4">
                                    <Badge variant="outline" className={`${getExchangeColor(activity.exchange_name)} uppercase text-[10px] px-2 py-0.5 border-opacity-30`}>
                                        {activity.exchange_name === 'all' ? 'Users' : activity.exchange_name}
                                    </Badge>
                                    {activity.end_date ? (
                                        <CountdownTimer targetDate={activity.end_date} />
                                    ) : (
                                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                                            {new Date(activity.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-base font-bold text-white pt-2 leading-snug group-hover:text-blue-400 transition-colors">
                                    {activity.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-4">
                                <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                                    {activity.description}
                                </p>
                                <div className="flex items-center text-[10px] text-neutral-500 font-medium">
                                    <span className="underline decoration-neutral-700 underline-offset-2 group-hover:text-neutral-300">查看詳情</span>
                                    <ChevronRight className="w-3 h-3 ml-0.5 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto w-[90%] rounded-2xl p-0 gap-0">
                    {selectedActivity && (
                        <>
                            <div className="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur-md border-b border-white/5 p-4 flex items-start justify-between">
                                <div className="space-y-1 pr-8">
                                    <Badge variant="outline" className={`${getExchangeColor(selectedActivity.exchange_name)} uppercase text-[10px] px-2 py-0.5 border-opacity-30`}>
                                        {selectedActivity.exchange_name}
                                    </Badge>
                                    <DialogTitle className="text-lg font-bold leading-tight">
                                        {selectedActivity.title}
                                    </DialogTitle>
                                </div>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Countdown in Modal */}
                                {selectedActivity.end_date && (
                                    <div className="bg-neutral-950/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                        <span className="text-xs text-neutral-400 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> 距離活動結束
                                        </span>
                                        <CountdownTimer targetDate={selectedActivity.end_date} className="text-base font-mono text-white" />
                                    </div>
                                )}

                                <div className="prose prose-invert prose-sm max-w-none prose-neutral">
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />,
                                            img: ({ node, ...props }) => <img {...props} className="rounded-xl border border-white/10" />,
                                        }}
                                    >
                                        {selectedActivity.content || selectedActivity.description || '暫無詳細內容'}
                                    </ReactMarkdown>
                                </div>

                                {selectedActivity.url && (
                                    <Button
                                        className="w-full bg-white text-black hover:bg-neutral-200 rounded-xl h-12 text-sm font-bold"
                                        onClick={() => window.open(selectedActivity.url, '_blank')}
                                    >
                                        前往活動頁面 <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <BottomNav />
        </main>
    )
}

function CountdownTimer({ targetDate, className }: { targetDate: string, className?: string }) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date()
            if (difference > 0) {
                return {
                    d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    m: Math.floor((difference / 1000 / 60) % 60),
                    s: Math.floor((difference / 1000) % 60)
                }
            }
            return null // Time's up
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (!timeLeft) {
        return <span className={cn("text-[10px] text-neutral-500 font-mono bg-neutral-800 px-1.5 py-0.5 rounded", className)}>已結束</span>
    }

    return (
        <span className={cn("text-[10px] text-orange-400 font-mono bg-orange-950/30 px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-1", className)}>
            <Clock className="w-3 h-3" />
            {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m
        </span>
    )
}
