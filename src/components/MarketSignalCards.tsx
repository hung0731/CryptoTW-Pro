'use client'

import React from 'react'
import type { MarketSignals } from '@/lib/signal-engine'
import { ExplainTooltip } from '@/components/ExplainTooltip'

interface MarketFeelingCardProps {
    signals: MarketSignals | null
    loading?: boolean
}

// 統一顏色函數
const getColor = (value: string) => {
    if (value.includes('多') || value.includes('低調做多')) return 'text-green-400'
    if (value.includes('空') || value.includes('撤退')) return 'text-red-400'
    if (value.includes('過熱') || value.includes('高')) return 'text-red-400'
    if (value.includes('擁擠') || value.includes('升溫') || value.includes('防守')) return 'text-orange-400'
    if (value.includes('降溫')) return 'text-blue-400'
    return 'text-neutral-400'
}

/**
 * 市場體感卡 - 統一樣式版本
 */
export function MarketFeelingCard({ signals, loading }: MarketFeelingCardProps) {
    if (loading || !signals) {
        return (
            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 animate-pulse">
                <div className="h-4 bg-neutral-800 rounded w-24 mb-2"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-full"></div>
                    <div className="h-3 bg-neutral-800 rounded w-full"></div>
                </div>
            </div>
        )
    }

    const items = [
        { label: '市場體感', value: signals.market_feeling },
        { label: '槓桿狀態', value: signals.leverage_status },
        { label: '巨鯨狀態', value: signals.whale_status },
        { label: '爆倉壓力', value: signals.liquidation_pressure },
    ]

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-white">市場體感</span>
                <ExplainTooltip
                    term="市場體感"
                    definition="綜合多維度數據所判斷的市場當前狀態。"
                    explanation={
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>偏多/偏空</strong>：趨勢明確</li>
                            <li><strong>擁擠</strong>：散戶過度集中，容易反轉</li>
                        </ul>
                    }
                />
            </div>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">{item.label}</span>
                        <span className={`text-xs font-medium ${getColor(item.value)}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * 巨鯨狀態卡 - 簡化版
 */
export function WhaleStatusCard({ signals, loading }: MarketFeelingCardProps) {
    if (loading || !signals) {
        return (
            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 animate-pulse">
                <div className="h-4 bg-neutral-800 rounded w-20 mb-2"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-full"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">巨鯨狀態</span>
                <span className={`text-xs font-medium ${getColor(signals.whale_status)}`}>
                    {signals.whale_status}
                </span>
            </div>
            <div className="space-y-1">
                {signals.evidence.whale.slice(0, 2).map((e, i) => (
                    <p key={i} className="text-[10px] text-neutral-500 leading-tight">{e}</p>
                ))}
            </div>
        </div>
    )
}

/**
 * 爆倉壓力卡 - 簡化版
 */
export function LiquidationPressureCard({ signals, loading }: MarketFeelingCardProps) {
    if (loading || !signals) {
        return (
            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 animate-pulse">
                <div className="h-4 bg-neutral-800 rounded w-20 mb-2"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-full"></div>
                </div>
            </div>
        )
    }

    const formatPrice = (p: number | null) => {
        if (!p) return '--'
        return `$${(p / 1000).toFixed(1)}K`
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">爆倉壓力</span>
                <span className={`text-xs font-medium ${getColor(signals.liquidation_pressure)}`}>
                    {signals.liquidation_pressure}
                </span>
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">上方區</span>
                    <span className="text-neutral-400 font-mono">
                        {formatPrice(signals.liquidation_zones.above_start)} - {formatPrice(signals.liquidation_zones.above_end)}
                    </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">下方區</span>
                    <span className="text-neutral-400 font-mono">
                        {formatPrice(signals.liquidation_zones.below_start)} - {formatPrice(signals.liquidation_zones.below_end)}
                    </span>
                </div>
            </div>
        </div>
    )
}

