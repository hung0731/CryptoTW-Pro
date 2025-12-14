'use client'

import React from 'react'
import {
    LiquidationWaterfall,
    FundingRateRankings,
    LongShortRatio,
    WhaleAlertFeed,
    IndicatorsGrid,
    DerivativesAiSummaryCard,
    // New compact card components
    FundingSummary,
    LiquidationSummary,
    LongShortSummary,
    OpenInterestCard
} from '@/components/CoinglassWidgets'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { Flame, TrendingUp, Radar, Users, Building2, BarChart3 } from 'lucide-react'

// ============================================
// Aggregated Dashboard Views (for /prediction)
// Card-based layout for key metrics
// ============================================

export function DerivativesView() {
    return (
        <div className="space-y-5">
            {/* AI Summary */}
            <DerivativesAiSummaryCard />

            {/* Key Metrics Grid - 4 Cards */}
            <section>
                <h2 className="text-xs font-bold text-neutral-500 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3" /> 關鍵指標
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {/* BTC Funding Rate */}
                    <FundingSummary />

                    {/* 24H Liquidation */}
                    <LiquidationSummary />

                    {/* Long/Short Ratio */}
                    <LongShortSummary />

                    {/* Open Interest */}
                    <OpenInterestCard />
                </div>
            </section>

            {/* Detailed Long/Short Analysis */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">多空分析</h2>
                    <ExplainTooltip
                        term="多空比"
                        definition="散戶 vs 大戶的多空持倉博弈。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>散戶指標</strong>：全網多空比高於 2.0 代表散戶過度看多 (反指標)。</li>
                                <li><strong>聰明錢</strong>：大戶多空比代表主力動向。</li>
                            </ul>
                        }
                    />
                </div>
                <LongShortRatio />
            </section>

            {/* Funding Rate Rankings - Compact */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">費率排行</h2>
                    <ExplainTooltip
                        term="資金費率"
                        definition="永續合約中，多空雙方定期互付的持倉成本。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>正費率</strong>：多頭付錢給空頭，代表情緒偏多。</li>
                                <li><strong>負費率</strong>：空頭付錢給多頭，代表情緒偏空。</li>
                            </ul>
                        }
                    />
                </div>
                <FundingRateRankings />
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
