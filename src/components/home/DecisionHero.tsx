'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ChevronRight, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { MarketStatusData, Conclusion } from '@/lib/types'

interface JudgmentCardProps {
    initialStatus: MarketStatusData | null
    initialConclusion: Conclusion | null
}

interface BtcTicker {
    price: number
    change_24h: number
}

type MarketBias = 'bullish' | 'bearish' | 'neutral'

const biasConfig = {
    bullish: {
        Icon: TrendingUp,
        label: '偏多',
        color: '#22C55E',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
    },
    bearish: {
        Icon: TrendingDown,
        label: '偏空',
        color: '#EF4444',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
    },
    neutral: {
        Icon: Minus,
        label: '觀望',
        color: '#F59E0B',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
    },
}

function determineBias(status: MarketStatusData): MarketBias {
    const { sentiment, leverage, whale, volatility } = status
    let score = 0

    if (sentiment.code === 'greed') score += 2
    if (sentiment.code === 'fear') score -= 2
    if (leverage.code === 'overheated') score -= 1
    if (leverage.code === 'cool') score += 1
    if (whale.code === 'bullish') score += 1.5
    if (whale.code === 'bearish') score -= 1.5
    if (volatility.code === 'low') score += 0.5
    if (volatility.code === 'high') score -= 0.5

    if (score >= 1) return 'bullish'
    if (score <= -1) return 'bearish'
    return 'neutral'
}

// Get health signals from status
function getHealthSignals(status: MarketStatusData) {
    const signals = [
        {
            label: '市場情緒',
            ok: status.sentiment.code !== 'fear',
            warn: status.sentiment.code === 'greed',
        },
        {
            label: '槓桿水位',
            ok: status.leverage.code !== 'overheated',
            warn: status.leverage.code === 'overheated',
        },
        {
            label: '巨鯨動向',
            ok: status.whale.code !== 'bearish',
            warn: status.whale.code === 'bearish',
        },
        {
            label: '市場波動',
            ok: status.volatility.code !== 'high',
            warn: status.volatility.code === 'high',
        },
    ]
    const warningCount = signals.filter(s => s.warn).length
    return { signals, warningCount }
}

// Stable sparkline
function Sparkline({ prices, color }: { prices: number[], color: string }) {
    const basePrice = prices.length > 0 ? prices[0] : 0

    const pathData = React.useMemo(() => {
        if (prices.length < 3 || basePrice === 0) return null

        const step = Math.max(1, Math.floor(prices.length / 50))
        const sampled: number[] = []
        for (let i = 0; i < prices.length; i += step) sampled.push(prices[i])
        if (sampled[sampled.length - 1] !== prices[prices.length - 1]) {
            sampled.push(prices[prices.length - 1])
        }

        const rangePercent = 0.005
        const min = basePrice * (1 - rangePercent)
        const max = basePrice * (1 + rangePercent)
        const range = max - min

        const points = sampled.map((p, i) => ({
            x: (i / (sampled.length - 1)) * 100,
            y: Math.max(5, Math.min(45, 48 - ((p - min) / range) * 43))
        }))

        const d = `M${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}`
        return { linePath: d, areaPath: `${d} L100,50 L0,50 Z` }
    }, [prices, basePrice])

    if (!pathData) return null

    return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.08" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={pathData.areaPath} fill="url(#sparkGrad)" />
            <path d={pathData.linePath} stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" strokeLinejoin="round" />
        </svg>
    )
}

// Animated price
function AnimatedPrice({ price, prevPrice, change }: { price: number, prevPrice: number, change: number }) {
    const [displayPrice, setDisplayPrice] = useState(price)
    const [flash, setFlash] = useState<'up' | 'down' | null>(null)
    const animRef = useRef<number>(0)

    useEffect(() => {
        if (price === prevPrice) return
        setFlash(price > prevPrice ? 'up' : 'down')
        setTimeout(() => setFlash(null), 200)

        const start = displayPrice
        const diff = price - start
        const duration = 100
        const startTime = Date.now()

        const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1)
            setDisplayPrice(start + diff * (1 - Math.pow(1 - progress, 3)))
            if (progress < 1) animRef.current = requestAnimationFrame(animate)
        }
        animRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animRef.current)
    }, [price, prevPrice, displayPrice])

    const isUp = change >= 0

    return (
        <div className="flex items-baseline gap-2">
            <span className={cn(
                "font-mono font-bold text-2xl tabular-nums leading-none transition-colors duration-150",
                flash === 'up' ? "text-emerald-400" : flash === 'down' ? "text-red-400" : "text-white"
            )}>
                {Math.round(displayPrice).toLocaleString()}
            </span>
            <span className={cn(
                "font-mono text-xs font-bold",
                isUp ? "text-emerald-400" : "text-red-400"
            )}>
                {isUp ? '+' : ''}{change.toFixed(2)}%
            </span>
        </div>
    )
}

export function JudgmentCard({ initialStatus, initialConclusion }: JudgmentCardProps) {
    const [status] = useState<MarketStatusData | null>(initialStatus)
    const [conclusion] = useState<Conclusion | null>(initialConclusion)
    const [btc, setBtc] = useState<BtcTicker | null>(null)
    const [priceHistory, setPriceHistory] = useState<number[]>([])
    const prevPriceRef = useRef<number>(0)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tickerRes, klineRes] = await Promise.all([
                    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
                    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=300')
                ])
                const tickerData = await tickerRes.json()
                const klineData = await klineRes.json()

                const price = parseFloat(tickerData.lastPrice)
                setBtc({ price, change_24h: parseFloat(tickerData.priceChangePercent) })
                prevPriceRef.current = price
                setPriceHistory(klineData.map((k: any[]) => parseFloat(k[4])))
            } catch (e) {
                console.error('Binance init error:', e)
            }
        }
        fetchData()

        const connectWs = () => {
            const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1s')
            ws.onmessage = (e) => {
                const { k } = JSON.parse(e.data)
                const closePrice = parseFloat(k.c)
                setBtc(prev => {
                    if (!prev) return { price: closePrice, change_24h: 0 }
                    prevPriceRef.current = prev.price
                    return { ...prev, price: closePrice }
                })
                setPriceHistory(prev => [...prev, closePrice].slice(-300))
            }
            ws.onclose = () => setTimeout(connectWs, 3000)
            wsRef.current = ws
        }
        connectWs()

        return () => wsRef.current?.close()
    }, [])

    if (!status || !conclusion) {
        return <Skeleton className="h-[160px] w-full bg-[#0E0E0F] rounded-2xl" />
    }

    const bias = determineBias(status)
    const config = biasConfig[bias]
    const BiasIcon = config.Icon
    const isUp = btc ? btc.change_24h >= 0 : true
    const chartColor = isUp ? '#22C55E' : '#EF4444'
    const { signals, warningCount } = getHealthSignals(status)

    return (
        <div className={cn(
            "relative rounded-2xl border overflow-hidden bg-[#0A0A0A]",
            config.borderColor
        )}>
            {/* Background Chart */}
            <div className="absolute inset-0 pointer-events-none">
                <Sparkline prices={priceHistory} color={chartColor} />
            </div>

            {/* ===== TOP LAYER: Decision ===== */}
            <div className="relative p-4 pb-3">
                {/* Asset + Price */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] text-neutral-500 font-medium">BTC/USDT</span>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                isUp ? "bg-emerald-400" : "bg-red-400"
                            )} />
                        </div>
                        {btc ? (
                            <AnimatedPrice price={btc.price} prevPrice={prevPriceRef.current} change={btc.change_24h} />
                        ) : (
                            <div className="h-7 w-28 bg-white/10 rounded animate-pulse" />
                        )}
                    </div>

                    {/* Bias Badge */}
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        config.bgColor, "border", config.borderColor
                    )}>
                        <BiasIcon className={cn("w-4 h-4", config.textColor)} />
                        <span className={cn("text-sm font-bold", config.textColor)}>{config.label}</span>
                    </div>
                </div>

                {/* Conclusion */}
                <p className="text-[14px] text-neutral-200 leading-snug">
                    {conclusion.action}
                </p>
            </div>

            {/* ===== DIVIDER ===== */}
            <div className="border-t border-white/5" />

            {/* ===== BOTTOM LAYER: Health Check ===== */}
            <div className="relative px-3 py-3 bg-black/20">
                {/* Health Signal Cards - Grid Layout */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                    {signals.slice(0, 3).map((signal, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border",
                                signal.warn
                                    ? "border-amber-500/30 bg-amber-500/5"
                                    : "border-neutral-700/50 bg-black/30"
                            )}
                        >
                            {signal.warn ? (
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                                <Check className="w-3 h-3 text-emerald-500/70 shrink-0" />
                            )}
                            <span className={cn(
                                "text-[10px] font-medium truncate",
                                signal.warn ? "text-amber-400" : "text-neutral-400"
                            )}>
                                {signal.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {signals.slice(3).map((signal, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border",
                                signal.warn
                                    ? "border-amber-500/30 bg-amber-500/5"
                                    : "border-neutral-700/50 bg-black/30"
                            )}
                        >
                            {signal.warn ? (
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                                <Check className="w-3 h-3 text-emerald-500/70 shrink-0" />
                            )}
                            <span className={cn(
                                "text-[10px] font-medium truncate",
                                signal.warn ? "text-amber-400" : "text-neutral-400"
                            )}>
                                {signal.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Summary + CTA */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                    <span className={cn(
                        "text-[11px] font-medium",
                        warningCount === 0 ? "text-neutral-500" : "text-amber-400"
                    )}>
                        {warningCount === 0 ? '✓ 盤面健康' : `⚠ ${warningCount} 項需留意`}
                    </span>
                    <Link
                        href="/calendar"
                        className="flex items-center gap-0.5 text-[11px] text-neutral-500 hover:text-white transition-colors"
                    >
                        <span>檢查風險訊號</span>
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

// Re-export as DecisionHero for backward compatibility
export { JudgmentCard as DecisionHero }
