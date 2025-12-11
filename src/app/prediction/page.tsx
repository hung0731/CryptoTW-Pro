'use client'

import React, { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { PredictionCard } from '@/components/PredictionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PredictionPage() {
    const [markets, setMarkets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMarkets = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/prediction/markets?limit=20')
            const data = await res.json()
            if (data.markets) {
                setMarkets(data.markets)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMarkets()
    }, [])

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-6 h-16 max-w-5xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">市場預測</h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchMarkets}
                        disabled={loading}
                        className="text-neutral-400 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <div className="p-6 max-w-5xl mx-auto space-y-8">
                {/* Description */}
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white">熱門預測</h2>
                    <p className="text-neutral-400 text-sm">來自 Polymarket 的即時機率數據。</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-32 w-full bg-neutral-900 rounded-xl" />
                                <Skeleton className="h-4 w-3/4 bg-neutral-900" />
                                <Skeleton className="h-8 w-full bg-neutral-900" />
                            </div>
                        ))
                    ) : (
                        markets.map((market) => (
                            <PredictionCard
                                key={market.id}
                                id={market.id}
                                title={market.title}
                                image={market.image}
                                probability={market.probability}
                                volume={market.volume}
                            />
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    )
}
