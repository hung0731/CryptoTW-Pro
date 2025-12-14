'use client'

import React from 'react'
import {
    LiquidationWaterfall,
    FundingRateRankings,
    LongShortRatio,
    ExchangeTransparency,
    WhaleAlertFeed,
    WhalePositionsList,
    IndicatorsGrid
} from '@/components/CoinglassWidgets'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { Flame, TrendingUp, Radar, Users, Building2, BarChart3 } from 'lucide-react'

// ============================================
// Aggregated Dashboard Views (for /prediction)
// Unified with homepage design style
// ============================================

export function DerivativesView() {
    return (
        <div className="space-y-5">
            {/* Section: 資金費率 */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">資金費率熱力</h2>
                    <ExplainTooltip
                        term="資金費率 (Funding Rate)"
                        definition="永續合約中，多空雙方定期互付的持倉成本。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>正費率</strong>：多頭付錢給空頭，代表情緒偏多。</li>
                                <li><strong>負費率</strong>：空頭付錢給多頭，代表情緒偏空。</li>
                                <li><strong>費率過高</strong>：通常預示反轉。</li>
                            </ul>
                        }
                    />
                </div>
                <FundingRateRankings />
            </section>

            {/* Section: 爆倉趨勢 */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">爆倉趨勢</h2>
                    <ExplainTooltip
                        term="爆倉趨勢 (Liquidation)"
                        definition="統計多空雙方被強制平倉的金額與方向。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>連環爆倉</strong>：一方大量爆倉時，價格往反方向更劇烈波動。</li>
                                <li><strong>反轉訊號</strong>：異常巨大的爆倉柱，往往代表短期底部或頂部。</li>
                            </ul>
                        }
                    />
                </div>
                <LiquidationWaterfall />
            </section>

            {/* Section: 多空情緒 */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">多空情緒分析</h2>
                    <ExplainTooltip
                        term="多空比 (Long/Short Ratio)"
                        definition="散戶 vs 大戶的多空持倉博弈。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>散戶指標</strong>：全網多空比高於 2.0 代表散戶過度看多 (反指標)。</li>
                                <li><strong>聰明錢</strong>：大戶多空比代表主力動向，若與散戶背離，聽大戶的。</li>
                            </ul>
                        }
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
            {/* Section: 交易所資金流向 */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-medium text-neutral-500">交易所資金流向</h2>
                    <ExplainTooltip
                        term="交易所流向 (Netflow)"
                        definition="追蹤比特幣進出中心化交易所 (CEX) 的資金。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>流入</strong>：大額轉入交易所，通常為了賣出變現 (賣壓)。</li>
                                <li><strong>流出</strong>：提幣至冷錢包，代表長期持有意願強。</li>
                            </ul>
                        }
                    />
                </div>
                <ExchangeTransparency />
            </section>

            {/* Section: 巨鯨動態 - Grid Layout */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <WhaleAlertFeed />
                    <WhalePositionsList />
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
