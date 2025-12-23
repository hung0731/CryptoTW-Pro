'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts'
import { AlertTriangle, Info } from 'lucide-react'
import { CHART } from '@/lib/design-tokens'

// Extracted Components
import { StackedReviewTooltip } from '@/components/reviews/StackedReviewTooltip'
import { useStackedReviewData } from '@/hooks/useStackedReviewData'

interface StackedReviewChartProps {
    leftSlug: string
    rightSlug: string
    focusWindow?: [number, number]
}

export function StackedReviewChart({ leftSlug, rightSlug, focusWindow }: StackedReviewChartProps) {
    const {
        data,
        loading,
        viewType,
        setViewType,
        pctDomain,
        isAsymmetric,
        deathPoints,
        DD_DOMAIN
    } = useStackedReviewData({ leftSlug, rightSlug })

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
