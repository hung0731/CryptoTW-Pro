'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar, Users, Clock, ArrowLeft, Loader2, Share2 } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
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

export default function SingleEventPage() {
    const params = useParams()
    const router = useRouter()
    const [activity, setActivity] = useState<Activity | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchActivity = async () => {
            if (!params.id) return
            try {
                const res = await fetch(`/api/activities?id=${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setActivity(data.activity)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchActivity()
    }, [params.id])

    const getExchangeColor = (name: string) => {
        const n = name?.toLowerCase() || ''
        if (n.includes('binance')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        if (n.includes('okx')) return 'bg-white/10 text-white border-white/20'
        if (n.includes('bybit')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
        if (n.includes('vip')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        if (n.includes('pro')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        return 'bg-neutral-800 text-neutral-400 border-white/10'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        )
    }

    if (!activity) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <h1 className="text-2xl font-bold">Activity Not Found</h1>
                <Button onClick={() => router.back()} variant="outline" className="border-white/10 text-white hover:bg-white/10">
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-neutral-400 hover:text-white hover:bg-white/10 -ml-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate max-w-[200px]">{activity.title}</span>
                    </div>
                    <div className="w-8" />
                </div>
            </header>

            <div className="max-w-lg mx-auto p-4 space-y-6">

                {/* Meta Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getExchangeColor(activity.exchange_name)} uppercase text-xs px-2.5 py-0.5 border-opacity-30`}>
                            {activity.exchange_name === 'all' ? 'Users' : activity.exchange_name}
                        </Badge>
                        <span className="text-xs text-neutral-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold leading-tight decoration-clone text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
                        {activity.title}
                    </h1>
                </div>

                {/* Countdown */}
                {activity.end_date && (
                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-neutral-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> 距離活動結束
                        </span>
                        <CountdownTimer targetDate={activity.end_date} className="text-lg font-mono text-white" />
                    </div>
                )}

                {/* Content */}
                <article className="prose prose-invert prose-lg max-w-none prose-neutral prose-p:text-neutral-300 prose-headings:text-white prose-a:text-blue-400 prose-img:rounded-xl">
                    <ReactMarkdown
                        components={{
                            a: ({ node, ...props }) => <a {...props} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />,
                            img: ({ node, ...props }) => <img {...props} className="rounded-xl border border-white/10 w-full" />,
                        }}
                    >
                        {activity.content || activity.description || '暫無詳細內容'}
                    </ReactMarkdown>
                </article>

                {/* Filters/Actions */}
                {activity.url && (
                    <div className="pt-4 sticky bottom-24 z-30 bg-gradient-to-t from-black via-black to-transparent pb-4">
                        <Button
                            className="w-full bg-white text-black hover:bg-neutral-200 rounded-full h-12 text-sm font-bold shadow-lg shadow-white/10"
                            onClick={() => window.open(activity.url, '_blank')}
                        >
                            前往活動頁面 <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>

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
            return null
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (!timeLeft) {
        return <span className={cn("text-xs text-neutral-500 font-mono bg-neutral-800 px-2 py-1 rounded", className)}>已結束</span>
    }

    return (
        <span className={cn("text-xs text-orange-400 font-mono flex items-center gap-1", className)}>
            {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m
        </span>
    )
}
