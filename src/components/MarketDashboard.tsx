'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Gauge } from 'lucide-react'
import { UniversalCard } from '@/components/ui/UniversalCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens'

// Types
interface CryptoPrice {
    id: string
    symbol: string
    current_price: number
    price_change_percentage_24h: number
    image: string
}

interface FearGreedData {
    value: string
    value_classification: string
    timestamp: string
}

export default function MarketDashboard() {
    const [prices, setPrices] = useState<CryptoPrice[]>([])
    const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pricesRes = await fetch(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=false'
                )
                const pricesData = await pricesRes.json()

                const fgRes = await fetch('https://api.alternative.me/fng/')
                const fgData = await fgRes.json()

                if (Array.isArray(pricesData)) {
                    setPrices(pricesData)
                }
                if (fgData.data && fgData.data.length > 0) {
                    setFearGreed(fgData.data[0])
                }
            } catch (e) {
                console.error('Market Data Error:', e)
            } finally {
                setLoading(false)
            }
        }

        void fetchData()
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="container px-4 mb-8">
                <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
            </div>
        )
    }

    return (
        <section className="container px-4 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Ticker Strip */}
                <UniversalCard variant="default" className="lg:col-span-3 p-0 overflow-hidden flex items-center">
                    <div className="p-0 w-full overflow-x-auto no-scrollbar">
                        <div className="flex items-center divide-x divide-white/[0.08] min-w-max">
                            {prices.map((coin: CryptoPrice) => (
                                <div key={coin.id} className="flex items-center gap-3 px-6 py-4 min-w-[200px] hover:bg-white/[0.03] transition-colors">
                                    <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full shadow-lg" />
                                    <div>
                                        <div className="font-bold text-white uppercase flex items-center gap-2 text-sm">
                                            {coin.symbol}
                                            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900/50 border border-white/5 px-1.5 py-0.5 rounded uppercase">USD</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-0.5">
                                            <span className="font-mono font-bold text-neutral-200 tabular-nums">${coin.current_price.toLocaleString()}</span>
                                            <span className={`flex items-center text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </UniversalCard>

                {/* Fear & Greed Index */}
                {fearGreed && (
                    <UniversalCard variant="highlight" className="relative overflow-hidden group p-0 border-[#F59E0B]/20">
                        {/* Dynamic Background Gradient */}
                        <div
                            className={cn(
                                "absolute inset-0 opacity-10 transition-colors duration-500",
                                Number(fearGreed.value) > 50 ? 'bg-gradient-to-br from-emerald-500 to-emerald-900' : 'bg-gradient-to-br from-red-500 to-red-900'
                            )}
                        />

                        <div className="p-4 relative z-10 flex items-center justify-between h-full">
                            <div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Gauge className="w-3 h-3 text-[#F59E0B]" /> 市場情緒
                                </div>
                                <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
                                    {fearGreed.value} <span className="text-xs font-medium text-neutral-500 font-mono">/ 100</span>
                                </div>
                                <div className={cn(
                                    "text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full inline-block border",
                                    Number(fearGreed.value) > 75 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                        Number(fearGreed.value) > 50 ? 'text-emerald-300 bg-emerald-500/5 border-emerald-500/10' :
                                            Number(fearGreed.value) < 25 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                )}>
                                    {Number(fearGreed.value) > 75 ? '極度貪婪 🤑' :
                                        Number(fearGreed.value) > 50 ? '貪婪 🐂' :
                                            Number(fearGreed.value) < 25 ? '極度恐慌 😱' : '恐慌 🐻'}
                                </div>
                            </div>

                            {/* Visual Indicator Circle */}
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                                    <circle
                                        cx="24" cy="24" r="20"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={126}
                                        strokeDashoffset={126 - (126 * Number(fearGreed.value)) / 100}
                                        className={cn(
                                            "transition-all duration-1000",
                                            Number(fearGreed.value) > 50 ? 'text-emerald-500' : 'text-orange-500'
                                        )}
                                    />
                                </svg>
                                <span className="absolute text-[10px] font-mono font-bold text-white/40">{fearGreed.value}</span>
                            </div>
                        </div>
                    </UniversalCard>
                )}
            </div>
        </section>
    )
}
