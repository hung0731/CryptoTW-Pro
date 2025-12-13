'use client'

import React from 'react'
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react'
import type { MarketSignals } from '@/lib/signal-engine'

import { ExplainTooltip } from '@/components/ExplainTooltip'

interface MarketFeelingCardProps {
    signals: MarketSignals | null
    loading?: boolean
}

/**
 * 市場體感卡 - 用戶 5 秒內知道市場狀態
 */
export function MarketFeelingCard({ signals, loading }: MarketFeelingCardProps) {
    if (loading || !signals) {
        return (
            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4 animate-pulse">
                <div className="h-5 bg-neutral-800 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                </div>
            </div>
        )
    }

    // 市場體感顏色
    const getFeelingColor = () => {
        switch (signals.market_feeling) {
            case '偏多': return 'text-green-400'
            case '偏空': return 'text-red-400'
            case '擁擠': return 'text-orange-400'
            case '混亂': return 'text-yellow-400'
            default: return 'text-neutral-400'
        }
    }

    // 槓桿狀態顏色
    const getLeverageColor = () => {
        switch (signals.leverage_status) {
            case '過熱': return 'text-red-400'
            case '升溫': return 'text-orange-400'
            case '降溫': return 'text-blue-400'
            default: return 'text-neutral-400'
        }
    }

    // 巨鯨狀態顏色
    const getWhaleColor = () => {
        switch (signals.whale_status) {
            case '低調做多': return 'text-green-400'
            case '防守對沖': return 'text-yellow-400'
            case '偏空': return 'text-red-400'
            case '撤退中': return 'text-red-400'
            default: return 'text-neutral-400'
        }
    }

    // 爆倉壓力顏色
    const getLiquidationColor = () => {
        switch (signals.liquidation_pressure) {
            case '上方壓力': return 'text-green-400' // 上方壓力 = 可能軋空 = 偏多
            case '下方壓力': return 'text-red-400'   // 下方壓力 = 可能殺多 = 偏空
            default: return 'text-neutral-400'
        }
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">市場體感</span>
                    <ExplainTooltip
                        term="市場體感 (Market Sentiment)"
                        definition="綜合多維度數據 (價格、資金費率、多空比) 所判斷的市場當前狀態。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>偏多/偏空</strong>：價格與數據同步，趨勢明確。</li>
                                <li><strong>擁擠 (Crowded)</strong>：太多散戶做同一方向，容易發生反轉。</li>
                                <li><strong>混亂/中性</strong>：多空數據打架，建議觀望等待方向。</li>
                            </ul>
                        }
                    />
                </div>
                <span className={`text-lg font-bold ${getFeelingColor()}`}>
                    {signals.market_feeling}
                </span>
            </div>

            {/* Status Grid */}
            <div className="space-y-3">
                {/* 槓桿狀態 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-xs text-neutral-500">槓桿狀態</span>
                    </div>
                    <span className={`text-xs font-medium ${getLeverageColor()}`}>
                        {signals.leverage_status}
                    </span>
                </div>

                {/* 巨鯨狀態 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-xs text-neutral-500">巨鯨狀態</span>
                    </div>
                    <span className={`text-xs font-medium ${getWhaleColor()}`}>
                        {signals.whale_status}
                    </span>
                </div>

                {/* 爆倉壓力 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-xs text-neutral-500">爆倉風險</span>
                    </div>
                    <span className={`text-xs font-medium ${getLiquidationColor()}`}>
                        {signals.liquidation_pressure}
                    </span>
                </div>
            </div>
        </div>
    )
}

/**
 * 巨鯨狀態卡 - 狀態 + 證據
 */
export function WhaleStatusCard({ signals, loading }: MarketFeelingCardProps) {
    if (loading || !signals) {
        return (
            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4 animate-pulse">
                <div className="h-5 bg-neutral-800 rounded w-32 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-full"></div>
                    <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    const getStatusColor = () => {
        switch (signals.whale_status) {
            case '低調做多': return 'text-green-400 bg-green-500/10'
            case '防守對沖': return 'text-yellow-400 bg-yellow-500/10'
            case '偏空': return 'text-red-400 bg-red-500/10'
            case '撤退中': return 'text-red-400 bg-red-500/10'
            default: return 'text-neutral-400 bg-neutral-500/10'
        }
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">巨鯨狀態</span>
                    <ExplainTooltip
                        term="巨鯨狀態 (Wholes)"
                        definition="偵測大額資金持有者 (Smart Money) 的即時動向。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>低調做多</strong>：大戶多空比上升，但價格與散戶情緒看空 (最佳買點)。</li>
                                <li><strong>防守對沖</strong>：現貨持有者透過合約開空避險，非真的看空。</li>
                                <li><strong>撤退/倒貨</strong>：大額資金流出，需警惕下跌。</li>
                            </ul>
                        }
                    />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor()}`}>
                    {signals.whale_status}
                </span>
            </div>

            {/* Evidence */}
            <div className="space-y-1.5">
                {signals.evidence.whale.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                        <span className="text-neutral-400">{e}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * 爆倉壓力卡 - 區間 + 結論
 */
export function LiquidationPressureCard({ signals, loading }: MarketFeelingCardProps) {
    if (loading || !signals) {
        return (
            <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4 animate-pulse">
                <div className="h-5 bg-neutral-800 rounded w-32 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                </div>
            </div>
        )
    }

    const formatPrice = (p: number | null) => {
        if (!p) return '--'
        return `$${(p / 1000).toFixed(1)}K`
    }

    const getConclusion = () => {
        switch (signals.liquidation_pressure) {
            case '上方壓力':
                return '若價格靠近上方區間，容易觸發空單回補'
            case '下方壓力':
                return '若價格跌至下方區間，可能觸發多單止損'
            default:
                return '上下壓力接近均衡，無明顯方向偏好'
        }
    }

    const getPressureColor = () => {
        switch (signals.liquidation_pressure) {
            case '上方壓力': return 'text-green-400'
            case '下方壓力': return 'text-red-400'
            default: return 'text-neutral-400'
        }
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">爆倉壓力</span>
                    <ExplainTooltip
                        term="爆倉壓力 (Liquidation Pressure)"
                        definition="預測價格可能被「吸」往哪個方向去觸發強制平倉。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>上方壓力</strong>：空單大量堆積在上方，主力可能拉盤去「殺空」。</li>
                                <li><strong>下方壓力</strong>：多單大量堆積在下方，主力可能砸盤去「殺多」。</li>
                                <li><strong>壓力均衡</strong>：無明顯獵殺目標，價格震盪。</li>
                            </ul>
                        }
                    />
                </div>
                <span className={`text-xs font-bold ${getPressureColor()}`}>
                    {signals.liquidation_pressure}
                </span>
            </div>

            {/* Zones */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">上方空單區</span>
                    <span className="text-neutral-300 font-mono">
                        {formatPrice(signals.liquidation_zones.above_start)} - {formatPrice(signals.liquidation_zones.above_end)}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">下方多單區</span>
                    <span className="text-neutral-300 font-mono">
                        {formatPrice(signals.liquidation_zones.below_start)} - {formatPrice(signals.liquidation_zones.below_end)}
                    </span>
                </div>
            </div>

            {/* Conclusion */}
            <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] text-neutral-500">{getConclusion()}</p>
            </div>
        </div>
    )
}
