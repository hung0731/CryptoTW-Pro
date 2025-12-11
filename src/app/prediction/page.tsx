'use client'

import React, { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { PredictionCard } from '@/components/PredictionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PredictionPage() {
    const [markets, setMarkets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

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
        fetchMarkets()
    }, [])

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
                <div className="flex items-center justify-between px-6 h-14 max-w-5xl mx-auto">
                    <div className="flex items-center gap-2">
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

                {/* Category Filter Pills */}
                <div className="w-full overflow-x-auto no-scrollbar px-6 pb-3 max-w-5xl mx-auto">
                    <div className="flex space-x-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap",
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

            <div className="p-6 max-w-5xl mx-auto space-y-8">

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
                <div className="mt-12 py-8 border-t border-white/5 space-y-8 text-neutral-400">

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            🧐 為什麼我們要關注預測市場？
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm leading-relaxed">
                            <div className="space-y-2">
                                <h4 className="font-medium text-neutral-200">什麼是 Polymarket？</h4>
                                <p>
                                    Polymarket 是目前全球最大的去中心化預測市場平台，建立在 Polygon 區塊鏈上。
                                    與傳統賭博不同，它是一個「資訊市場」，讓參與者針對未來事件（如選舉、利率決策、國際局勢）的結果進行交易。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-neutral-200">為什麼數據值得參考？</h4>
                                <p>
                                    預測市場的核心價值在於 **利益攸關 (Skin in the game)**。
                                    因為參與者必須投入真金白銀，這這迫使他們必須極度理性地分析資訊，而非憑空臆測。
                                    歷史數據顯示，預測市場在捕捉即時消息與轉折點的靈敏度上，往往領先於傳統民調或專家分析。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-xl p-6 border border-white/5 space-y-4">
                        <h4 className="font-bold text-neutral-200 text-sm">⚠️ 研究用途與法律聲明</h4>
                        <div className="text-xs space-y-3 text-neutral-500">
                            <p>
                                本頁面數據僅為學術研究與資訊分享用途，旨在介紹 Web3 預測市場的新型態應用。
                                <span className="text-neutral-400">本站與 Polymarket 無任何商業合作或代理關係，亦不提供任何投資與下注建議。</span>
                            </p>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300/90 leading-relaxed">
                                <strong>特別注意：</strong>
                                根據中華民國《公職人員選舉罷免法》及《刑法》賭博罪相關規範，參與選舉賭盤可能觸法。
                                預測市場之合規性在各國監管未定，使用者若欲前往該平台進行任何操作，請務必自行了解並嚴格遵守您所在地（特別是台灣地區）之法律法規。
                                切勿以身試法，本站不承擔任何因個人行為衍生之法律責任。
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </main>
    )
}
