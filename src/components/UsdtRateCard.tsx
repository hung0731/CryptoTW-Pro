'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface RateData {
    maxBuy: number
    maxSell: number
    bitoBuy: number
    bitoSell: number
}

export function UsdtRateCard() {
    const [data, setData] = useState<RateData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const [maxRes, bitoRes] = await Promise.all([
                    fetch('https://max-api.maicoin.com/api/v2/tickers/usdttwd'),
                    fetch('https://api.bitopro.com/v3/order-book/usdt_twd?limit=1')
                ])

                const maxData = await maxRes.json()
                const bitoData = await bitoRes.json()

                setData({
                    maxBuy: parseFloat(maxData.ticker?.sell || '0'),  // User buys (Ask)
                    maxSell: parseFloat(maxData.ticker?.buy || '0'),  // User sells (Bid)
                    bitoBuy: parseFloat(bitoData.asks?.[0]?.price || '0'),
                    bitoSell: parseFloat(bitoData.bids?.[0]?.price || '0')
                })
            } catch (e) {
                console.error('Rate fetch error:', e)
            } finally {
                setLoading(false)
            }
        }

        fetchRates()
        const interval = setInterval(fetchRates, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return <Skeleton className="h-12 w-full rounded-xl bg-neutral-900/50" />
    }

    if (!data) return null

    // Logic: Best Buy (Lowest Ask), Best Sell (Highest Bid)
    const bestBuy = data.maxBuy < data.bitoBuy ? { provider: 'MAX', price: data.maxBuy } : { provider: 'Bito', price: data.bitoBuy }
    const bestSell = data.maxSell > data.bitoSell ? { provider: 'MAX', price: data.maxSell } : { provider: 'Bito', price: data.bitoSell }

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3 flex items-center justify-between">
            {/* Left: Buy Low */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400">買入較低</span>
                <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">{bestBuy.provider}</span>
                <span className="text-sm font-mono font-bold text-red-400">{bestBuy.price.toFixed(2)}</span>
            </div>

            {/* Divider */}
            <div className="h-4 w-[1px] bg-white/10 mx-2" />

            {/* Right: Sell High */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400">賣出較高</span>
                <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">{bestSell.provider}</span>
                <span className="text-sm font-mono font-bold text-green-400">{bestSell.price.toFixed(2)}</span>
            </div>
        </div>
    )
}
