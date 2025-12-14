'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Flame, DollarSign, BarChart3, Gauge, Calendar as CalendarIcon, ArrowLeftRight, Radar, Users, ChevronDown, ChevronUp, Star, Info, AlertCircle } from 'lucide-react'
import { ExplainTooltip } from './ExplainTooltip'

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
                                <li><strong>75-100 (極度貪婪)</strong>：市場FOMO情緒高漲，需警惕回調風險。</li>
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

            {/* Summary - Compact Grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-neutral-400 mb-1">多單爆倉 ({timeframe.toUpperCase()})</span>
                    <span className="text-xl font-bold text-red-400 font-mono tracking-tight">{data.summary?.longLiquidatedFormatted || '$0'}</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-neutral-400 mb-1">空單爆倉 ({timeframe.toUpperCase()})</span>
                    <span className="text-xl font-bold text-green-400 font-mono tracking-tight">{data.summary?.shortLiquidatedFormatted || '$0'}</span>
                </div>
            </div>

            {/* Signal */}
            {data.summary?.signal && (
                <div className={cn(
                    "rounded-lg p-2.5 border flex items-center justify-center",
                    data.summary.signal.type === 'bullish' ? 'bg-green-500/10 border-green-500/20' :
                        data.summary.signal.type === 'bearish' ? 'bg-red-500/10 border-red-500/20' :
                            'bg-neutral-800/50 border-white/5'
                )}>
                    <p className="text-xs text-neutral-300 font-medium">💡 {data.summary.signal.text}</p>
                </div>
            )}
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

// ============================================
// Economic Calendar Component
// ============================================
export function EconomicCalendar() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data (API now returns strictly filtered & enriched events)
                const res = await fetch('/api/coinglass/calendar')
                const json = await res.json()
                setData(json.calendar)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    if (loading) {
        return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    const events = data.events || []

    if (events.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-neutral-500 text-sm">此期間無符合條件的數據</p>
            </div>
        )
    }

    // Group by date
    const grouped = events.reduce((acc: any, event: any) => {
        if (!acc[event.date]) acc[event.date] = []
        acc[event.date].push(event)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([date, events]: [string, any]) => (
                <div key={date} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur z-10 pt-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <h3 className="text-base font-bold text-white font-mono tracking-tight">{date}</h3>
                    </div>

                    <div className="space-y-3">
                        {events.map((event: any, i: number) => {
                            const isExpanded = expanded[event.id]
                            const isKey = event.tier === 'S'

                            return (
                                <div key={event.id} className={cn(
                                    "rounded-xl transition-all relative overflow-hidden border",
                                    // Unified bg to neutral-900/50, only use border for emphasis
                                    "bg-neutral-900/50 hover:bg-white/5",
                                    isKey
                                        ? "border-blue-500/30 hover:border-blue-500/50"
                                        : "border-white/5"
                                )}>
                                    {/* S-Tier Indicator */}
                                    {isKey && (
                                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 fill-current" />
                                            重點
                                        </div>
                                    )}

                                    {/* Main Card Content */}
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => toggleExpand(event.id)}
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded border border-white/5">
                                                    {event.time}
                                                </span>
                                                <span className="text-xs font-bold text-neutral-300 px-1.5 py-0.5 border border-white/10 rounded">
                                                    {event.country}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={cn(
                                                "font-bold leading-tight flex-1",
                                                isKey ? "text-lg text-white" : "text-sm text-neutral-200"
                                            )}>
                                                {event.title}
                                            </h4>
                                            <button className="text-neutral-500 hover:text-white transition-colors">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Data Grid */}
                                        <div className="grid grid-cols-3 gap-2 text-xs mt-4">
                                            <div className="bg-black/20 p-2 rounded text-center">
                                                <span className="block text-neutral-500 mb-1 scale-90">今值</span>
                                                <span className={cn(
                                                    "font-mono font-bold text-sm",
                                                    event.actual ? "text-white" : "text-neutral-600"
                                                )}>{event.actual || '--'}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded text-center">
                                                <span className="block text-neutral-500 mb-1 scale-90">預測</span>
                                                <span className="font-mono text-neutral-300 text-sm">{event.forecast || '--'}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded text-center">
                                                <span className="block text-neutral-500 mb-1 scale-90">前值</span>
                                                <span className="font-mono text-neutral-400 text-sm">{event.previous || '--'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Educational Overlay (Expandable) */}
                                    {isExpanded && (event.whyImportant || event.cryptoReaction) && (
                                        <div className="bg-white/5 border-t border-white/5 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                            {/* Why Important */}
                                            {event.whyImportant && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-yellow-500 mb-1.5">
                                                        <Info className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">為什麼重要？</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-300 leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                                                        {event.whyImportant}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Crypto Reaction */}
                                            {event.cryptoReaction && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-blue-400 mb-1.5">
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">加密市場常見反應</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-300 leading-relaxed bg-black/20 p-2 rounded border border-white/5">
                                                        {event.cryptoReaction}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Quick Hint for collapsed state if S-Tier */}
                                    {!isExpanded && isKey && (
                                        <div className="px-4 pb-3 flex items-center justify-center">
                                            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                                                <Info className="w-3 h-3" />
                                                點擊查看影響與解讀
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            <div className="text-center pt-8 pb-4 space-y-1">
                <p className="text-[10px] text-neutral-600">
                    數據來源: Coinglass (UTC+8) • 只顯示高影響力事件 (S/A級)
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-700">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> S級核心</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></span> A級關注</span>
                </div>
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
                <ExplainTooltip
                    term="資金費率 (Funding Rate)"
                    definition="確保合約價格貼近現貨價格的機制。正費率代表多頭付費給空頭。"
                    explanation={
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>費率飆升 (&gt;0.05%)</strong>：多頭過度擁擠，主力可能砸盤殺多。</li>
                            <li><strong>費率轉負</strong>：空頭擁擠，可能出現軋空 (Short Squeeze) 上漲。</li>
                        </ul>
                    }
                />
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
                <ExplainTooltip
                    term="爆倉數據 (Liquidation)"
                    definition="過去24小時內被迫強制平倉的總金額。"
                    explanation={
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>爆量</strong>：代表市場劇烈波動，去槓桿化剛發生，短期趨勢可能延續或反轉。</li>
                            <li><strong>多單爆倉大</strong>：市場殺多，容易見底。</li>
                            <li><strong>空單爆倉大</strong>：市場軋空，容易見頂。</li>
                        </ul>
                    }
                />
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
                <ExplainTooltip
                    term="多空比 (Long/Short Ratio)"
                    definition="市場上做多帳戶與做空帳戶的數量比例。"
                    explanation={
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>全網多空比</strong>：代表散戶情緒，過高通常是反指標 (散戶都在做多)。</li>
                            <li><strong>大戶多空比</strong>：代表聰明錢動向，更具參考價值。</li>
                            <li><strong>背離訊號</strong>：若全網極度看多，但價格下跌，代表主力正在出貨。</li>
                        </ul>
                    }
                />
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

// Open Interest Card Component
export function OpenInterestCard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/derivatives')
                const json = await res.json()
                if (json.derivatives) {
                    setData(json.derivatives)
                }
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return <Skeleton className="h-20 w-full bg-neutral-900/50 rounded-xl" />
    if (!data) return null

    const oi = data.metrics?.openInterest || 0
    const oiChange = data.metrics?.oiChange24h || 0
    const isPositive = oiChange >= 0

    const formatOI = (val: number) => {
        if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
        if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
        return `$${val.toLocaleString()}`
    }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 hover:bg-white/5 transition-all h-full">
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-white">未平倉</span>
                <ExplainTooltip
                    term="未平倉合約 (Open Interest)"
                    definition="當前未平倉的合約總價值。"
                    explanation={
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>OI 上升</strong>：新資金流入，趨勢可能延續。</li>
                            <li><strong>OI 下降</strong>：資金撤離，趨勢可能結束。</li>
                        </ul>
                    }
                />
            </div>
            <div className="space-y-1">
                <div className="text-lg font-bold font-mono text-white">
                    {formatOI(oi)}
                </div>
                <div className={cn(
                    "text-xs font-mono",
                    isPositive ? "text-green-400" : "text-red-400"
                )}>
                    24H: {isPositive ? '+' : ''}{oiChange.toFixed(2)}%
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

                if (json.whales?.alerts && Array.isArray(json.whales.alerts) && json.whales.alerts.length > 0) {
                    setAlerts(json.whales.alerts)
                }
            } catch (e) {
                console.error('API Error:', e)
            }
            finally { setLoading(false) }
        }
        fetchAlerts()
        const interval = setInterval(fetchAlerts, 30000)
        return () => clearInterval(interval)
    }, [])

    // Logic Layer: Filtering & Insight Generation
    // Filter noise: Only show > $1M as main view (User requested >$1M display condition)
    const filteredAlerts = alerts.filter(a => Math.abs(a.position_value_usd || 0) >= 1000000)

    // Generate Context Insight (More narrative structure)
    let contextTitle = "市場脈絡"
    let contextText = "巨鯨都在睡覺，市場無顯著大額異動。"
    let contextEmoji = "💤"

    if (filteredAlerts.length > 0) {
        const longCount = filteredAlerts.filter(a => a.position_size > 0).length
        const shortCount = filteredAlerts.filter(a => a.position_size < 0).length

        // Calculate Buy/Sell pressure
        let buyVol = 0
        let sellVol = 0

        const symbolStats: Record<string, { buys: number, sells: number }> = {}

        filteredAlerts.forEach(a => {
            const isLong = a.position_size > 0
            const isOpen = a.position_action === 1
            const val = Math.abs(a.position_value_usd || 0)
            const sym = a.symbol

            if (!symbolStats[sym]) symbolStats[sym] = { buys: 0, sells: 0 }

            if ((isLong && isOpen) || (!isLong && !isOpen)) {
                buyVol += val
                symbolStats[sym].buys += val
            } else {
                sellVol += val
                symbolStats[sym].sells += val
            }
        })

        // Find dominant logics
        const sortedSymbols = Object.keys(symbolStats).sort((a, b) =>
            (symbolStats[b].buys + symbolStats[b].sells) - (symbolStats[a].buys + symbolStats[a].sells)
        )
        const topSymbol = sortedSymbols[0]
        const secondSymbol = sortedSymbols[1]

        const bias = buyVol > sellVol * 1.2 ? "多頭主導" : sellVol > buyVol * 1.2 ? "空頭主導" : "多空拉鋸"
        contextEmoji = buyVol > sellVol * 1.2 ? "🐂" : sellVol > buyVol * 1.2 ? "🐻" : "⚖️"

        // Narrative construction
        // Richer narrative: "BTC 巨鯨出現主動佈局（淨流入 $50M），ETH 則遭大額拋售，整體市場多頭主導。"
        const getActionText = (sym: string) => {
            const stats = symbolStats[sym]
            const net = stats.buys - stats.sells
            const netStr = net >= 1000000 ? `$${(Math.abs(net) / 1000000).toFixed(1)}M` : `$${(Math.abs(net) / 1000).toFixed(0)}K`
            const action = net > 0 ? "持續吸籌" : "大額倒貨"
            const direction = net > 0 ? "淨流入" : "淨流出"
            return `${sym} 巨鯨${action}（${direction} ${netStr}）`
        }

        let narrative = getActionText(topSymbol)
        if (secondSymbol) {
            narrative += `，${getActionText(secondSymbol)}`
        }

        const totalVol = buyVol + sellVol
        const ratio = sellVol > 0 ? (buyVol / sellVol).toFixed(1) : "∞"

        contextText = `${narrative}。近一小時整體${bias}，多空比約 ${ratio}。`
    }

    // Loading Skeleton
    if (loading) {
        return (
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden animate-pulse">
                {/* AI Context Skeleton */}
                <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-b border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
                        <Skeleton className="h-4 w-28 bg-neutral-700" />
                    </div>
                    <Skeleton className="h-3 w-full bg-neutral-700 mb-2" />
                    <Skeleton className="h-3 w-3/4 bg-neutral-700" />
                </div>

                {/* List Header Skeleton */}
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50">
                    <Skeleton className="h-3 w-24 bg-neutral-700" />
                    <Skeleton className="h-3 w-12 bg-neutral-700" />
                </div>

                {/* Whale Items Skeleton */}
                <div className="p-0">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between px-3 py-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-10 h-4 bg-neutral-700" />
                                <Skeleton className="w-16 h-5 rounded bg-neutral-700" />
                            </div>
                            <Skeleton className="w-14 h-4 bg-neutral-700" />
                            <Skeleton className="w-10 h-3 bg-neutral-700" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Empty State
    if (!alerts || alerts.length === 0) {
        return (
            <div className="bg-neutral-900/50 rounded-xl p-4 text-center border border-dashed border-white/10">
                <Radar className="w-5 h-5 text-neutral-600 mx-auto mb-1" />
                <p className="text-xs text-neutral-500">暫無巨鯨快訊</p>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden relative group">
            {/* Key Context Card (The "Soul" of the page) */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-b border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{contextEmoji}</span>
                    <h3 className="text-sm font-bold text-blue-200">市場脈絡 (巨鯨)</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {contextText}
                </p>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50">
                <div className="flex items-center gap-2">
                    <Radar className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-400">巨鯨快訊</span>
                    <span className="text-[9px] font-mono text-neutral-600 border-l border-white/10 pl-2">
                        ≥ $1M｜近 60 分鐘
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] text-green-500 font-bold font-mono">LIVE</span>
                </div>
            </div>

            {/* List Content - Full Height */}
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                {filteredAlerts.length === 0 && (
                    <div className="text-center py-6 text-xs text-neutral-500 font-mono">
                        無 {'>'}$1M 巨鯨操作
                    </div>
                )}

                {filteredAlerts.slice(0, 30).map((alert, i) => {
                    const positionSize = alert.position_size || 0
                    const isLong = positionSize > 0
                    const positionValue = Math.abs(alert.position_value_usd || 0)
                    const isOpen = alert.position_action === 1 // 1=開倉, 2=平倉

                    const isBuyPressure = (isLong && isOpen) || (!isLong && !isOpen)
                    const actionColor = isBuyPressure ? "text-green-400" : "text-red-400"
                    const actionBg = isBuyPressure ? "bg-green-500/10" : "bg-red-500/10"

                    const formatAmt = positionValue >= 1000000 ? `$${(positionValue / 1000000).toFixed(1)}M` : `$${(positionValue / 1000).toFixed(0)}K`

                    return (
                        <div key={i} className="flex items-center justify-between text-[11px] px-3 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2">
                                {/* Symbol */}
                                <span className={cn(
                                    "font-bold w-10 text-left",
                                    isLong ? "text-white" : "text-white"
                                )}>{alert.symbol}</span>

                                {/* Action Badge */}
                                <div className={cn(
                                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono",
                                    actionBg, actionColor
                                )}>
                                    <span>{isLong ? (isOpen ? '↑' : '↓') : (isOpen ? '↓' : '↑')}</span>
                                    <span className="font-bold">
                                        {isLong ? '多・開倉' : '多・平倉'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={cn("font-mono font-bold", isBuyPressure ? "text-white" : "text-white")}>
                                    {formatAmt}
                                </span>
                                <span className="text-neutral-600 text-[10px] w-[30px] text-right">
                                    {new Date(alert.create_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function WhaleAiSummaryCard() {
    const [fetchedSummary, setFetchedSummary] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/whales')
                const json = await res.json()
                if (json.whales?.summary) {
                    setFetchedSummary(json.whales.summary)
                }
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) return <Skeleton className="h-24 w-full bg-neutral-900/50 rounded-xl" />
    if (!fetchedSummary) return null

    return (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none -mt-10 -mr-10"></div>

            <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-500/20 p-1.5 rounded-lg">
                    <Users className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-sm font-bold text-white">AI 巨鯨速覽</h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                    Smart Money Analysis
                </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-medium relative z-10">
                {fetchedSummary}
            </p>
        </div>
    )
}

export function WhalePositionsList() {
    const [fetchedPositions, setFetchedPositions] = useState<any[]>([])
    const [fetchedSummary, setFetchedSummary] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/whales')
                const json = await res.json()
                if (json.whales?.positions) {
                    setFetchedPositions(json.whales.positions)
                }
                if (json.whales?.summary) {
                    setFetchedSummary(json.whales.summary)
                }
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const data = fetchedPositions || []
    const summaryText = fetchedSummary

    // Helper: shorten address
    const shortenAddress = (addr: string) => {
        if (!addr || addr.length < 12) return addr
        return `${addr.slice(0, 5)}...${addr.slice(-5)}`
    }

    const formatUsd = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
        return `$${val.toFixed(0)}`
    }

    if (loading) return <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />

    if (!data || data.length === 0) {
        return (
            <div className="bg-neutral-900/50 rounded-xl p-6 text-center border border-dashed border-white/10">
                <Users className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-500">暫無持倉數據</p>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-2 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-white">Top 20 巨鯨持倉</span>
            </div>
            {/* ... */}
        </div>
    )
}

export function DerivativesAiSummaryCard() {
    const [summary, setSummary] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/market/derivatives')
                const data = await res.json()
                if (data.summary) {
                    setSummary(data.summary)
                }
            } catch (e) {
                console.error('Failed to fetch derivatives summary', e)
            } finally {
                setLoading(false)
            }
        }
        fetchSummary()
    }, [])

    // Loading Skeleton
    if (loading) {
        return (
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden mb-5 animate-pulse">
                <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
                        <Skeleton className="h-4 w-28 bg-neutral-700" />
                    </div>
                    <Skeleton className="h-3 w-full bg-neutral-700 mb-2" />
                    <Skeleton className="h-3 w-3/4 bg-neutral-700" />
                </div>
            </div>
        )
    }

    if (!summary) return null

    // Determine emoji based on content
    let contextEmoji = '⚡️'
    if (summary.includes('多頭') || summary.includes('偏多') || summary.includes('接多')) {
        contextEmoji = '🐂'
    } else if (summary.includes('空頭') || summary.includes('偏空') || summary.includes('找空')) {
        contextEmoji = '🐻'
    } else if (summary.includes('震盪') || summary.includes('觀望')) {
        contextEmoji = '⚖️'
    }

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden mb-5">
            {/* AI Context Card (Same style as Whale page) */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{contextEmoji}</span>
                    <h3 className="text-sm font-bold text-blue-200">市場脈絡 (合約)</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {summary}
                </p>
            </div>
        </div>
    )
}

// ============================================
// Bitcoin Indicators Grid Component
// ============================================
export function IndicatorsGrid({ compact = false }: { compact?: boolean }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/indicators')
                const json = await res.json()
                setData(json.indicators)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full bg-neutral-900/50 rounded-xl" />)}
            </div>
        )
    }

    if (!data) return null

    const colorMap: Record<string, string> = {
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
    }

    const indicators = [
        {
            name: 'AHR999 屯幣指標',
            value: data.ahr999?.value,
            signal: data.ahr999?.signal,
            color: data.ahr999?.color,
            description: data.ahr999?.description,
            tooltip: {
                term: 'AHR999 屯幣指標',
                definition: '衡量比特幣是否適合定投的指標。',
                explanation: (
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>&lt; 0.45</strong>：抄底區，歷史性買入機會</li>
                        <li><strong>&lt; 1.2</strong>：定投區，適合定期買入</li>
                        <li><strong>1.2-4</strong>：觀望區，減少買入</li>
                        <li><strong>&gt; 4</strong>：賣出區，考慮獲利了結</li>
                    </ul>
                ),
            },
        },
        {
            name: '泡沫指數',
            value: data.bubbleIndex?.value,
            signal: data.bubbleIndex?.signal,
            color: data.bubbleIndex?.color,
            description: data.bubbleIndex?.description,
            tooltip: {
                term: 'Bitcoin Bubble Index',
                definition: '根據鏈上數據計算的估值指標。',
                explanation: (
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>&lt; -2</strong>：嚴重低估，恐慌拋售</li>
                        <li><strong>-2 到 0</strong>：低估區，買入機會</li>
                        <li><strong>0-20</strong>：合理區間</li>
                        <li><strong>&gt; 20</strong>：泡沫區，謹慎</li>
                    </ul>
                ),
            },
        },
        {
            name: 'Puell 礦工指標',
            value: data.puellMultiple?.value,
            signal: data.puellMultiple?.signal,
            color: data.puellMultiple?.color,
            description: data.puellMultiple?.description,
            tooltip: {
                term: 'Puell Multiple (礦工指標)',
                definition: '衡量礦工收益是否過高或過低。',
                explanation: (
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>&lt; 0.5</strong>：礦工投降，通常是底部</li>
                        <li><strong>0.5-1</strong>：礦工低迷，市場低估</li>
                        <li><strong>1-4</strong>：正常範圍</li>
                        <li><strong>&gt; 4</strong>：礦工過度獲利，警惕頂部</li>
                    </ul>
                ),
            },
        },
        {
            name: '牛市頂部指標',
            value: `${data.bullMarketPeak?.hitCount}/${data.bullMarketPeak?.totalCount}`,
            signal: data.bullMarketPeak?.signal,
            color: data.bullMarketPeak?.color,
            description: data.bullMarketPeak?.description,
            tooltip: {
                term: '牛市頂部指標',
                definition: '綜合 30 個鏈上指標判斷是否見頂。',
                explanation: (
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>0 觸發</strong>：市場安全</li>
                        <li><strong>&lt; 20%</strong>：牛市早期</li>
                        <li><strong>20-50%</strong>：開始警戒</li>
                        <li><strong>&gt; 50%</strong>：牛市後期，考慮減倉</li>
                    </ul>
                ),
            },
        },
    ]


    if (compact) {
        // Compact version for homepage - single column, unified style
        return (
            <div className="space-y-2">
                {indicators.map((ind, i) => (
                    <div
                        key={i}
                        className="bg-neutral-900/50 rounded-xl border border-white/5 p-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-400">{ind.name}</span>
                                <ExplainTooltip {...ind.tooltip} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold font-mono text-white">{ind.value}</span>
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                    ind.color === 'green' && 'text-green-400',
                                    ind.color === 'blue' && 'text-blue-400',
                                    ind.color === 'yellow' && 'text-yellow-400',
                                    ind.color === 'orange' && 'text-orange-400',
                                    ind.color === 'red' && 'text-red-400',
                                    !ind.color && 'text-neutral-400'
                                )}>
                                    {ind.signal}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Full version for data page
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {indicators.map((ind, i) => (
                    <div
                        key={i}
                        className={cn(
                            "rounded-xl p-4 border transition-all",
                            colorMap[ind.color] || 'bg-neutral-900/30 border-white/5'
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-neutral-400">{ind.name}</span>
                            <ExplainTooltip {...ind.tooltip} />
                        </div>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-2xl font-bold font-mono">{ind.value}</span>
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded font-medium",
                                ind.color === 'green' && 'bg-green-500/20 text-green-400',
                                ind.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                                ind.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400',
                                ind.color === 'orange' && 'bg-orange-500/20 text-orange-400',
                                ind.color === 'red' && 'bg-red-500/20 text-red-400',
                            )}>
                                {ind.signal}
                            </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-relaxed">{ind.description}</p>
                    </div>
                ))}
            </div>

            {/* Bull Market Peak Details */}
            {data.bullMarketPeak?.indicators && (
                <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-neutral-400 mb-3">🎯 頂部指標詳情</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {data.bullMarketPeak.indicators.map((ind: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        ind.hit ? "bg-red-500" : "bg-green-500"
                                    )} />
                                    <span className="text-neutral-300 truncate max-w-[150px]">{ind.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-neutral-400">{ind.currentValue}</span>
                                    <span className="text-neutral-600">/</span>
                                    <span className="font-mono text-neutral-500">{ind.targetValue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-neutral-900 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-neutral-500">
                    💡 這些指標基於鏈上數據計算，適合長線投資參考。短線交易請結合技術面和衍生品數據。
                </p>
            </div>
        </div>
    )
}
