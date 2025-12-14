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
        return <Skeleton className="h-16 w-full rounded-xl bg-neutral-900/50" />
    }

    if (!data) return null

    return (
        <div className="bg-neutral-900/50 rounded-xl border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">USDT/TWD 匯率</span>
                <span className="text-[10px] text-neutral-500">即時掛單</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {/* MAX */}
                <div className="space-y-1">
                    <span className="text-[10px] text-neutral-500">MAX</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">買 {data.maxBuy.toFixed(2)}</span>
                        <span className="text-xs text-green-400">賣 {data.maxSell.toFixed(2)}</span>
                    </div>
                </div>
                {/* BitoPro */}
                <div className="space-y-1">
                    <span className="text-[10px] text-neutral-500">BitoPro</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">買 {data.bitoBuy.toFixed(2)}</span>
                        <span className="text-xs text-green-400">賣 {data.bitoSell.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
