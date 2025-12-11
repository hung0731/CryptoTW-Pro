'use client'

import React, { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { PredictionCard } from '@/components/PredictionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLiff } from '@/components/LiffProvider'
import { ProAccessGate } from '@/components/ProAccessGate'

export default function PredictionPage() {
    const { isLoggedIn, profile, dbUser, isLoading: isAuthLoading } = useLiff()
    const [markets, setMarkets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    const hasAccess = !isAuthLoading && dbUser && (dbUser.membership_status === 'pro' || dbUser.membership_status === 'lifetime')

    const categories = [
        { id: 'all', label: '全部' },
        { id: 'macro', label: '總經' },
        { id: 'crypto', label: '加密貨幣' },
        { id: 'politics', label: '政治' },
    ]

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
        if (hasAccess) {
            fetchMarkets()
        } else {
            setLoading(false) // Stop loading if no access to prevent infinite loading state
        }
    }, [hasAccess])

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-black p-4 space-y-8">
                <Skeleton className="h-12 w-full bg-neutral-900" />
                <Skeleton className="h-40 w-full bg-neutral-900" />
            </div>
        )
    }

    if (!hasAccess) {
        return <ProAccessGate />
    }

    const filteredMarkets = activeTab === 'all'
        ? markets
        : markets.filter(m => {
            if (activeTab === 'macro') return m.category === '總經'
            return false // Currently only have macro data
        })

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <h1 className="text-sm font-bold tracking-tight">市場預測</h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchMarkets}
                        disabled={loading}
                        className="text-neutral-400 hover:text-white h-8 w-8"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Category Filter Pills */}
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

            <div className="max-w-lg mx-auto p-4 space-y-6">

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-32 w-full bg-neutral-900 rounded-xl" />
                                <Skeleton className="h-4 w-3/4 bg-neutral-900" />
                            </div>
                        ))
                    ) : (
                        filteredMarkets.map((market) => (
                            <PredictionCard
                                key={market.id}
                                id={market.id}
                                title={market.title}
                                image={market.image}
                                probability={market.probability}
                                volume={market.volume}
                                type={market.type || 'single'}
                                groupOutcomes={market.groupOutcomes}
                                category={market.category}
                            />
                        ))
                    )}
                </div>

                {/* Educational Footer */}
                <div className="py-8 border-t border-white/5 space-y-8 text-neutral-400">

                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span className="text-lg">🧐</span> 為什麼關注預測市場？
                        </h3>
                        <div className="grid gap-6 text-sm leading-relaxed">
                            <div className="space-y-2">
                                <h4 className="font-medium text-neutral-200 text-xs uppercase tracking-wider">Polymarket 簡介</h4>
                                <p className="text-xs">
                                    建立在 Polygon 區塊鏈上的資訊市場，讓參與者針對未來事件（如選舉、利率）結果進行交易。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-neutral-200 text-xs uppercase tracking-wider">參考價值</h4>
                                <p className="text-xs">
                                    <strong className="text-white">Skin in the game</strong> (利益攸關) 機制迫使參與者理性分析。歷史顯示其對轉折點的捕捉往往領先傳統民調。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-xl p-5 border border-white/5 space-y-3">
                        <h4 className="font-bold text-neutral-200 text-xs flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-neutral-500" />
                            法律聲明與風險提示
                        </h4>
                        <div className="text-[10px] space-y-2 text-neutral-500 leading-relaxed">
                            <p>
                                本頁數據僅供學術研究。本站與 Polymarket 無商業關係，亦不提供投資建議。
                            </p>
                            <div className="p-3 bg-red-900/10 border border-red-500/10 rounded text-red-400/80">
                                <strong>⚠️ 台灣使用者注意：</strong><br />
                                依《公職人員選罷法》及《刑法》，參與選舉賭盤可能觸法。請務必嚴格遵守所在地法律。
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </main>
    )
}
