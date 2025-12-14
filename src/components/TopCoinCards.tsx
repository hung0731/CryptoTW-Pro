'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CoinPrice {
    symbol: string
    name: string
    price: number
    change24h: number
    sparkline: number[]
}

// Simple SVG sparkline
function Sparkline({ data, color }: { data: number[], color: string }) {
    if (!data || data.length < 2) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const width = 60
    const height = 24
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} className="opacity-60">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function TopCoinCards() {
    const [coins, setCoins] = useState<CoinPrice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const symbols = [
                    { instId: 'BTC-USDT', name: '比特幣', symbol: 'BTC' },
                    { instId: 'ETH-USDT', name: '以太幣', symbol: 'ETH' },
                    { instId: 'SOL-USDT', name: 'Solana', symbol: 'SOL' }
                ]

                const results = await Promise.all(
                    symbols.map(async (s) => {
                        // Fetch ticker data
                        const tickerRes = await fetch(
                            `https://www.okx.com/api/v5/market/ticker?instId=${s.instId}`
                        )
                        const tickerData = await tickerRes.json()
                        const ticker = tickerData.data?.[0]

                        // Fetch 24h candles for sparkline
                        const candleRes = await fetch(
                            `https://www.okx.com/api/v5/market/candles?instId=${s.instId}&bar=1H&limit=24`
                        )
                        const candleData = await candleRes.json()
                        const candles = candleData.data || []

                        // OKX candle format: [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
                        // Extract close prices for sparkline (reversed because OKX returns newest first)
                        const sparkline = candles.map((c: any[]) => parseFloat(c[4])).reverse()

                        const price = parseFloat(ticker?.last || '0')
                        const open24h = parseFloat(ticker?.open24h || '0')
                        const change24h = open24h > 0 ? ((price - open24h) / open24h) * 100 : 0

                        return {
                            symbol: s.symbol,
                            name: s.name,
                            price,
                            change24h,
                            sparkline
                        }
                    })
                )

                setCoins(results)
            } catch (e) {
                console.error('OKX API fetch error:', e)
                // Fallback
                setCoins([
                    { symbol: 'BTC', name: '比特幣', price: 0, change24h: 0, sparkline: [] },
                    { symbol: 'ETH', name: '以太幣', price: 0, change24h: 0, sparkline: [] },
                    { symbol: 'SOL', name: 'Solana', price: 0, change24h: 0, sparkline: [] }
                ])
            } finally {
                setLoading(false)
            }
        }
        fetchPrices()
    }, [])

    if (loading) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Skeleton className="h-20 w-28 shrink-0 bg-neutral-900/50 rounded-xl" />
                <Skeleton className="h-20 w-28 shrink-0 bg-neutral-900/50 rounded-xl" />
                <Skeleton className="h-20 w-28 shrink-0 bg-neutral-900/50 rounded-xl" />
            </div>
        )
    }

    const formatPrice = (price: number) => {
        if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
        if (price >= 100) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
        return price.toLocaleString('en-US', { maximumFractionDigits: 4 })
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {coins.map((coin) => {
                const isUp = coin.change24h >= 0
                const color = isUp ? '#22c55e' : '#ef4444' // green-500 : red-500
                const textColor = isUp ? 'text-green-400' : 'text-red-400'
                const bgColor = isUp ? 'bg-green-500/10' : 'bg-red-500/10'
                const borderColor = isUp ? 'border-green-500/20' : 'border-red-500/20'

                return (
                    <div
                        key={coin.symbol}
                        className={cn(
                            "rounded-xl p-3 min-w-[100px] shrink-0 border transition-all flex flex-col justify-between h-[80px]",
                            bgColor, borderColor
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-white opacity-80">{coin.symbol}</span>
                            <Sparkline data={coin.sparkline} color={color} />
                        </div>

                        <div className="flex items-end gap-1">
                            <span className={cn("text-xl font-bold font-mono tracking-tighter leading-none", textColor)}>
                                {isUp ? '+' : ''}{coin.change24h.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
