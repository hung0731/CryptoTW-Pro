'use client'

import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Calendar, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Activity {
    id: string
    title: string
    description: string
    exchange_name: string
    url: string
    created_at: string
}

export default function EventsPage() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

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
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">
                    <h1 className="text-lg font-bold tracking-tight">交易所活動</h1>
                </div>
            </header>

            <div className="p-6 max-w-md mx-auto space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-40 w-full bg-neutral-900 rounded-xl" />
                        </div>
                    ))
                ) : activities.length === 0 ? (
                    <div className="text-center text-neutral-500 py-10">
                        目前沒有進行中的活動
                    </div>
                ) : (
                    activities.map((activity) => (
                        <Card key={activity.id} className="bg-neutral-900 border-white/5 hover:border-white/10 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-4">
                                    <Badge variant="outline" className={`${getExchangeColor(activity.exchange_name)} uppercase text-[10px]`}>
                                        {activity.exchange_name}
                                    </Badge>
                                    <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(activity.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-base font-semibold text-white pt-2 leading-tight">
                                    {activity.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                                    {activity.description}
                                </p>
                                {activity.url && (
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/10 hover:bg-white/5 text-neutral-300 h-9 text-xs"
                                        onClick={() => window.open(activity.url, '_blank')}
                                    >
                                        查看詳情 <ExternalLink className="w-3 h-3 ml-2" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <BottomNav />
        </main>
    )
}
