'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLiff } from '@/components/LiffProvider'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar, Users, Clock, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
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
    const { dbUser, profile } = useLiff()
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
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center justify-start">
                        {/* Empty left slot */}
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="Logo" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        {profile && (
                            <Link href="/profile">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                                    <img src={profile.pictureUrl} alt="Profile" className="relative w-9 h-9 rounded-full ring-2 ring-white/10 group-hover:ring-white transition-all shadow-lg" />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Scrollable Tabs */}
            <div className="w-full overflow-x-auto no-scrollbar px-4 pt-4 pb-2 max-w-lg mx-auto sticky top-14 z-30 bg-black/80 backdrop-blur-xl">
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

            <div className="max-w-lg mx-auto p-4 space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full bg-neutral-900 rounded-lg" />
                    ))
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center text-neutral-500 py-12 flex flex-col items-center gap-3">
                        <Calendar className="w-8 h-8 opacity-20" />
                        <span className="text-xs">目前此類別沒有活動</span>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {filteredActivities.map((activity) => (
                            <Link href={`/events/${activity.id}`} key={activity.id}>
                                <div className="group flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        {/* Status Dot */}
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                            activity.end_date && new Date(activity.end_date) > new Date() ? "bg-green-500 animate-pulse" : "bg-neutral-600"
                                        )} />

                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-4 border-opacity-30", getExchangeColor(activity.exchange_name))}>
                                                    {activity.exchange_name === 'all' ? 'ALL' : activity.exchange_name}
                                                </Badge>
                                                <h3 className="text-sm font-medium text-neutral-200 truncate group-hover:text-white transition-colors">
                                                    {activity.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                                                <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                                                {activity.end_date && (
                                                    <span className="flex items-center gap-1 text-orange-400/80">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(activity.end_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                            </Link>
                        ))}
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
