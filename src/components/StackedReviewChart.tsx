'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, ReferenceArea
} from 'recharts'
import { AlertTriangle, AlertCircle, Zap, TrendingDown, TrendingUp, Info } from 'lucide-react'
import { REVIEWS_DATA } from '@/lib/reviews-data'
import REVIEWS_HISTORY from '@/data/reviews-history.json'
import { CHART } from '@/lib/design-tokens'
import { formatPercent } from '@/lib/format-helpers'

// 1. Define Visual Domains (Clamps)
// 1. Define Visual Domains (Clamps)
// PCT_DOMAIN is now dynamic
const DD_DOMAIN = [-100, 0]

interface StackedReviewChartProps {
    leftSlug: string
    rightSlug: string
    focusWindow?: [number, number]
}



const StackedReviewTooltip = ({ active, payload, label, viewType }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={`${CHART.tooltip.container} min-w-[240px] backdrop-blur-md`}>
                <p className="text-[#808080] mb-2 font-mono flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
                    <span className="text-white font-bold">D{label >= 0 ? `+${label}` : label}</span>
                    <span>(事件日)</span>
                </p>
                {payload.map((p: any, i: number) => {
                    // Determine which real value to pick based on viewType
                    let realKey: string
                    if (viewType === 'pct') {
                        realKey = p.dataKey === 'leftPctDisplay' ? 'leftPct' : 'rightPct'
                    } else if (viewType === 'impact') {
                        realKey = p.dataKey === 'leftImpactDisplay' ? 'leftPct' : 'rightPct' // Impact view shows PCT value but normalized graph
                    } else { // dd
                        realKey = p.dataKey === 'leftDDDisplay' ? 'leftDD' : 'rightDD'
                    }

                    // We access the real value from payload[0].payload (the full data object)
                    const realVal = p.payload[realKey]
                    const isClamped = realVal !== p.value && viewType !== 'impact' // p.value is the clamped display value, impact is normalized

                    // Context logic
                    let context = ''
                    if (realVal !== null) {
                        if (realVal < -20) context = '恐慌加劇'
                        else if (realVal < -10) context = '信心脆弱'
                        else if (realVal > 10) context = '反彈強勁'
                        else context = '盤整中'
                    }


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
                                    <span className={`font-mono font-bold text-sm ${realVal !== null && realVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {realVal !== null ? formatPercent(Number(realVal)) : '—'}
                                    </span>
                                </div>
                            </div>

                            {/* Warning if Clamped */}
                            {isClamped && (
                                <div className="flex items-center justify-end gap-1 mb-1 text-amber-500">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-[10px]">極端值已截斷 ({formatPercent(p.value)})</span>
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

export function StackedReviewChart({ leftSlug, rightSlug, focusWindow }: StackedReviewChartProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewType, setViewType] = useState<'pct' | 'dd' | 'impact'>('pct')
    const [pctDomain, setPctDomain] = useState([-20, 20])
    const [isAsymmetric, setIsAsymmetric] = useState(false)
    const [deathPoints, setDeathPoints] = useState<{ left: any, right: any }>({ left: null, right: null })

    // Helper: Soft Clamp
    const clamp = (val: number | null, min: number, max: number) => {
        if (val === null) return null
        return Math.max(min, Math.min(max, val))
    }

    useEffect(() => {
        const loadData = () => {
            // Fix: Compare state passes composite "slug-year" string, so we must match composite.
            const leftInfo = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === leftSlug)
            const rightInfo = REVIEWS_DATA.find(r => `${r.slug}-${r.year}` === rightSlug)

            if (!leftInfo || !rightInfo) {
                setLoading(false)
                return
            }

            const isCollapse = (e: any) => e.reactionType === 'trust_collapse' || e.reactionType === 'liquidity_crisis'
            const leftCollapse = isCollapse(leftInfo)
            const rightCollapse = isCollapse(rightInfo)

            // 0. Outcome Logic
            if (leftCollapse && rightCollapse) {
                setViewType('dd')
                setIsAsymmetric(false)
            } else if (leftCollapse !== rightCollapse) {
                setViewType('impact')
                setIsAsymmetric(true)
            } else {
                setViewType('pct')
                setIsAsymmetric(false)
            }

            // @ts-ignore
            const leftHistory = REVIEWS_HISTORY[`${leftInfo.slug}-${leftInfo.year}`]
            // @ts-ignore
            const rightHistory = REVIEWS_HISTORY[`${rightInfo.slug}-${rightInfo.year}`]

            if (!leftHistory || !rightHistory) {
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

            // Domain Tracking
            let minVal = 0
            let maxVal = 0

            // Death Tracking
            let leftDead = false
            let rightDead = false
            let leftDeathPoint: any = null
            let rightDeathPoint: any = null

            // 1. First Pass: Compute Raw Values & Determine Scale & Death
            const rawData = sortedData.map(d => {
                if (d.leftPrice) leftMax = Math.max(leftMax, d.leftPrice)
                if (d.rightPrice) rightMax = Math.max(rightMax, d.rightPrice)

                const leftPct = d.leftPrice ? ((d.leftPrice - leftT0) / leftT0) * 100 : null
                const rightPct = d.rightPrice ? ((d.rightPrice - rightT0) / rightT0) * 100 : null
                const leftDD = d.leftPrice ? ((d.leftPrice - leftMax) / leftMax) * 100 : null
                const rightDD = d.rightPrice ? ((d.rightPrice - rightMax) / rightMax) * 100 : null

                // Death Logic (Cutoff at -90%)
                let finalLeftPct = leftPct
                let finalRightPct = rightPct

                if (leftDead) finalLeftPct = null
                else if (leftPct !== null && leftPct <= -90) {
                    leftDead = true
                    leftDeathPoint = { t: d.t, val: leftPct }
                }

                if (rightDead) finalRightPct = null
                else if (rightPct !== null && rightPct <= -90) {
                    rightDead = true
                    rightDeathPoint = { t: d.t, val: rightPct }
                }

                // Track Min/Max for Adaptive Scale (Only valid points)
                if (finalLeftPct !== null) {
                    minVal = Math.min(minVal, finalLeftPct)
                    maxVal = Math.max(maxVal, finalLeftPct)
                }
                if (finalRightPct !== null) {
                    minVal = Math.min(minVal, finalRightPct)
                    maxVal = Math.max(maxVal, finalRightPct)
                }

                return {
                    ...d,
                    leftPct: finalLeftPct,
                    rightPct: finalRightPct,
                    leftDD,
                    rightDD,
                    // Store 'dead' status for this point if we want specialized rendering? 
                    // No, null value handles the line cut.
                }
            })

            setDeathPoints({ left: leftDeathPoint, right: rightDeathPoint })

            // 2. Determine Scale & Process Data (Normal or Asymmetric)
            let finalData

            // Asymmetric Impact Normalization
            // Find max impact (absolute) for each valid series
            const leftMaxImpact = Math.max(...rawData.filter(d => d.leftPct !== null).map(d => Math.abs(d.leftPct!))) || 1
            const rightMaxImpact = Math.max(...rawData.filter(d => d.rightPct !== null).map(d => Math.abs(d.rightPct!))) || 1

            // Standard Logic Bounds
            let lowerBound = Math.max(-100, minVal * 1.2)
            let upperBound = Math.max(20, maxVal * 1.2)
            lowerBound = Math.floor(lowerBound / 5) * 5
            upperBound = Math.ceil(upperBound / 5) * 5
            setPctDomain([lowerBound, upperBound])

            finalData = rawData.map(d => ({
                ...d,
                // Absolute Percentage (Clamped)
                leftPctDisplay: d.leftPct !== null ? clamp(d.leftPct, lowerBound, upperBound) : null,
                rightPctDisplay: d.rightPct !== null ? clamp(d.rightPct, lowerBound, upperBound) : null,

                // Normalized Impact (Raw 0-1ish)
                leftImpactDisplay: d.leftPct !== null ? (d.leftPct / leftMaxImpact) : null,
                rightImpactDisplay: d.rightPct !== null ? (d.rightPct / rightMaxImpact) : null,

                // Drawdown (Clamped)
                leftDDDisplay: clamp(d.leftDD, DD_DOMAIN[0], DD_DOMAIN[1]),
                rightDDDisplay: clamp(d.rightDD, DD_DOMAIN[0], DD_DOMAIN[1])
            }))

            setData(finalData)
            setLoading(false)
        }

        loadData()
    }, [leftSlug, rightSlug])

    const getLeftColor = () => '#3b82f6' // Blue
    const getRightColor = () => '#fbbf24' // Amber

    if (loading) return <Skeleton className="w-full h-full bg-[#0A0A0A] rounded-lg" />



    return (
        <div className="w-full h-full relative group">
            {/* View Type Toggle */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 flex bg-neutral-900/80 backdrop-blur rounded-lg p-0.5 border border-white/10 shadow-lg">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewType('pct')}
                        className={`text-[10px] px-2 py-1 rounded ${viewType === 'pct' ? 'bg-[#1A1A1A] text-white' : 'text-[#666666] hover:text-white'}`}
                    >
                        漲跌幅 (%)
                    </button>
                    {isAsymmetric && (
                        <button
                            onClick={() => setViewType('impact')}
                            className={`text-[10px] px-2 py-1 rounded ${viewType === 'impact' ? 'bg-[#1A1A1A] text-white' : 'text-[#666666] hover:text-white'}`}
                        >
                            相對影響力
                        </button>
                    )}
                    <button
                        onClick={() => setViewType('dd')}
                        className={`text-[10px] px-2 py-1 rounded ${viewType === 'dd' ? 'bg-[#1A1A1A] text-white' : 'text-[#666666] hover:text-white'}`}
                    >
                        最大回撤 (DD)
                    </button>
                </div>
            </div>

            {/* Watermark (Center Logo) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-10">
                <img src="/logo.svg" alt="Watermark" className="w-48 h-48" />
            </div>

            {/* Asymmetric Warning */}
            {isAsymmetric && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-yellow-900/40 border border-yellow-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[10px] text-yellow-200 font-medium tracking-wide">
                        比較包含「系統性崩潰」，已依相對影響力標準化
                    </span>
                </div>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, bottom: 35, left: 10 }}>
                    <defs>
                        <linearGradient id="splitGradientLeft" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getLeftColor()} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={getLeftColor()} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="splitGradientRight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getRightColor()} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={getRightColor()} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray={CHART.grid.strokeDasharray} stroke={CHART.grid.stroke} vertical={false} />

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
                        type="number"
                        domain={[-30, 30]} // Full D-30 to D+30
                        ticks={[-30, -15, 0, 15, 30]}
                        tickFormatter={(val) => val === 0 ? 'D0' : `D${val > 0 ? '+' : ''}${val}`}
                        tick={{ fontSize: 10, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#525252' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) =>
                            viewType === 'impact'
                                ? `${(val * 100).toFixed(0)}%`
                                : `${Number(val).toFixed(0)}%`
                        }
                        // 5. Apply Visual Domain
                        domain={viewType === 'impact' ? [-1.1, 1.1] : (viewType === 'pct' ? pctDomain : DD_DOMAIN)}
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

                    {viewType === 'pct' && deathPoints.left && (
                        <ReferenceLine x={deathPoints.left.t} stroke={getLeftColor()} strokeDasharray="3 3" />
                        // We will use ReferenceDot via standard Scatter or just ReferenceDot if available
                    )}
                    {viewType === 'pct' && deathPoints.left && (
                        <ReferenceLine
                            segment={[{ x: deathPoints.left.t, y: deathPoints.left.val }, { x: deathPoints.left.t, y: deathPoints.left.val }]} // Mock point
                        // Recharts ReferenceDot is better
                        />
                    )}

                    {/* Death Skull Markers */}
                    {viewType === 'pct' && deathPoints.left && (
                        <ReferenceArea
                            x1={deathPoints.left.t}
                            x2={deathPoints.left.t}
                            y1={deathPoints.left.val}
                            y2={deathPoints.left.val}
                            stroke="none"
                            fill="none"
                            label={{
                                value: '⚡ 死亡', // Using ⚡ or ☠️
                                position: 'top',
                                fill: '#ef4444',
                                fontSize: 12,
                                fontWeight: 'bold'
                            }}
                        />
                    )}
                    {viewType === 'pct' && deathPoints.right && (
                        <ReferenceArea
                            x1={deathPoints.right.t}
                            x2={deathPoints.right.t}
                            y1={deathPoints.right.val}
                            y2={deathPoints.right.val}
                            stroke="none"
                            fill="none"
                            label={{
                                value: '⚡ 死亡',
                                position: 'top',
                                fill: '#ef4444',
                                fontSize: 12,
                                fontWeight: 'bold'
                            }}
                        />
                    )}

                    <Tooltip content={(props: any) => <StackedReviewTooltip {...props} viewType={viewType} />} cursor={{ stroke: '#ffffff20' }} />

                    <Line
                        type="monotone"
                        // 7. Use Display Values: Impact uses 'leftImpactDisplay'
                        dataKey={viewType === 'impact' ? 'leftImpactDisplay' : (viewType === 'pct' ? 'leftPctDisplay' : 'leftDDDisplay')}
                        name="基準 (左)"
                        stroke={getLeftColor()}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        animationDuration={500}
                    />
                    <Line
                        type="monotone"
                        dataKey={viewType === 'impact' ? 'rightImpactDisplay' : (viewType === 'pct' ? 'rightPctDisplay' : 'rightDDDisplay')}
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
            <div className="absolute bottom-1 left-2 z-10 hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
                <Info className="w-3 h-3 text-neutral-600" />
                <span className="text-[9px] text-neutral-600 font-mono">
                    🔁 此圖表以「市場反應起點（D0）」對齊 🧠 非新聞時間，避免錯誤比較
                </span>
            </div>
        </div>
    )
}
