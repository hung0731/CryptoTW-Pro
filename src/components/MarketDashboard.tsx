'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Gauge } from 'lucide-react'

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
                // 1. Fetch Crypto Prices (CoinGecko)
                // IDs: bitcoin, ethereum, solana
                const pricesRes = await fetch(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=false'
                )
                const pricesData = await pricesRes.json()

                // 2. Fetch Fear & Greed
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
        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="container px-4 mb-8">
                <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
        )
    }

    return (
        <section className="container px-4 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Ticker Strip */}
                <Card className="lg:col-span-3 border-0 bg-white/40 backdrop-blur-md shadow-sm overflow-hidden flex items-center">
                    <CardContent className="p-0 w-full overflow-x-auto no-scrollbar">
                        <div className="flex items-center divide-x divide-slate-200/50 min-w-max">
                            {prices.map((coin) => (
                                <div key={coin.id} className="flex items-center gap-3 px-6 py-4 min-w-[200px] hover:bg-[#0E0E0F]">
                                    <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <div className="font-bold text-slate-900 uppercase flex items-center gap-2">
                                            {coin.symbol}
                                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-1.5 rounded">USD</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-0.5">
                                            <span className="font-mono font-medium">${coin.current_price.toLocaleString()}</span>
                                            <span className={`flex items-center text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fear & Greed Index */}
                {fearGreed && (
                    <Card className="border-0 bg-slate-900 text-white shadow-lg relative overflow-hidden group">
                        {/* Dynamic Background Gradient based on value */}
                        <div
                            className={`absolute inset-0 opacity-20 transition-colors duration-500 ${Number(fearGreed.value) > 50 ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-orange-700'
                                }`}
                        />

                        <CardContent className="p-4 relative z-10 flex items-center justify-between h-full">
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Gauge className="w-3 h-3" /> 市場情緒
                                </div>
                                <div className="text-2xl font-black tracking-tight">
                                    {fearGreed.value} <span className="text-sm font-medium text-slate-300">/ 100</span>
                                </div>
                                <div className={`text-sm font-bold mt-1 ${Number(fearGreed.value) > 75 ? 'text-green-400' :
                                    Number(fearGreed.value) > 50 ? 'text-green-300' :
                                        Number(fearGreed.value) < 25 ? 'text-red-400' : 'text-orange-400'
                                    }`}>
                                    {Number(fearGreed.value) > 75 ? '極度貪婪 🤑' :
                                        Number(fearGreed.value) > 50 ? '貪婪 🐂' :
                                            Number(fearGreed.value) < 25 ? '極度恐慌 😱' : '恐慌 🐻'}
                                </div>
                            </div>

                            {/* Visual Indicator Circle */}
                            <div className="relative w-14 h-14 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                                    <circle
                                        cx="28" cy="28" r="24"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={150}
                                        strokeDashoffset={150 - (150 * Number(fearGreed.value)) / 100}
                                        className={`transition-all duration-1000 ${Number(fearGreed.value) > 50 ? 'text-green-500' : 'text-orange-500'
                                            }`}
                                    />
                                </svg>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    )
}
