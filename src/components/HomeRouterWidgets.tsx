
'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Activity, Anchor, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface RouterData {
    mainline: {
        headline: string
        dimensions: {
            name: string
            status: string
            text: string
        }[]
    }
    anomalies: {
        type: string
        message: string
        link: string
    }[]
    crossRefs: {
        source: string
        text: string
        link: string
    }[]
}

export function HomeRouterWidget() {
    const [data, setData] = useState<RouterData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/market/home-router')
                const json = await res.json()
                if (json.router) {
                    setData(json.router)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <Skeleton className="h-48 w-full bg-neutral-900/50 rounded-xl" />
    if (!data) return null

    return (
        <div className="space-y-4">
            {/* 1. Market Mainline Card */}
            <div className="bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Market Mainline</h2>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight">
                        {data.mainline.headline}
                    </h1>

                    <div className="grid grid-cols-3 gap-2">
                        {data.mainline.dimensions.map((dim, i) => (
                            <Link
                                key={i}
                                href={dim.name === '合約面' ? '/derivatives' : dim.name === '巨鯨面' ? '/smart-money' : '/prediction'}
                                className="group bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 hover:border-white/10 transition-all text-center"
                            >
                                <div className="text-[10px] text-neutral-500 mb-1 group-hover:text-neutral-400">{dim.name}</div>
                                <div className={cn(
                                    "text-sm font-bold mb-0.5",
                                    dim.status === '過熱' || dim.status === '偏多' ? 'text-red-400' :
                                        dim.status === '偏空' ? 'text-green-400' : 'text-neutral-200'
                                )}>{dim.status}</div>
                                <div className="text-[9px] text-neutral-600 truncate">{dim.text}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Anomaly Card */}
            {data.anomalies.length > 0 && (
                <div className="bg-orange-950/20 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <h3 className="text-sm font-bold text-orange-200">今日異常偵測</h3>
                    </div>
                    <div className="space-y-2">
                        {data.anomalies.map((anomaly, i) => (
                            <Link
                                key={i}
                                href={anomaly.link}
                                className="flex items-center justify-between bg-orange-500/5 border border-orange-500/10 rounded-lg p-2.5 hover:bg-orange-500/10 transition-all group"
                            >
                                <span className="text-xs text-neutral-300 font-medium">{anomaly.message}</span>
                                <div className="flex items-center gap-1 text-[10px] text-orange-400/70 group-hover:text-orange-400">
                                    查看原因 <ArrowRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Cross Module References */}
            {data.crossRefs.map((ref, i) => (
                <Link
                    key={i}
                    href={ref.link}
                    className="block bg-neutral-900/50 border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-2">
                        {ref.source === 'Smart Money' ? <Anchor className="w-3 h-3 text-blue-400" /> :
                            ref.source === 'Derivatives' ? <Activity className="w-3 h-3 text-purple-400" /> :
                                <BarChart2 className="w-3 h-3 text-neutral-400" />}
                        <span className={cn(
                            "text-xs font-bold",
                            ref.source === 'Smart Money' ? "text-blue-400" :
                                ref.source === 'Derivatives' ? "text-purple-400" : "text-neutral-400"
                        )}>
                            來自【{ref.source === 'Smart Money' ? '巨鯨動態' : ref.source === 'Derivatives' ? '合約數據' : ref.source}】的訊號
                        </span>
                    </div>
                    <p className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {ref.text}
                    </p>
                    <div className="mt-2 text-[10px] text-neutral-600 flex items-center justify-end group-hover:translate-x-1 transition-transform">
                        查看完整數據 <ArrowRight className="ml-1 w-3 h-3" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
