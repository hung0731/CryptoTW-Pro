'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { MarketContextCard } from '@/components/home/MarketContextCard'
import { Skeleton } from '@/components/ui/skeleton'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { Newspaper, Sparkles } from 'lucide-react'

interface MarketContext {
    sentiment: '樂觀' | '保守' | '恐慌' | '中性'
    themes: {
        title: string
        summary: string
        watch: 'contracts' | 'whales' | 'macro' | 'sentiment' | 'etf'
        why_it_matters: string
    }[]
}

export default function NewsPage() {
    const [marketContext, setMarketContext] = useState<MarketContext | null>(null)
    const [contextLoading, setContextLoading] = useState(true)

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const res = await fetch('/api/market/home-router')
                const json = await res.json()
                if (json.router?.marketContext) {
                    setMarketContext(json.router.marketContext)
                }
            } catch (e) {
                console.error('Failed to fetch market context', e)
            } finally {
                setContextLoading(false)
            }
        }
        fetchContext()
    }, [])

    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader />

            <div className="p-4 space-y-5">

                {/* Section 1: AI Market Context Brief */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">今日市場脈絡</h2>
                        <ExplainTooltip
                            term="市場脈絡 (Market Context)"
                            definition="AI 分析近 24 小時新聞，提煉出市場當前狀態。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>聚類分析</strong>：多則新聞歸納成 2-3 個主軸。</li>
                                    <li><strong>狀態描述</strong>：不是「發生什麼」，而是「市場處於什麼狀態」。</li>
                                    <li><strong>導航引領</strong>：每個主題對應平台功能，助你深入探索。</li>
                                </ul>
                            }
                        />
                    </div>

                    {contextLoading ? (
                        <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
                    ) : marketContext ? (
                        <MarketContextCard data={marketContext} isLoading={false} />
                    ) : (
                        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 text-center">
                            <Sparkles className="w-6 h-6 mx-auto text-neutral-600 mb-2" />
                            <p className="text-sm text-neutral-500">AI 脈絡分析載入中...</p>
                            <p className="text-xs text-neutral-600 mt-1">需要有效的 API Key 才能運作</p>
                        </div>
                    )}
                </section>

                {/* Section 2: News Feed */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">即時快訊</h2>
                        <ExplainTooltip
                            term="幣圈快訊"
                            definition="來自 Coinglass 的即時消息，每 5 分鐘自動更新。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>新聞來源</strong>：PANews、Binance、Coinglass 等。</li>
                                    <li><strong>重點標記</strong>：黃色標籤代表高影響力新聞。</li>
                                    <li><strong>展開詳情</strong>：點擊標題查看完整內容。</li>
                                </ul>
                            }
                        />
                    </div>

                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                        <FlashNewsFeed />
                    </div>
                </section>

            </div>

            <BottomNav />
        </main>
    )
}
