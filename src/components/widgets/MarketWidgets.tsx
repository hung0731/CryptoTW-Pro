'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'
import { CARDS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { formatPercent, formatPrice } from '@/lib/format-helpers'
import { logger } from '@/lib/logger'

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
            } catch (e) { logger.error('Failed to fetch exchange data', e as Error, { feature: 'market-widgets' }) }
            finally { setLoading(false) }
        }
        void fetchData()
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
            <div className={cn(CARDS.primary, SPACING.card, "flex items-center justify-between")}>
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
            <div className={cn(CARDS.primary, "overflow-hidden")}>
                <div className="grid grid-cols-12 gap-2 p-3 bg-black/20 text-[10px] text-neutral-500 font-medium border-b border-white/5">
                    <div className="col-span-4">交易所</div>
                    <div className="col-span-4 text-right">持有量</div>
                    <div className="col-span-4 text-right">24H 變化</div>
                </div>
                <div className="divide-y divide-white/5">
                    {(data.items || []).map((item: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-[#0E0E0F]">
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
// ETF Flow Card (P1)
// ============================================
export function ETFFlowCard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/etf-flow')
                const json = await res.json()
                if (!json.error) setData(json)
            } catch (e) { logger.error('Failed to fetch ETF flow', e as Error, { feature: 'market-widgets' }) }
            finally { setLoading(false) }
        }
        void fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-28 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data?.latest) return null

    const flow = data.latest.flowUsd
    const isPositive = flow > 0
    const flowDisplay = Math.abs(flow) >= 1_000_000_000
        ? `$${(Math.abs(flow) / 1_000_000_000).toFixed(2)}B`
        : `$${(Math.abs(flow) / 1_000_000).toFixed(0)}M`

    const flow7dDisplay = Math.abs(data.flow7d) >= 1_000_000_000
        ? `$${(Math.abs(data.flow7d) / 1_000_000_000).toFixed(2)}B`
        : `$${(Math.abs(data.flow7d) / 1_000_000).toFixed(0)}M`

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">🏛️</span>
                    <span className="text-xs font-bold text-white">ETF 資金流</span>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.etfFlow.term}
                        definition={INDICATOR_KNOWLEDGE.etfFlow.definition}
                        explanation={INDICATOR_KNOWLEDGE.etfFlow.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.etfFlow.timeline}
                    />
                </div>
                <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                    {isPositive ? '流入' : '流出'}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={cn(
                    "text-xl font-bold font-mono",
                    isPositive ? "text-green-400" : "text-red-400"
                )}>
                    {isPositive ? '+' : '-'}{flowDisplay}
                </span>
                <span className="text-xs text-neutral-500">今日</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400">
                <span>7D: <span className={data.flow7d > 0 ? 'text-green-400' : 'text-red-400'}>{data.flow7d > 0 ? '+' : ''}{flow7dDisplay}</span></span>
                <span className="text-neutral-600">|</span>
                <span>BTC {formatPrice(data.latest.priceUsd)}</span>
            </div>
        </div>
    )
}

// ============================================
// Bubble Index Card (P1)
// ============================================
export function BubbleIndexCard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/bubble-index')
                const json = await res.json()
                if (!json.error) setData(json)
            } catch (e) { logger.error('Failed to fetch bubble index', e as Error, { feature: 'market-widgets' }) }
            finally { setLoading(false) }
        }
        void fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-28 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data?.latest) return null

    const bubbleIndex = data.latest.bubbleIndex
    const getColor = () => {
        if (bubbleIndex > 4) return { text: 'text-red-400', bg: 'bg-red-500/20', label: '風險偏高' }
        if (bubbleIndex > 1) return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', label: '風險升高' }
        if (bubbleIndex < 0.45) return { text: 'text-green-400', bg: 'bg-green-500/20', label: '風險偏低' }
        return { text: 'text-neutral-400', bg: 'bg-neutral-500/20', label: '風險中等' }
    }
    const style = getColor()

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">🫧</span>
                    <span className="text-xs font-bold text-white">週期風險</span>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.bubbleIndex.term}
                        definition={INDICATOR_KNOWLEDGE.bubbleIndex.definition}
                        explanation={INDICATOR_KNOWLEDGE.bubbleIndex.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.bubbleIndex.timeline}
                    />
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", style.bg, style.text)}>
                    {style.label}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-xl font-bold font-mono", style.text)}>
                    {bubbleIndex.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-500">週期指標</span>
            </div>
            <div className="mt-2 text-[10px] text-neutral-400">
                <span>BTC {formatPrice(data.latest.price)}</span>
                <span className="mx-2 text-neutral-600">|</span>
                <span>{data.latest.date}</span>
            </div>
        </div>
    )
}

// ============================================
// Taker Buy/Sell Card (P1)
// ============================================
export function TakerVolumeCard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/taker-volume')
                const json = await res.json()
                if (!json.error) setData(json)
            } catch (e) { logger.error('Failed to fetch taker volume', e as Error, { feature: 'market-widgets' }) }
            finally { setLoading(false) }
        }
        void fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-28 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    const ratio = data.ratio
    const getColor = () => {
        if (ratio > 1.2) return { text: 'text-green-400', bg: 'bg-green-500/20', label: '買方強勢' }
        if (ratio > 1.05) return { text: 'text-green-400/80', bg: 'bg-green-500/10', label: '買方偏強' }
        if (ratio < 0.8) return { text: 'text-red-400', bg: 'bg-red-500/20', label: '賣方強勢' }
        if (ratio < 0.95) return { text: 'text-red-400/80', bg: 'bg-red-500/10', label: '賣方偏強' }
        return { text: 'text-neutral-400', bg: 'bg-neutral-500/20', label: '均衡' }
    }
    const style = getColor()

    const buyDisplay = (data.totalBuyUsd / 1_000_000).toFixed(0)
    const sellDisplay = (data.totalSellUsd / 1_000_000).toFixed(0)

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">🛒</span>
                    <span className="text-xs font-bold text-white">主動買賣比</span>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.takerBuySell.term}
                        definition={INDICATOR_KNOWLEDGE.takerBuySell.definition}
                        explanation={INDICATOR_KNOWLEDGE.takerBuySell.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.takerBuySell.timeline}
                    />
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", style.bg, style.text)}>
                    {style.label}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-xl font-bold font-mono", style.text)}>
                    {ratio.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-500">4H</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px]">
                <span className="text-green-400/80">買 ${buyDisplay}M</span>
                <span className="text-neutral-600">vs</span>
                <span className="text-red-400/80">賣 ${sellDisplay}M</span>
            </div>
        </div>
    )
}

// ============================================
// Stablecoin Market Cap Card (A級)
// ============================================
export function StablecoinCard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/stablecoin')
                const json = await res.json()
                if (!json.error) setData(json)
            } catch (e) { logger.error('Failed to fetch stablecoin data', e as Error, { feature: 'market-widgets' }) }
            finally { setLoading(false) }
        }
        void fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-28 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data?.latest) return null

    const change7d = data.change7d
    const isPositive = change7d > 0
    const getStyle = () => {
        if (change7d > 2) return { text: 'text-green-400', bg: 'bg-green-500/20', label: '資金進場' }
        if (change7d > 0) return { text: 'text-green-400/80', bg: 'bg-green-500/10', label: '微幅增加' }
        if (change7d < -2) return { text: 'text-red-400', bg: 'bg-red-500/20', label: '資金撤離' }
        if (change7d < 0) return { text: 'text-red-400/80', bg: 'bg-red-500/10', label: '微幅減少' }
        return { text: 'text-neutral-400', bg: 'bg-neutral-500/20', label: '穩定' }
    }
    const style = getStyle()

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">💵</span>
                    <span className="text-xs font-bold text-white">穩定幣市值</span>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.stablecoinMarketCap.term}
                        definition={INDICATOR_KNOWLEDGE.stablecoinMarketCap.definition}
                        explanation={INDICATOR_KNOWLEDGE.stablecoinMarketCap.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.stablecoinMarketCap.timeline}
                    />
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", style.bg, style.text)}>
                    {style.label}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-white">
                    {data.latest.marketCapFormatted}
                </span>
                <span className="text-xs text-neutral-500">乾火藥</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400">
                <span>7D: <span className={isPositive ? 'text-green-400' : 'text-red-400'}>{formatPercent(change7d)}</span></span>
                <span className="text-neutral-600">|</span>
                <span>30D: <span className={data.change30d > 0 ? 'text-green-400' : 'text-red-400'}>{formatPercent(data.change30d)}</span></span>
            </div>
        </div>
    )
}

// ============================================
// Coinbase Premium Card (B級)
// ============================================
export function CoinbasePremiumCard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/coinglass/coinbase-premium')
                const json = await res.json()
                if (!json.error) setData(json)
            } catch (e) { logger.error('Failed to fetch coinbase premium', e as Error, { feature: 'market-widgets' }) }
            finally { setLoading(false) }
        }
        void fetchData()
    }, [])

    if (loading) {
        return <Skeleton className="h-28 w-full bg-neutral-900/50 rounded-xl" />
    }

    if (!data?.latest) return null

    const premium = data.latest.premium
    const getStyle = () => {
        if (premium > 0.1) return { text: 'text-green-400', bg: 'bg-green-500/20', label: '美國買盤' }
        if (premium > 0) return { text: 'text-green-400/80', bg: 'bg-green-500/10', label: '微正溢價' }
        if (premium < -0.1) return { text: 'text-red-400', bg: 'bg-red-500/20', label: '亞洲主導' }
        if (premium < 0) return { text: 'text-red-400/80', bg: 'bg-red-500/10', label: '微負溢價' }
        return { text: 'text-neutral-400', bg: 'bg-neutral-500/20', label: '中性' }
    }
    const style = getStyle()

    return (
        <div className={cn(CARDS.primary, SPACING.cardCompact)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">🇺🇸</span>
                    <span className="text-xs font-bold text-white">Coinbase 溢價</span>
                    <ExplainTooltip
                        term={INDICATOR_KNOWLEDGE.coinbasePremium.term}
                        definition={INDICATOR_KNOWLEDGE.coinbasePremium.definition}
                        explanation={INDICATOR_KNOWLEDGE.coinbasePremium.interpretation}
                        timeline={INDICATOR_KNOWLEDGE.coinbasePremium.timeline}
                    />
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", style.bg, style.text)}>
                    {style.label}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-xl font-bold font-mono", style.text)}>
                    {data.latest.premiumFormatted}
                </span>
                <span className="text-xs text-neutral-500">vs 幣安</span>
            </div>
            <div className="mt-2 text-[10px] text-neutral-400">
                <span>7D 均值: <span className={data.avg7d > 0 ? 'text-green-400' : 'text-red-400'}>{formatPercent(data.avg7d)}</span></span>
            </div>
        </div>
    )
}
