'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, ExternalLink, Activity, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/design-tokens'

interface DivergenceItem {
    symbol: string
    price: number
    priceChange: number
    oiChange: number
    volume: number
    score: number
    signal: 'absorption' | 'distribution' | 'overheated'
}

export function DivergenceScreener() {
    const [data, setData] = useState<DivergenceItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/alpha/divergence')
                const json = await res.json()
                if (json.data) {
                    setData(json.data)
                }
            } catch (error) {
                console.error('Failed to fetch screener:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center bg-[#050505] rounded-2xl border border-white/[0.08]">
                <div className="flex flex-col items-center gap-2">
                    <span className="animate-spin text-neutral-500">
                        <Activity className="w-5 h-5" />
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">Scanning market divergence...</span>
                </div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center bg-[#050505] rounded-2xl border border-white/[0.08] text-neutral-500">
                <span className="text-sm">目前市場無顯著主力異常訊號 (Clean Market)</span>
            </div>
        )
    }

    return (
        <div className="w-full bg-[#050505] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", COLORS.textSecondary)}>主力意圖掃描器</span>
                    <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">ALPHA</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-2">
                    <span>Rank by SmartScore™</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/[0.04] text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                            <th className="px-4 py-3 font-medium">Token</th>
                            <th className="px-4 py-3 font-medium text-right">Price (24h%)</th>
                            <th className="px-4 py-3 font-medium text-right">OI (24h%)</th>
                            <th className="px-4 py-3 font-medium text-center">Signal / Intent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {data.map((item) => (
                            <tr key={item.symbol} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{item.symbol}</span>
                                        <ExternalLink className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white" />
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-neutral-300 font-mono">${item.price.toFixed(item.price < 1 ? 4 : 2)}</span>
                                        <span className={cn(
                                            "text-[10px] font-mono",
                                            item.priceChange >= 0 ? "text-green-400" : "text-red-400"
                                        )}>
                                            {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-col items-end">
                                        {/* OI Visual Bar */}
                                        <div className="w-16 h-1 bg-white/10 rounded-full mb-1 overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", item.oiChange > 0 ? "bg-cyan-400" : "bg-orange-400")}
                                                style={{ width: `${Math.min(Math.abs(item.oiChange) * 2, 100)}%` }} // Visual scaling
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-mono",
                                            item.oiChange >= 0 ? "text-cyan-400" : "text-orange-400"
                                        )}>
                                            {item.oiChange > 0 ? '+' : ''}{item.oiChange.toFixed(2)}%
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <SignalBadge signal={item.signal} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 border-t border-white/[0.04] bg-white/[0.01]">
                <div className="text-[10px] text-neutral-500 font-mono flex gap-4 justify-center">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        吸籌 (價跌量增)
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        出貨 (價漲量縮)
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                        過熱 (雙噴)
                    </div>
                </div>
            </div>
        </div>
    )
}

function SignalBadge({ signal }: { signal: DivergenceItem['signal'] }) {
    if (signal === 'absorption') {
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] text-green-400 font-bold">主力吸籌</span>
                    <ArrowUp className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-[9px] text-neutral-600 mt-0.5">Bullish</span>
            </div>
        )
    }
    if (signal === 'distribution') {
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                    <span className="text-[10px] text-red-400 font-bold">主力出貨</span>
                    <ArrowDown className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-[9px] text-neutral-600 mt-0.5">Bearish</span>
            </div>
        )
    }
    if (signal === 'overheated') {
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-[10px] text-yellow-500 font-bold">過度擁擠</span>
                    <Activity className="w-3 h-3 text-yellow-500" />
                </div>
                <span className="text-[9px] text-neutral-600 mt-0.5">High Risk</span>
            </div>
        )
    }
    return null
}
