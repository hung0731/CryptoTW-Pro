'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Gauge, TrendingUp, TrendingDown, DollarSign, BarChart3, AlertCircle } from 'lucide-react'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'
import { DashboardData } from './types'

// ============================================
// Bull/Bear Index Component
// ============================================
export function BullBearIndex() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/bull-bear')
                const json = await res.json()
                setData(json.bullBear)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-32 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    const getColor = (index: number) => {
        if (index >= 75) return 'text-red-400'
        if (index >= 55) return 'text-orange-400'
        if (index >= 45) return 'text-neutral-400'
        if (index >= 25) return 'text-blue-400'
        return 'text-green-400'
    }

    const getBgColor = (index: number) => {
        if (index >= 75) return 'bg-red-500'
        if (index >= 55) return 'bg-orange-500'
        if (index >= 45) return 'bg-neutral-500'
        if (index >= 25) return 'bg-blue-500'
        return 'bg-green-500'
    }

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-white">牛熊指標</span>
                    <ExplainTooltip
                        term="牛熊指標"
                        definition="衡量市場情緒的綜合指數，範圍 0-100。"
                        explanation={
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>0-25 (極度恐懼)</strong>：市場非理性恐慌，通常是長線買點。</li>
                                <li><strong>75-100 (極度貪婪)</strong>：市場 FOMO 情緒高漲，需警惕回調風險。</li>
                            </ul>
                        }
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn("text-2xl font-bold font-mono", getColor(data.index))}>
                        {data.index}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", getColor(data.index), getBgColor(data.index) + '/20')}>
                        {data.sentimentCn}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                    <div className="w-1/4 bg-green-500/30" />
                    <div className="w-1/4 bg-blue-500/30" />
                    <div className="w-1/4 bg-orange-500/30" />
                    <div className="w-1/4 bg-red-500/30" />
                </div>
                <div
                    className={cn("absolute h-4 w-1 -top-1 rounded-full transition-all", getBgColor(data.index))}
                    style={{ left: `${data.index}%` }}
                />
            </div>
            <div className="flex justify-between text-[9px] text-neutral-600">
                <span>極度恐懼</span>
                <span>恐懼</span>
                <span>中性</span>
                <span>貪婪</span>
                <span>極度貪婪</span>
            </div>

            {/* Suggestion */}
            <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-neutral-400">
                    💡 {data.suggestion}
                </p>
                <div className="mt-2 text-[10px] text-neutral-500 border-t border-white/5 pt-2">
                    <p>指數 0-100：極度恐懼 (0-25) 通常是買入機會，極度貪婪 (75-100) 則需警惕回調風險。</p>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Funding Rate Rankings Component
// ============================================
export function FundingRateRankings() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/funding-rate')
                const json = await res.json()

                if (json.error) {
                    setError('資料存取失敗')
                } else {
                    setData(json.fundingRates)
                }
            } catch (e) {
                console.error(e)
                setError('資料存取失敗')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full bg-neutral-900/50 rounded-xl" />)}
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center justify-center h-40">
                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-sm font-medium text-red-300">{error}</p>
                <p className="text-xs text-red-500/70 mt-1">請稍後再試或檢查 API 設定</p>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-4">
            {/* Grid Layout for compact view */}
            <div className="grid grid-cols-2 gap-3">
                {/* Extreme Positive (Bearish Signal) */}
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-white/5">
                        <TrendingUp className="w-3 h-3 text-red-400" />
                        <span className="text-xs font-bold text-red-400">極度看多</span>
                        <ExplainTooltip
                            term="極度看多 (高費率)"
                            definition="多頭情緒過熱，需支付高額資金費。"
                            explanation={<div>通常暗示市場過熱，可能有回調風險。</div>}
                        />
                    </div>
                    <div className="space-y-0.5">
                        {(data.extremePositive || []).slice(0, 8).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px] py-0.5 hover:bg-white/5 rounded px-1 transition-colors">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-neutral-600 font-mono w-3 text-[9px]">{i + 1}</span>
                                    <span className="text-neutral-300 font-medium">{item.symbol}</span>
                                </div>
                                <span className="font-mono font-bold text-red-400">
                                    +{(item.rate * 100).toFixed(3)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extreme Negative (Bullish Signal) */}
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-white/5">
                        <TrendingDown className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-bold text-green-400">極度看空</span>
                        <ExplainTooltip
                            term="極度看空 (負費率)"
                            definition="空頭情緒過熱，需支付資金費給多頭。"
                            explanation={<div>通常暗示市場過度恐慌，可能有軋空反彈。</div>}
                        />
                    </div>
                    <div className="space-y-0.5">
                        {(data.extremeNegative || []).slice(0, 8).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px] py-0.5 hover:bg-white/5 rounded px-1 transition-colors">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-neutral-600 font-mono w-3 text-[9px]">{i + 1}</span>
                                    <span className="text-neutral-300 font-medium">{item.symbol}</span>
                                </div>
                                <span className="font-mono font-bold text-green-400">
                                    {(item.rate * 100).toFixed(3)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-neutral-400">
                    💡 費率 &gt; 0.1% 做空勝率高，&lt; -0.05% 做多勝率高
                </p>
                <div className="mt-2 text-[10px] text-neutral-500 border-t border-white/5 pt-2">
                    <p>正費率代表多頭需支付費用給空頭 (情緒偏多)，過高可能反轉；負費率代表空頭支付費用 (情緒偏空)。</p>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Long/Short Ratio Component
// ============================================
export function LongShortRatio() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/long-short?symbol=BTC')
                const json = await res.json()
                setData(json.longShort)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    return (
        <div className="space-y-4">
            {/* Global Ratio */}
            {data.global && (
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-3">
                    <span className="text-xs text-neutral-500">全網帳戶多空比</span>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <div className="h-6 bg-neutral-800 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-green-500/60 h-full flex items-center justify-end pr-2"
                                    style={{ width: `${data.global.longRate}%` }}
                                >
                                    <span className="text-[10px] font-bold text-white">多 {data.global.longRate.toFixed(0)}%</span>
                                </div>
                                <div
                                    className="bg-red-500/60 h-full flex items-center pl-2"
                                    style={{ width: `${data.global.shortRate}%` }}
                                >
                                    <span className="text-[10px] font-bold text-white">空 {data.global.shortRate.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Accounts */}
            {data.topAccounts && (
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-3">
                    <span className="text-xs text-neutral-500">大戶帳戶多空比</span>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <div className="h-6 bg-neutral-800 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-green-500/40 h-full flex items-center justify-end pr-2"
                                    style={{ width: `${data.topAccounts.longRate}%` }}
                                >
                                    <span className="text-[10px] font-bold text-white">多 {data.topAccounts.longRate.toFixed(0)}%</span>
                                </div>
                                <div
                                    className="bg-red-500/40 h-full flex items-center pl-2"
                                    style={{ width: `${data.topAccounts.shortRate}%` }}
                                >
                                    <span className="text-[10px] font-bold text-white">空 {data.topAccounts.shortRate.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Signal */}
            {data.signal && (
                <div className={cn(
                    "rounded-lg p-3 border",
                    data.signal.type === 'bullish' ? 'bg-green-500/10 border-green-500/20' :
                        data.signal.type === 'bearish' ? 'bg-red-500/10 border-red-500/20' :
                            data.signal.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                'bg-neutral-800/50 border-white/5'
                )}>
                    <p className="text-xs text-neutral-300">💡 {data.signal.text}</p>
                </div>
            )}

            {/* Explanation */}
            <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-neutral-500">
                    💡 「全網」代表散戶情緒，「大戶」代表聰明錢。當散戶極度看多但大戶做空時，行情容易反轉向下 (割韭菜)。
                </p>
            </div>
        </div>
    )
}

export function FundingSummary({ data }: { data?: DashboardData['funding'] }) {
    if (!data) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />

    const isHigh = data.status === 'high'
    const isNegative = data.status === 'negative'

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
            <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-white">BTC 費率</span>
                <ExplainTooltip
                    term={INDICATOR_KNOWLEDGE.fundingRate.term}
                    definition={INDICATOR_KNOWLEDGE.fundingRate.definition}
                    explanation={INDICATOR_KNOWLEDGE.fundingRate.interpretation}
                    timeline={INDICATOR_KNOWLEDGE.fundingRate.timeline}
                />
            </div>
            <div className="text-center py-2">
                <span className={cn(
                    "text-xl font-bold font-mono",
                    isHigh ? "text-red-400" : isNegative ? "text-green-400" : "text-white"
                )}>
                    {data.rate >= 0 ? '+' : ''}{data.ratePercent}%
                </span>
                <div className={cn(
                    "text-[10px] mt-1",
                    isHigh ? "text-red-400" : isNegative ? "text-green-400" : "text-neutral-500"
                )}>
                    {isHigh ? '偏高' : isNegative ? '負費率' : '正常'}
                </div>
            </div>
        </div>
    )
}

export function LongShortSummary({ data }: { data?: DashboardData['longShort'] }) {
    if (!data?.global) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />

    const longRate = data.global.longRate
    const shortRate = data.global.shortRate
    const ratio = longRate / shortRate

    let sentiment = '中性'
    let sentimentColor = 'text-neutral-400'
    let sentimentBg = 'bg-neutral-800'

    if (ratio >= 2.0) {
        sentiment = '多頭極度擁擠 (偏空)'
        sentimentColor = 'text-red-400'
        sentimentBg = 'bg-red-500/20'
    } else if (ratio >= 1.2) {
        sentiment = '多頭偏多 (注意)'
        sentimentColor = 'text-yellow-400'
        sentimentBg = 'bg-yellow-500/20'
    } else if (ratio <= 0.5) {
        sentiment = '空頭擁擠 (偏多)'
        sentimentColor = 'text-green-400'
        sentimentBg = 'bg-green-500/20'
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-white">多空比</span>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.longShortRatio.term}
                        definition={INDICATOR_KNOWLEDGE.longShortRatio.definition}
                        explanation={INDICATOR_KNOWLEDGE.longShortRatio.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.longShortRatio.timeline}
                    />
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", sentimentBg, sentimentColor)}>
                    {sentiment}
                </span>
            </div>
            <div className="mt-2">
                <div className="h-4 bg-neutral-800 rounded-full overflow-hidden flex mb-2 relative">
                    <div className="bg-green-500/60 h-full transition-all duration-500" style={{ width: `${longRate}%` }} />
                    <div className="bg-red-500/60 h-full transition-all duration-500" style={{ width: `${shortRate}%` }} />
                    {/* Center Marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/20 z-10" />
                </div>
                <div className="flex justify-between text-xs font-mono font-bold">
                    <div className="flex flex-col">
                        <span className="text-green-500">{longRate.toFixed(1)}%</span>
                        <span className="text-[9px] text-neutral-500 font-normal">多單</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-red-500">{shortRate.toFixed(1)}%</span>
                        <span className="text-[9px] text-neutral-500 font-normal">空單</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
