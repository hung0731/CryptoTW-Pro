
'use client'

import React, { useEffect, useState } from 'react'
import { getHomeRouterAction } from '@/app/actions/home-router'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Activity, Anchor, BarChart2, Info, ChevronRight, Zap, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AIAnalysisCard } from '@/components/home/AIAnalysisCard'
import { MarketContextCard } from '@/components/home/MarketContextCard'
import { CARDS, SPACING, TYPOGRAPHY, COLORS } from '@/lib/design-tokens'

// AI Decision type (from backend)
import { HomeRouterData } from '@/lib/services/home-router'

// Removed local AIDecisionData and RouterData definitions in favor of shared type from service


export function HomeRouterWidget() {
    const [data, setData] = useState<HomeRouterData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getHomeRouterAction()
                if (res.success && res.data) {
                    setData(res.data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [])

    if (loading) return <Skeleton className="h-64 w-full bg-neutral-900/50 rounded-xl" />
    if (!data) return null

    return (
        <div className="space-y-5">

            {/* 0. AI Decision Card (First Screen - Conclusion First) */}
            <AIAnalysisCard data={data.aiDecision || null} isLoading={loading} />

            {/* 1. Market Context (News Highlights) - Collapsed by default */}
            <MarketContextCard data={data.marketContext || null} isLoading={loading} />

            {/* 1. Market Mainline (Control Center) */}
            <div className={cn(CARDS.primary, SPACING.card)}>
                {/* Header Status */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
                    <span className={TYPOGRAPHY.sectionLabel}>籌碼快照</span>
                </div>

                {/* Headline */}
                <h1 className={cn(TYPOGRAPHY.sectionTitle, "mb-3 leading-snug")}>
                    {data.mainline.headline}
                </h1>

                {/* Action Hint */}
                <div className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-4 border text-xs font-bold",
                    data.mainline.actionColor === 'red' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                        data.mainline.actionColor === 'green' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                            "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                )}>
                    {data.mainline.actionHint}
                </div>

                {/* Navigation Indexes (Clickable) */}
                <div className="grid grid-cols-3 gap-2">
                    {data.mainline.dimensions.map((dim, i) => (
                        <Link
                            key={i}
                            href={dim.name === '合約' ? '/prediction?tab=derivatives' : dim.name === '大戶' ? '/prediction?tab=smartmoney' : '/prediction'}
                            className="group bg-neutral-900 border border-white/5 rounded-lg p-2 hover:bg-white/5 hover:border-white/10 text-center flex flex-col items-center justify-center h-16"
                        >
                            <span className="text-[10px] text-neutral-500 mb-0.5">{dim.name}面</span>
                            <span className={cn(
                                "text-sm font-bold",
                                dim.color === 'red' ? "text-red-400" :
                                    dim.color === 'green' ? "text-green-400" :
                                        dim.color === 'yellow' ? "text-yellow-400" : "text-neutral-200"
                            )}>
                                {dim.status}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 2. Anomaly Alert (Single Critical) - Standard Background */}
            {data.anomaly && (
                <div>
                    <div className="bg-[#0E0E0F] border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
                        {/* Removed red background, kept red border for alert meaning, but base is neutral */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">異常警報｜{data.anomaly.title}</h3>
                        </div>

                        <p className="text-sm text-white font-medium mb-3">
                            {data.anomaly.message}
                        </p>

                        {/* Context & Risk - Subtle bg */}
                        <div className="bg-neutral-900 rounded-lg p-2.5 mb-3 space-y-1 border border-white/5">
                            <div className="flex items-start gap-2 text-[11px]">
                                <span className="text-neutral-500 shrink-0">原因：</span>
                                <span className="text-neutral-300">{data.anomaly.reason}</span>
                            </div>
                            <div className="flex items-start gap-2 text-[11px]">
                                <span className="text-red-400/80 shrink-0">風險：</span>
                                <span className="text-red-300">{data.anomaly.risk}</span>
                            </div>
                        </div>

                        <Link
                            href={data.anomaly.link}
                            className="flex items-center justify-center w-full py-2 border rounded-lg text-xs font-bold bg-[#0E0E0F] border-[#1A1A1A] hover:bg-neutral-700 text-neutral-300"
                        >
                            <>查看圖表確認 <ArrowRight className="w-3 h-3 ml-1" /></>
                        </Link>
                    </div>
                </div>
            )}

            {/* 3. Cross Module References - Standard Background */}
            <div className="space-y-3">
                {data.crossRefs.map((ref, i) => (
                    <Link
                        key={i}
                        href={ref.link}
                        className="block bg-neutral-900/50 border border-white/5 rounded-xl p-3 pl-4 hover:border-white/20 group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                        ref.source === '巨鯨動態' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                            "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                    )}>
                                        來自{ref.source}
                                    </span>
                                </div>
                                <span className="text-sm text-[#A0A0A0] group-hover:text-white mt-0.5">
                                    {ref.implication}
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:translate-x-1 group-hover:text-neutral-400" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* 4. Focus Today - Standard Background */}
            {data.focusToday && data.focusToday.length > 0 && (
                <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-neutral-500 mb-3 flex items-center gap-1.5">
                        <Zap className="w-3 h-3" /> 今日留意
                    </h3>
                    <div className="space-y-0 divide-y divide-white/5">
                        {data.focusToday.map((item, i) => (
                            <Link
                                key={i}
                                href={item.link}
                                className="flex items-center justify-between py-2.5 hover:bg-white/5 px-2 -mx-2 rounded group"
                            >
                                <span className="text-sm text-neutral-300">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-neutral-400">{item.status}</span>
                                    <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400 -ml-1 opacity-0 group-hover:opacity-100" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
