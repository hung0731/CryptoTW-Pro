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

// ============================================
// Aggregated Dashboard Views (for /prediction)
// ============================================

export function DerivativesView() {
    return (
        <div className="space-y-6">
            {/* Top Row: Funding & Liquidation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">資金費率熱力</h3>
                    <FundingRateRankings />
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">爆倉趨勢</h3>
                    <LiquidationWaterfall />
                </div>
            </div>

            {/* Middle: Heatmap */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">爆倉熱力圖</h3>
                <LiquidationHeatmap />
            </div>

            {/* Bottom: Long/Short Analysis */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">多空情緒分析</h3>
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
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">交易所資金流向</h3>
                <ExchangeTransparency />
            </div>

            <div className="border-t border-white/5" />

            {/* Whales Section used to be tab, now part of Smart Money */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">巨鯨訊號快訊</h3>
                    <WhaleAlertFeed />
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pl-1">頂級巨鯨持倉</h3>
                    <WhalePositionsList />
                </div>
            </div>
        </div>
    )
}
