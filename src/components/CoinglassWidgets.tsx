'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Flame, DollarSign, BarChart3, Gauge, Calendar as CalendarIcon, ArrowLeftRight, Radar, Users } from 'lucide-react'

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
// Liquidation Waterfall Component
// ============================================
// ============================================
// Liquidation Waterfall Component
// ============================================
export function LiquidationWaterfall() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'1h' | '4h' | '12h' | '24h'>('24h') // Added timeframe state

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch liquidation data with timeframe param (simulated for now as API might need update)
                const res = await fetch(`/api/coinglass/liquidation?symbol=BTC&limit=20&timeframe=${timeframe}`)
                const json = await res.json()
                setData(json.liquidations)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [timeframe]) // Refetch on timeframe change

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
            {/* Header with Timeframe Tabs */}
            <div className="flex items-center justify-between">
                {/* Transformed: Removed icon and title as requested, replaced with timeframe selector */}
                <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-white/5">
                    {['1h', '4h', '12h', '24h'].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf as any)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                timeframe === tf ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            {tf.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    即時
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <span className="text-[10px] text-neutral-500 block">多單爆倉 ({timeframe.toUpperCase()})</span>
                    <span className="text-lg font-bold text-red-400 font-mono">{data.summary?.longLiquidatedFormatted || '$0'}</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <span className="text-[10px] text-neutral-500 block">空單爆倉 ({timeframe.toUpperCase()})</span>
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

            {/* Explanation */}
            <div className="bg-neutral-900 rounded-lg p-3 border border-white/5 mt-3">
                <p className="text-[10px] text-neutral-500">
                    💡 瀑布流展示了大額爆倉事件。當出現大規模「多單爆倉」時，市場可能短期超賣；反之「空單爆倉」則可能超買。
                </p>
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
            {/* Removed header as requested */}

            {/* Grid Layout for compact view */}
            <div className="grid grid-cols-2 gap-3">
                {/* Extreme Positive (Bearish Signal) */}
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-white/5">
                        <TrendingUp className="w-3 h-3 text-red-400" />
                        <span className="text-xs font-bold text-red-400">極度看多</span>
                    </div>
                    <div className="space-y-1">
                        {(data.extremePositive || []).slice(0, 8).map((item: any, i: number) => ( // Increased to 8 items
                            <div key={i} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1">
                                    <span className="text-neutral-600 font-mono w-3">{i + 1}</span>
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
                    </div>
                    <div className="space-y-1">
                        {(data.extremeNegative || []).slice(0, 8).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1">
                                    <span className="text-neutral-600 font-mono w-3">{i + 1}</span>
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
            {/* Removed header as requested */}

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
                <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-neutral-400">💡 {data.signal.text}</p>
                    <div className="mt-2 text-[10px] text-neutral-500 border-t border-white/5 pt-2">
                        <p>顏色越亮代表累積的清算金額越高。價格傾向於去觸碰這些「高流動性」區域，隨後可能發生反轉。</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================
// Exchange Transparency Component
// ============================================
export function ExchangeTransparency() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/exchange?symbol=BTC')
                const json = await res.json()
                setData(json.exchange)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                    <span className="text-lg font-bold text-white">交易所 BTC 儲備</span>
                </div>
                <span className="text-xs text-neutral-400">總計 {data.totalBalanceFormatted} BTC</span>
            </div>

            {/* Summary Card */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <span className="text-xs text-neutral-500 block">24H 淨流向</span>
                    <span className={cn(
                        "text-lg font-bold font-mono",
                        data.netFlow === 'in' ? 'text-green-400' : 'text-red-400'
                    )}>
                        {data.netFlow === 'in' ? '流入' : '流出'} {data.totalChangeFormatted}
                    </span>
                </div>
                <div className="h-8 w-[1px] bg-white/10"></div>
                <div>
                    <span className="text-xs text-neutral-500 block">儲備總量</span>
                    <span className="text-lg font-bold text-white font-mono">{data.totalBalanceFormatted}</span>
                </div>
            </div>

            {/* Exchange List */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-black/20 text-[10px] text-neutral-500 font-medium border-b border-white/5">
                    <div className="col-span-4">交易所</div>
                    <div className="col-span-4 text-right">持有量</div>
                    <div className="col-span-4 text-right">24H變化</div>
                </div>
                <div className="divide-y divide-white/5">
                    {(data.items || []).map((item: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-white/5 transition-colors">
                            <div className="col-span-4 flex items-center gap-2">
                                <span className="text-neutral-600 font-mono text-xs w-3">{i + 1}</span>
                                <span className="text-sm font-medium text-white">{item.name}</span>
                            </div>
                            <div className="col-span-4 text-right">
                                <span className="text-sm font-mono text-white">{item.balanceFormatted}</span>
                            </div>
                            <div className="col-span-4 text-right">
                                <span className={cn(
                                    "text-xs font-mono",
                                    item.change24h > 0 ? 'text-green-400' : 'text-red-400'
                                )}>
                                    {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-neutral-400">
                    💡 交易所餘額減少通常被視為長期持有的信號 (提幣至錢包)
                </p>
                <div className="mt-2 text-[10px] text-neutral-500 border-t border-white/5 pt-2">
                    <p>資金流入交易所 (Inflow) 通常代表潛在賣壓；流出交易所 (Outflow) 則代表投資者傾向囤幣惜售。</p>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Economic Calendar Component
// ============================================
export function EconomicCalendar() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/calendar')
                const json = await res.json()
                setData(json.calendar)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    // Group by date
    const grouped = (data.events || []).reduce((acc: any, event: any) => {
        if (!acc[event.date]) acc[event.date] = []
        acc[event.date].push(event)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([date, events]: [string, any]) => (
                <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h3 className="text-sm font-bold text-white font-mono">{date}</h3>
                    </div>

                    <div className="space-y-3">
                        {events.map((event: any, i: number) => (
                            <div key={i} className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-all">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg text-white font-mono">{event.time}</span>
                                        <span className="text-xl">{event.country}</span>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(3)].map((_, starIdx) => (
                                            <div
                                                key={starIdx}
                                                className={cn(
                                                    "w-3 h-3 rounded-sm",
                                                    starIdx < event.importance ?
                                                        (event.importance === 3 ? "bg-red-500" : "bg-yellow-500") :
                                                        "bg-neutral-800"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <h4 className="text-base font-medium text-white mb-3">{event.event}</h4>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-black/30 p-2 rounded-lg text-center border border-white/5">
                                        <span className="block text-neutral-500 mb-1">今值</span>
                                        <span className="font-mono text-white font-bold">{event.actual || '--'}</span>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded-lg text-center border border-white/5">
                                        <span className="block text-neutral-500 mb-1">預測</span>
                                        <span className="font-mono text-neutral-300">{event.forecast || '--'}</span>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded-lg text-center border border-white/5">
                                        <span className="block text-neutral-500 mb-1">前值</span>
                                        <span className="font-mono text-neutral-400">{event.previous || '--'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="text-center pt-4">
                <p className="text-xs text-neutral-500">
                    數據來源: Investing.com (已時區轉換 UTC+8)
                </p>
            </div>
        </div>
    )
}

// ============================================
// Summary Components for Homepage
// ============================================

export function FundingSummary() {
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

    if (loading) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />
    if (!data) return null

    // Get top 2 extreme
    const topPositive = data.extremePositive?.[0]
    const topNegative = data.extremeNegative?.[0]

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
            <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-white">資金費率</span>
            </div>
            <div className="space-y-2">
                {topPositive && (
                    <div className="flex justify-between items-center bg-red-500/10 rounded px-2 py-1">
                        <span className="text-xs text-white font-medium">{topPositive.symbol}</span>
                        <span className="text-xs font-mono text-red-400 font-bold">
                            +{(topPositive.rate * 100).toFixed(3)}%
                        </span>
                    </div>
                )}
                {topNegative && (
                    <div className="flex justify-between items-center bg-green-500/10 rounded px-2 py-1">
                        <span className="text-xs text-white font-medium">{topNegative.symbol}</span>
                        <span className="text-xs font-mono text-green-400 font-bold">
                            {(topNegative.rate * 100).toFixed(3)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export function LiquidationSummary() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/liquidation?symbol=BTC&limit=1')
                const json = await res.json()
                setData(json.liquidations)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />
    if (!data) return null

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
            <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-white">爆倉 (24H)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="text-center bg-red-500/10 rounded py-1.5">
                    <span className="text-[9px] text-neutral-400 block mb-0.5">多單</span>
                    <span className="text-xs font-mono text-red-400 font-bold block">{data.summary?.longLiquidatedFormatted || '$0'}</span>
                </div>
                <div className="text-center bg-green-500/10 rounded py-1.5">
                    <span className="text-[9px] text-neutral-400 block mb-0.5">空單</span>
                    <span className="text-xs font-mono text-green-400 font-bold block">{data.summary?.shortLiquidatedFormatted || '$0'}</span>
                </div>
            </div>
        </div>
    )
}

export function LongShortSummary() {
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

    if (loading) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />
    if (!data || !data.global) return null

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-white">BTC 多空比</span>
            </div>

            <div className="mt-3">
                <div className="h-4 bg-neutral-800 rounded-full overflow-hidden flex mb-2">
                    <div
                        className="bg-green-500/60 h-full"
                        style={{ width: `${data.global.longRate}%` }}
                    />
                    <div
                        className="bg-red-500/60 h-full"
                        style={{ width: `${data.global.shortRate}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-green-500">{data.global.longRate.toFixed(0)}% 多</span>
                    <span className="text-red-500">{data.global.shortRate.toFixed(0)}% 空</span>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Whale Watch Components
// ============================================

export function WhaleAlertFeed() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await fetch('/api/market/whales')
                const json = await res.json()
                if (json.whales?.alerts) {
                    setAlerts(json.whales.alerts)
                }
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchAlerts()
        const interval = setInterval(fetchAlerts, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />

    // Since mock data or API might return empty list initially
    if (!alerts || alerts.length === 0) {
        return (
            <div className="bg-neutral-900/50 rounded-xl p-8 text-center border border-dashed border-white/10">
                <Radar className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">暫無巨鯨快訊</p>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-neutral-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">巨鯨快訊 ({'>'} $1M)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-mono">LIVE</span>
                </div>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                {alerts.map((alert, i) => (
                    <div key={i} className="p-3 hover:bg-white/5 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-8 rounded-full",
                                alert.side === 'LONG' || alert.side === 'BUY' ? "bg-green-500" : "bg-red-500"
                            )} />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{alert.symbol}</span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 rounded border font-mono",
                                        alert.side === 'LONG' || alert.side === 'BUY'
                                            ? "text-green-400 border-green-500/30 bg-green-500/10"
                                            : "text-red-400 border-red-500/30 bg-red-500/10"
                                    )}>
                                        {alert.side === 'BUY' ? 'LONG' : (alert.side === 'SELL' ? 'SHORT' : alert.side)}
                                    </span>
                                </div>
                                <span className="text-xs text-neutral-400 font-mono">
                                    Price: {alert.price ? `$${parseFloat(alert.price).toLocaleString()}` : '--'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-mono font-bold text-white">
                                ${parseInt(alert.amount || alert.volUsd || '0').toLocaleString()}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                                {new Date(alert.createTime || alert.time).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function WhalePositionsList() {
    const [positions, setPositions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/whales')
                const json = await res.json()
                if (json.whales?.positions) {
                    setPositions(json.whales.positions)
                }
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />

    if (!positions || positions.length === 0) {
        return (
            <div className="bg-neutral-900/50 rounded-xl p-8 text-center border border-dashed border-white/10">
                <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">暫無持倉數據</p>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-neutral-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-white">Top 巨鯨持倉</span>
                </div>
            </div>
            <div className="divide-y divide-white/5">
                {positions.map((pos, i) => (
                    <div key={i} className="p-3 hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-400 border border-white/10">
                                    {i + 1}
                                </div>
                                <span className="text-xs font-mono text-neutral-300">
                                    {pos.address || pos.user || 'Unknown'}
                                </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-blue-400">
                                Leverage: x{pos.leverage || '1'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 bg-black/20 rounded p-2">
                            <div>
                                <span className="text-[10px] text-neutral-500 block">Symbol</span>
                                <span className="text-xs font-bold text-white">{pos.symbol || pos.coin}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-neutral-500 block">Size (USD)</span>
                                <span className="text-xs font-mono text-white">
                                    ${parseFloat(pos.amount || pos.szi || '0').toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    )
}
