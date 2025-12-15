'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, ReferenceArea
} from 'recharts'
import { AlertCircle, Zap, Info } from 'lucide-react'
import { REVIEWS_DATA } from '@/lib/reviews-data'
import REVIEWS_HISTORY from '@/data/reviews-history.json'

// 1. Define Visual Domains (Clamps)
const PCT_DOMAIN = [-80, 80]
const DD_DOMAIN = [-100, 0]

interface StackedReviewChartProps {
    leftSlug: string
    rightSlug: string
    focusWindow?: [number, number]
}

export function StackedReviewChart({ leftSlug, rightSlug, focusWindow }: StackedReviewChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewType, setViewType] = useState<'pct' | 'dd'>('pct')

    // Helper: Soft Clamp
    const clamp = (val: number | null, min: number, max: number) => {
        if (val === null) return null
        return Math.max(min, Math.min(max, val))
    }

    useEffect(() => {
        const loadData = () => {
            // @ts-ignore
            const leftHistory = REVIEWS_HISTORY[leftSlug]
            // @ts-ignore
            const rightHistory = REVIEWS_HISTORY[rightSlug]

            const leftInfo = REVIEWS_DATA.find(r => r.slug === leftSlug)
            const rightInfo = REVIEWS_DATA.find(r => r.slug === rightSlug)

            if (!leftHistory || !rightHistory || !leftInfo || !rightInfo) {
                setLoading(false)
                return
            }

            // Helper to process a single event history into relative items
            const processHistory = (history: any, eventStart: string, keyPrefix: string) => {
                const priceData = history.price || []
                const start = new Date(eventStart).getTime()
                const oneDay = 1000 * 60 * 60 * 24

                return priceData.map((item: any) => {
                    const current = new Date(item.date).getTime()
                    const diffDays = Math.floor((current - start) / oneDay)
                    return {
                        t: diffDays,
                        [`${keyPrefix}Price`]: item.price,
                        [`${keyPrefix}Date`]: item.date
                    }
                })
            }

            // Normalize data to T-days using REACTION start (D0 = market reaction point)
            const leftSeries = processHistory(leftHistory, leftInfo.reactionStartAt, 'left')
            const rightSeries = processHistory(rightHistory, rightInfo.reactionStartAt, 'right')

            // Merge logic
            const mergedMap = new Map<number, any>()

            // Populate Map
            leftSeries.forEach((item: any) => {
                const existing = mergedMap.get(item.t) || { t: item.t }
                mergedMap.set(item.t, { ...existing, ...item })
            })
            rightSeries.forEach((item: any) => {
                const existing = mergedMap.get(item.t) || { t: item.t }
                mergedMap.set(item.t, { ...existing, ...item })
            })

            const sortedData = Array.from(mergedMap.values())
                .filter(d => {
                    // Default range -45 to +60
                    return d.t >= -45 && d.t <= 60
                })
                .sort((a, b) => a.t - b.t)

            // Normalize Price to % change from T=0
            const leftT0 = leftSeries.find((d: any) => d.t === 0)?.leftPrice || leftSeries.find((d: any) => d.t === 1)?.leftPrice || leftSeries[0].leftPrice
            const rightT0 = rightSeries.find((d: any) => d.t === 0)?.rightPrice || rightSeries.find((d: any) => d.t === 1)?.rightPrice || rightSeries[0].rightPrice

            // Calculate Peaks for Drawdown (Peak-to-Date)
            let leftMax = -Infinity
            let rightMax = -Infinity

            const finalData = sortedData.map(d => {
                if (d.leftPrice) leftMax = Math.max(leftMax, d.leftPrice)
                if (d.rightPrice) rightMax = Math.max(rightMax, d.rightPrice)

                // 2. Compute Original Values
                const leftPct = d.leftPrice ? ((d.leftPrice - leftT0) / leftT0) * 100 : null
                const rightPct = d.rightPrice ? ((d.rightPrice - rightT0) / rightT0) * 100 : null
                const leftDD = d.leftPrice ? ((d.leftPrice - leftMax) / leftMax) * 100 : null
                const rightDD = d.rightPrice ? ((d.rightPrice - rightMax) / rightMax) * 100 : null

                // 3. Compute Display Values (Clamped)
                // We compute clamps for BOTH modes here to keep logic separate or compute on fly?
                // Better compute here.
                const leftPctDisplay = clamp(leftPct, PCT_DOMAIN[0], PCT_DOMAIN[1])
                const rightPctDisplay = clamp(rightPct, PCT_DOMAIN[0], PCT_DOMAIN[1])
                const leftDDDisplay = clamp(leftDD, DD_DOMAIN[0], DD_DOMAIN[1])
                const rightDDDisplay = clamp(rightDD, DD_DOMAIN[0], DD_DOMAIN[1])

                return {
                    ...d,
                    leftPct, rightPct,
                    leftDD, rightDD,
                    // Clamped values for rendering
                    leftPctDisplay, rightPctDisplay,
                    leftDDDisplay, rightDDDisplay
                }
            })

            setData(finalData)
            setLoading(false)
        }

        loadData()
    }, [leftSlug, rightSlug])

    const getLeftColor = () => '#3b82f6' // Blue
    const getRightColor = () => '#fbbf24' // Amber

    if (loading) return <Skeleton className="w-full h-full bg-neutral-900 rounded-lg" />

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-950/90 border border-white/10 p-4 rounded-lg shadow-2xl text-xs backdrop-blur-md min-w-[240px]">
                    <p className="text-neutral-400 mb-2 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="text-white font-bold">D{label >= 0 ? `+${label}` : label}</span>
                        <span>(事件日)</span>
                    </p>
                    {payload.map((p: any, i: number) => {
                        // Determine which real value to pick based on viewType
                        const realKey = viewType === 'pct'
                            ? (p.dataKey === 'leftPctDisplay' ? 'leftPct' : 'rightPct')
                            : (p.dataKey === 'leftDDDisplay' ? 'leftDD' : 'rightDD')

                        // We access the real value from payload[0].payload (the full data object)
                        const realVal = p.payload[realKey]
                        const isClamped = realVal !== p.value // p.value is the clamped display value

                        // Context logic
                        let context = ''
                        if (realVal < -20) context = '恐慌加劇'
                        else if (realVal < -10) context = '信心脆弱'
                        else if (realVal > 10) context = '反彈強勁'
                        else context = '盤整中'

                        return (
                            <div key={i} className="mb-3 last:mb-0">
                                <div className="flex items-center justify-between gap-4 mb-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                        <span className="text-neutral-300 font-medium">
                                            {p.name.includes('基準') ? '基準' : '對照'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-mono font-bold text-sm ${realVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {realVal > 0 ? '+' : ''}{Number(realVal).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Warning if Clamped */}
                                {isClamped && (
                                    <div className="flex items-center justify-end gap-1 mb-1 text-amber-500">
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="text-[10px]">極端值已截斷 ({p.value > 0 ? '+' : ''}{p.value}%)</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        }
        return null
    }

    return (
        <div className="w-full h-full relative group">
            {/* View Type Toggle */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 flex bg-neutral-900/80 backdrop-blur rounded-lg p-0.5 border border-white/10 shadow-lg">
                <button
                    onClick={() => setViewType('pct')}
                    className={`px-3 py-1 rounded text-[10px] transition-all font-medium ${viewType === 'pct' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    漲跌幅 %
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-0.5" />
                <button
                    onClick={() => setViewType('dd')}
                    className={`px-3 py-1 rounded text-[10px] transition-all font-medium ${viewType === 'dd' ? 'bg-red-500/10 text-red-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    最大回撤 (DD)
                </button>
            </div>

            {/* Watermark (Center Logo) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-10">
                <img src="/logo.svg" alt="Watermark" className="w-48 h-48" />
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, bottom: 35, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

                    <ReferenceLine
                        x={0}
                        stroke="#ef4444"
                        strokeOpacity={0.6}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        label={{
                            value: '⚡ 事件爆發',
                            position: 'insideTop',
                            fill: '#ef4444',
                            fontSize: 10,
                            fontWeight: 'bold',
                            dy: -15
                        }}
                    />

                    <XAxis
                        dataKey="t"
                        tick={{ fontSize: 10, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                        tickFormatter={(t) => t === 0 ? 'D0' : `D${t}`}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                        // 5. Apply Visual Domain
                        domain={viewType === 'pct' ? PCT_DOMAIN : DD_DOMAIN}
                        allowDataOverflow={true} // Important: Force clip at domain
                    />

                    {/* Danger Zones for DD View */}
                    {viewType === 'dd' && (
                        <>
                            {/* Death Zone (-80% to -100%) */}
                            <ReferenceArea
                                y1={-80}
                                y2={-100}
                                fill="#ef4444"
                                fillOpacity={0.1}
                                stroke="none"
                            />
                            {/* Warning Zone (-50% to -80%) */}
                            <ReferenceArea
                                y1={-50}
                                y2={-80}
                                fill="#f97316"
                                fillOpacity={0.05}
                                stroke="none"
                            />
                        </>
                    )}

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />

                    <Line
                        type="monotone"
                        // 7. Use Display Values
                        dataKey={viewType === 'pct' ? 'leftPctDisplay' : 'leftDDDisplay'}
                        name="基準 (左)"
                        stroke={getLeftColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        animationDuration={500}
                    />
                    <Line
                        type="monotone"
                        dataKey={viewType === 'pct' ? 'rightPctDisplay' : 'rightDDDisplay'}
                        name="對照 (右)"
                        stroke={getRightColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        animationDuration={500}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* 8. Disclaimer (Bottom Left inside chart area) */}
            <div className="absolute bottom-1 left-2 z-10 hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Info className="w-3 h-3 text-neutral-600" />
                <span className="text-[9px] text-neutral-600 font-mono">
                    🔁 此圖表以「市場反應起點（D0）」對齊 🧠 非新聞時間，避免錯誤比較
                </span>
            </div>
        </div>
    )
}
