'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatusItem {
    label: string
    code: string
    value: string
}

interface MarketStatusData {
    regime: StatusItem
    leverage: StatusItem
    sentiment: StatusItem
    whale: StatusItem
    volatility: StatusItem
}

export function MarketStatusGrid() {
    const [data, setData] = useState<MarketStatusData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/market/status')
                const json = await res.json()
                if (json.status) {
                    setData(json.status)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
        // Refresh every minute
        const interval = setInterval(fetchStatus, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full min-w-[80px] bg-neutral-900/50 rounded-lg" />
                ))}
            </div>
        )
    }

    if (!data) return null

    // Helper to get color style based on code
    const getStyle = (code: string) => {
        switch (code) {
            // Regime
            case 'stable': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'volatile': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'pressure': return 'text-red-400 bg-red-500/10 border-red-500/20'

            // Leverage
            case 'cool': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'warm': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'overheated': return 'text-red-400 bg-red-500/10 border-red-500/20'

            // Sentiment
            case 'fear': return 'text-green-400 bg-green-500/10 border-green-500/20' // Opposites? Usually Fear is oversold (good to buy) -> user said "反向思考"
            case 'neutral': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
            case 'greed': return 'text-red-400 bg-red-500/10 border-red-500/20' // Danger

            // Whale
            case 'bullish': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'watch': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
            case 'bearish': return 'text-red-400 bg-red-500/10 border-red-500/20'

            // Volatility
            case 'low': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20'

            default: return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
        }
    }

    const cards = [
        { title: '市場狀態', ...data.regime },
        { title: '槓桿情緒', ...data.leverage },
        { title: '市場情緒', ...data.sentiment },
        { title: '大戶動向', ...data.whale },
        { title: '短線波動', ...data.volatility }
    ]

    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={cn(
                        "flex-none w-28 flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-24 snap-center",
                        getStyle(card.code)
                    )}
                >
                    <span className="text-[10px] opacity-70 mb-1.5 font-medium">{card.title}</span>
                    <span className="text-sm font-bold tracking-wide">{card.value}</span>
                </div>
            ))}
        </div>
    )
}
