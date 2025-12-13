'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Flame, DollarSign, BarChart3, Gauge } from 'lucide-react'

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
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-neutral-400">
                    💡 {data.suggestion}
                </p>
            </div>
        </div>
    )
}

// ============================================
// Liquidation Waterfall Component
// ============================================
export function LiquidationWaterfall() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/liquidation?symbol=BTC&limit=20')
                const json = await res.json()
                setData(json.liquidations)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-neutral-900/50 rounded-xl" />)}
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-lg font-bold text-white">即時清算</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    即時數據
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <span className="text-[10px] text-neutral-500 block">多單清算 (1H)</span>
                    <span className="text-lg font-bold text-red-400 font-mono">{data.summary?.longLiquidatedFormatted || '$0'}</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <span className="text-[10px] text-neutral-500 block">空單清算 (1H)</span>
                    <span className="text-lg font-bold text-green-400 font-mono">{data.summary?.shortLiquidatedFormatted || '$0'}</span>
                </div>
            </div>

            {/* Signal */}
            {data.summary?.signal && (
                <div className={cn(
                    "rounded-lg p-3 border",
                    data.summary.signal.type === 'bullish' ? 'bg-green-500/10 border-green-500/20' :
                        data.summary.signal.type === 'bearish' ? 'bg-red-500/10 border-red-500/20' :
                            'bg-neutral-800/50 border-white/5'
                )}>
                    <p className="text-xs text-neutral-300">💡 {data.summary.signal.text}</p>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {(data.items || []).slice(0, 10).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-900/30 border border-white/5 rounded-lg hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                item.side === 'LONG' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            )}>
                                {item.side === 'LONG' ? '多' : '空'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{item.symbol}</span>
                                    <span className="text-xs font-mono text-neutral-400">{item.amountFormatted}</span>
                                </div>
                                <span className="text-[10px] text-neutral-500">@ ${item.price?.toLocaleString()}</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-neutral-500">{item.timeAgo}</span>
                    </div>
                ))}
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/funding-rate')
                const json = await res.json()
                setData(json.fundingRates)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
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

    if (!data) return null

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-lg font-bold text-white">資金費率排行</span>
                </div>
                <span className="text-[10px] text-neutral-500">8H 更新一次</span>
            </div>

            {/* Extreme Positive (Bearish Signal) */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">極度看多 (小心回調)</span>
                </div>
                <div className="space-y-2">
                    {(data.extremePositive || []).slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-600 font-mono text-xs w-4">{i + 1}</span>
                                <span className="text-sm font-medium text-white">{item.symbol}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-mono font-bold text-red-400">
                                    +{(item.rate * 100).toFixed(3)}%
                                </span>
                                <span className="text-[10px] text-neutral-500 block">
                                    年化 {item.annualizedRate.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Extreme Negative (Bullish Signal) */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">極度看空 (可能反彈)</span>
                </div>
                <div className="space-y-2">
                    {(data.extremeNegative || []).slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-600 font-mono text-xs w-4">{i + 1}</span>
                                <span className="text-sm font-medium text-white">{item.symbol}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-mono font-bold text-green-400">
                                    {(item.rate * 100).toFixed(3)}%
                                </span>
                                <span className="text-[10px] text-neutral-500 block">
                                    年化 {item.annualizedRate.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-neutral-400">
                    💡 資金費率 &gt; 0.1% 時做空勝率較高，&lt; -0.05% 時做多勝率較高
                </p>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-lg font-bold text-white">BTC 多空比</span>
                </div>
            </div>

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
        </div>
    )
}

// ============================================
// Liquidation Heatmap Component
// ============================================
export function LiquidationHeatmap() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/heatmap?symbol=BTC')
                const json = await res.json()
                setData(json.heatmap)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    const maxAmount = Math.max(
        ...(data.above || []).map((l: any) => l.liquidationUsd),
        ...(data.below || []).map((l: any) => l.liquidationUsd)
    )

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-bold text-white">BTC 清算分布</span>
                </div>
                <span className="text-xs text-neutral-400">現價 {data.currentPriceFormatted}</span>
            </div>

            {/* Heatmap Levels */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 space-y-2">
                {/* Above current price (Long liquidations) */}
                {(data.above || []).map((level: any, i: number) => (
                    <div key={`above-${i}`} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400 w-16">{level.priceFormatted}</span>
                        <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
                            <div
                                className="h-full bg-green-500/50 rounded flex items-center px-2"
                                style={{ width: `${(level.liquidationUsd / maxAmount) * 100}%`, minWidth: '40px' }}
                            >
                                <span className="text-[9px] text-white font-mono">{level.liquidationFormatted}</span>
                            </div>
                        </div>
                        <span className="text-[9px] text-green-400 w-8">多單</span>
                    </div>
                ))}

                {/* Current price indicator */}
                <div className="flex items-center gap-2 py-2 border-y border-white/10">
                    <span className="text-xs font-mono text-white w-16 font-bold">{data.currentPriceFormatted}</span>
                    <div className="flex-1 text-center text-[10px] text-neutral-500">── 現價 ──</div>
                    <span className="w-8"></span>
                </div>

                {/* Below current price (Short liquidations) */}
                {(data.below || []).map((level: any, i: number) => (
                    <div key={`below-${i}`} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400 w-16">{level.priceFormatted}</span>
                        <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
                            <div
                                className="h-full bg-red-500/50 rounded flex items-center px-2"
                                style={{ width: `${(level.liquidationUsd / maxAmount) * 100}%`, minWidth: '40px' }}
                            >
                                <span className="text-[9px] text-white font-mono">{level.liquidationFormatted}</span>
                            </div>
                        </div>
                        <span className="text-[9px] text-red-400 w-8">空單</span>
                    </div>
                ))}
            </div>

            {/* Max Pain */}
            {data.maxPain && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <span className="text-xs text-neutral-400">🎯 最大痛點: </span>
                    <span className="text-sm font-bold text-yellow-400">{data.maxPain.priceFormatted}</span>
                </div>
            )}

            {/* Signal */}
            {data.signal && (
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-neutral-400">💡 {data.signal.text}</p>
                </div>
            )}
        </div>
    )
}
