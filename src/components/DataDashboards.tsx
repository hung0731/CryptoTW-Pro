'use client'

import React from 'react'
import {
    LiquidationWaterfall,
    FundingRateRankings,
    LiquidationHeatmap,
    LongShortRatio,
    ExchangeTransparency,
    WhaleAlertFeed,
    WhalePositionsList
} from '@/components/CoinglassWidgets'
import { ExplainTooltip } from '@/components/ExplainTooltip'

// ============================================
// Aggregated Dashboard Views (for /prediction)
// ============================================

export function DerivativesView() {
    return (
        <div className="space-y-6">
            {/* Top Row: Funding & Liquidation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pl-1">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">資金費率熱力</h3>
                        <ExplainTooltip
                            term="資金費率 (Funding Rate)"
                            definition="永續合約中，多空雙方定期互付的持倉成本。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>正費率 (+0.01%)</strong>：多頭付錢給空頭，代表情緒偏多。</li>
                                    <li><strong>負費率 (Negative)</strong>：空頭付錢給多頭，代表情緒偏空。</li>
                                    <li><strong>套利機會</strong>：費率過高時，通常會有現貨套利者進場做空壓低價格。</li>
                                </ul>
                            }
                        />
                    </div>
                    <FundingRateRankings />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pl-1">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">爆倉趨勢</h3>
                        <ExplainTooltip
                            term="爆倉趨勢 (Liquidation)"
                            definition="統計多空雙方被強制平倉的金額與方向。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>連環爆倉</strong>：當一方大量爆倉時，會推動價格往反方向更劇烈波動 (如殺多跌更快)。</li>
                                    <li><strong>反轉訊號</strong>：當出現異常巨大的爆倉柱時，往往代表短期底部或頂部已現。</li>
                                </ul>
                            }
                        />
                    </div>
                    <LiquidationWaterfall />
                </div>
            </div>

            {/* Middle: Heatmap */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pl-1">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">爆倉熱力圖</h3>
                    <ExplainTooltip
                        term="清算熱力圖 (Heatmap)"
                        definition="預測價格可能去觸碰的「高流動性」區域。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>亮色帶 (黃/紅)</strong>：代表該價格堆積了大量高倍槓桿止損單。</li>
                                <li><strong>交易策略</strong>：價格常被吸往亮區清算，卻在清算後迅速反轉，適合掛單止盈。</li>
                            </ul>
                        }
                    />
                </div>
                <LiquidationHeatmap />
            </div>

            {/* Bottom: Long/Short Analysis */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pl-1">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">多空情緒分析</h3>
                    <ExplainTooltip
                        term="多空比 (Long/Short Ratio)"
                        definition="散戶 vs 大戶的多空持倉博弈。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>散戶指標</strong>：全網多空比通常代表散戶，高於 2.0 代表散戶過度看多 (反指標)。</li>
                                <li><strong>聰明錢</strong>：大戶多空比代表主力動向，若與散戶背離，通常聽大戶的。</li>
                            </ul>
                        }
                    />
                </div>
                <LongShortRatio />
            </div>
        </div>
    )
}

export function SmartMoneyView() {
    return (
        <div className="space-y-6">
            {/* Top: Exchange Flows */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pl-1">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">交易所資金流向</h3>
                    <ExplainTooltip
                        term="交易所流向 (Netflow)"
                        definition="追蹤比特幣進出中心化交易所 (CEX) 的資金。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>流入 (Inflow)</strong>：大額轉入交易所，通常是為了賣出變現 (潛在賣壓)。</li>
                                <li><strong>流出 (Outflow)</strong>：提幣至冷錢包，代表長期持有意願強 (惜售)。</li>
                            </ul>
                        }
                    />
                </div>
                <ExchangeTransparency />
            </div>

            <div className="border-t border-white/5" />

            {/* Whales Section used to be tab, now part of Smart Money */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pl-1">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">巨鯨訊號快訊</h3>
                        <ExplainTooltip
                            term="巨鯨訊號"
                            definition="即時監控鏈上大額轉帳與異常操作。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>轉入交易所</strong>：可能砸盤。</li>
                                    <li><strong>轉出交易所</strong>：可能囤幣。</li>
                                    <li><strong>大額平倉</strong>：主力獲利了結或止損離場。</li>
                                </ul>
                            }
                        />
                    </div>
                    <WhaleAlertFeed />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pl-1">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">頂級巨鯨持倉</h3>
                        <ExplainTooltip
                            term="頂級巨鯨"
                            definition="Top 100 持幣地址的倉位變化監控。"
                            explanation={
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>聰明錢動向</strong>：這些錢包通常資訊最靈通。</li>
                                    <li><strong>趨勢判斷</strong>：若頂級巨鯨集體減倉，行情可能見頂。</li>
                                </ul>
                            }
                        />
                    </div>
                    <WhalePositionsList />
                </div>
            </div>
        </div>
    )
}
