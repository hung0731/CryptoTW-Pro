'use client'

import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { FlashNewsFeed } from '@/components/news/FlashNewsFeed'
import { ExplainTooltip } from '@/components/ExplainTooltip'

export default function NewsPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-24 font-sans">
            <PageHeader />

            <div className="p-4 space-y-5">

                {/* Section: News Feed (with built-in AI Context) */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-medium text-neutral-500">幣圈快訊</h2>
                        <ExplainTooltip
                            term="幣圈快訊"
                            definition="來自 Coinglass 的即時消息，每 5 分鐘自動更新。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>AI 脈絡</strong>：頂部卡片為 AI 分析的市場狀態。</li>
                                    <li><strong>新聞來源</strong>：PANews、Binance、Coinglass 等。</li>
                                    <li><strong>重點標記</strong>：黃色標籤代表高影響力新聞。</li>
                                </ul>
                            }
                        />
                    </div>

                    <FlashNewsFeed />
                </section>

            </div>

            <BottomNav />
        </main>
    )
}
