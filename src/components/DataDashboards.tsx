'use client'

import React, { useEffect, useState } from 'react'
import { LiquidationWaterfall, LiquidationSummary } from '@/components/widgets/LiquidationWidgets'
import { LongShortRatio, LongShortSummary } from '@/components/widgets/SentimentWidgets'
import { WhaleAlertFeed, IndicatorsGrid } from '@/components/widgets/ChainWidgets'
import { DerivativesAiSummaryCard, OpenInterestCard } from '@/components/widgets/DashboardWidgets'
import { TakerVolumeCard } from '@/components/widgets/MarketWidgets'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'
import { Flame, TrendingUp, Radar, Users, Building2, BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================
// Aggregated Dashboard Views (for /prediction)
// Single API call → distribute to cards
// ============================================

export function DerivativesView() {
    const [dashboard, setDashboard] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/coinglass/dashboard')
                const json = await res.json()
                setDashboard(json.dashboard)
            } catch (e) {
                console.error('Dashboard fetch error:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
        const interval = setInterval(fetchDashboard, 120000) // Refresh every 2 min
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-5">
            {/* AI Summary */}
            <DerivativesAiSummaryCard />

            {/* Key Metrics Grid - 3 Cards (Single API) -> Single Column */}
            <section>
                <h2 className="text-xs font-bold text-neutral-500 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3" /> 關鍵指標
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {/* 24H Liquidation */}
                    <LiquidationSummary data={dashboard?.liquidation} />

                    {/* Long/Short Ratio */}
                    <LongShortSummary data={dashboard?.longShort} />

                    {/* Open Interest */}
                    <OpenInterestCard data={dashboard?.openInterest} />

                    {/* Taker Buy/Sell - C級輔助指標 */}
                    <TakerVolumeCard />
                </div>
            </section>

            {/* Detailed Long/Short Analysis */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">多空分析</h2>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.longShortRatio.term}
                        definition={INDICATOR_KNOWLEDGE.longShortRatio.definition}
                        explanation={INDICATOR_KNOWLEDGE.longShortRatio.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.longShortRatio.timeline}
                    />
                </div>
                <LongShortRatio />
            </section>
        </div>
    )
}

export function SmartMoneyView() {
    return (
        <div className="space-y-5">

            {/* Section: 巨鯨動態 */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">巨鯨動態</h2>
                    <ExplainTooltip
                        term="巨鯨訊號"
                        definition="即時監控 Hyperliquid 超過 $1M 的大額操作。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>開倉</strong>：巨鯨建立新倉位，代表主力進場。</li>
                                <li><strong>平倉</strong>：主力獲利了結或止損離場。</li>
                                <li><strong>多空分佈</strong>：觀察巨鯨整體偏多或偏空。</li>
                            </ul>
                        }
                    />
                </div>
                <div className="space-y-3">
                    <WhaleAlertFeed />
                </div>
            </section>
        </div>
    )
}

// ============================================
// Indicators View (for /prediction)
// ============================================
export function IndicatorsView() {
    return (
        <div className="space-y-5">
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">鏈上指標</h2>
                    <ExplainTooltip
                        term="鏈上指標"
                        definition="基於比特幣區塊鏈數據計算的長線投資指標。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>AHR999</strong>：判斷是否適合定投囤幣。</li>
                                <li><strong>泡沫指數</strong>：判斷市場是否高估或低估。</li>
                                <li><strong>Puell 指標</strong>：衡量礦工獲利狀態。</li>
                                <li><strong>牛市頂部</strong>：綜合指標判斷是否見頂。</li>
                            </ul>
                        }
                    />
                </div>
                <IndicatorsGrid />
            </section>
        </div>
    )
}
