'use client'

import React from 'react'
import { SkeletonReviewChart } from '@/components/SkeletonReviewChart'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, ComposedChart, ReferenceLine
} from 'recharts'
import { CARDS, SPACING, TYPOGRAPHY, CHART } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

// ===================================
// Mock Data for All Chart Types
// ===================================

const PRICE_DATA = [
    { day: -30, value: 21500 }, { day: -25, value: 21800 }, { day: -20, value: 20900 },
    { day: -15, value: 21200 }, { day: -10, value: 20500 }, { day: -5, value: 19800 },
    { day: 0, value: 16800 }, { day: 5, value: 15200 }, { day: 10, value: 16500 },
    { day: 15, value: 16900 }, { day: 20, value: 17200 }, { day: 25, value: 16800 },
    { day: 30, value: 17500 }
]

const OI_DATA = [
    { day: -30, value: 12.5 }, { day: -25, value: 13.2 }, { day: -20, value: 14.1 },
    { day: -15, value: 15.8 }, { day: -10, value: 14.2 }, { day: -5, value: 12.1 },
    { day: 0, value: 8.5 }, { day: 5, value: 7.2 }, { day: 10, value: 8.9 },
    { day: 15, value: 9.5 }, { day: 20, value: 10.2 }, { day: 25, value: 11.0 },
    { day: 30, value: 10.5 }
]

const FLOW_DATA = [
    { day: -30, value: 50 }, { day: -25, value: -80 }, { day: -20, value: 120 },
    { day: -15, value: -200 }, { day: -10, value: -350 }, { day: -5, value: -500 },
    { day: 0, value: -1200 }, { day: 5, value: -800 }, { day: 10, value: -300 },
    { day: 15, value: 100 }, { day: 20, value: 200 }, { day: 25, value: 50 },
    { day: 30, value: 150 }
]

const FGI_DATA = [
    { day: -30, value: 45 }, { day: -25, value: 42 }, { day: -20, value: 38 },
    { day: -15, value: 32 }, { day: -10, value: 28 }, { day: -5, value: 22 },
    { day: 0, value: 10 }, { day: 5, value: 8 }, { day: 10, value: 12 },
    { day: 15, value: 18 }, { day: 20, value: 25 }, { day: 25, value: 30 },
    { day: 30, value: 35 }
]

const COMPARE_DATA = [
    { day: -30, left: 0, right: 0 }, { day: -25, left: -2, right: -1 },
    { day: -20, left: -5, right: -3 }, { day: -15, left: -8, right: -6 },
    { day: -10, left: -12, right: -10 }, { day: -5, left: -18, right: -15 },
    { day: 0, value: 0, left: -28, right: -22 }, { day: 5, left: -35, right: -30 },
    { day: 10, left: -32, right: -28 }, { day: 15, left: -28, right: -25 },
    { day: 20, left: -25, right: -20 }, { day: 25, left: -22, right: -18 },
    { day: 30, left: -20, right: -15 }
]

const MACRO_DATA = [
    { t: -7, r: 0 }, { t: -6, r: -0.5 }, { t: -5, r: 0.2 }, { t: -4, r: -0.8 },
    { t: -3, r: 0.5 }, { t: -2, r: 1.2 }, { t: -1, r: 0.8 }, { t: 0, r: -2.5 },
    { t: 1, r: -1.8 }, { t: 2, r: -0.5 }, { t: 3, r: 0.3 }, { t: 4, r: 1.0 },
    { t: 5, r: 1.5 }, { t: 6, r: 2.0 }, { t: 7, r: 1.8 }
]

// ===================================
// Custom Tooltip (Unified Style)
// ===================================
function UnifiedTooltip({ active, payload, label, unit }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2 text-xs">
            <p className="text-[#808080] mb-1">D{label >= 0 ? '+' : ''}{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }} className="font-mono">
                    {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{unit || ''}
                </p>
            ))}
        </div>
    )
}

// ===================================
// Chart Card Wrapper
// ===================================
function ChartCard({ title, index, children, color = '#3B82F6' }: { title: string, index: string, children: React.ReactNode, color?: string }) {
    return (
        <section className="space-y-4">
            <h2 className={cn(TYPOGRAPHY.sectionTitle, "flex items-center gap-3")}>
                <span style={{ color }}>{index}</span>
                {title}
            </h2>
            <div className={cn(CARDS.primary, SPACING.card)}>
                <div className="h-[280px]">
                    {children}
                </div>
            </div>
        </section>
    )
}

// ===================================
// Main Page
// ===================================
export default function ChartCatalogPage() {
    return (
        <div className={`min-h-screen bg-[#050505] text-white p-6 ${SPACING.sectionGap} pb-24`}>
            <header className="border-b border-[#1A1A1A] pb-6">
                <h1 className={TYPOGRAPHY.pageTitle}>圖表目錄 (Chart Catalog)</h1>
                <p className="text-[#A0A0A0] text-sm mt-2">
                    Design System v2.0 — 所有圖表類型一覽 (Mock Data)
                </p>
            </header>

            {/* 1. Price Line Chart */}
            <ChartCard title="價格走勢 (Price)" index="01">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PRICE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#111111" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip content={<UnifiedTooltip unit="" />} />
                        <ReferenceLine x={0} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.8} label={{ value: 'D0', fill: '#EF4444', fontSize: 10 }} />
                        <Line type="monotone" dataKey="value" name="BTC" stroke="#E0E0E0" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* 2. Open Interest Area */}
            <ChartCard title="未平倉量 (OI)" index="02" color="#10B981">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={OI_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#111111" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}B`} />
                        <Tooltip content={<UnifiedTooltip unit="B" />} />
                        <ReferenceLine x={0} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.8} />
                        <Area type="monotone" dataKey="value" name="OI" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* 3. Flow Bar Chart */}
            <ChartCard title="資金流向 (Flow)" index="03" color="#F59E0B">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FLOW_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#111111" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
                        <Tooltip content={<UnifiedTooltip unit="M" />} />
                        <ReferenceLine y={0} stroke="#333333" />
                        <Bar dataKey="value" name="Flow" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* 4. FGI Gradient Area */}
            <ChartCard title="市場情緒 (Fear & Greed)" index="04" color="#EF4444">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FGI_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fgiGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                                <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#111111" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<UnifiedTooltip unit="" />} />
                        <ReferenceLine y={25} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <ReferenceLine y={75} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <Area type="monotone" dataKey="value" name="FGI" stroke="#A0A0A0" fill="url(#fgiGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* 5. Comparison Chart (Dual Line) */}
            <ChartCard title="雙事件對比 (Comparison)" index="05" color="#8B5CF6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={COMPARE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#111111" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<UnifiedTooltip unit="%" />} />
                        <ReferenceLine x={0} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.8} />
                        <Line type="monotone" dataKey="left" name="FTX" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="right" name="LUNA" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* 6. Macro Event Chart */}
            <ChartCard title="總經事件反應 (Macro)" index="06" color="#06B6D4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MACRO_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#111111" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} tickFormatter={(v) => `T${v >= 0 ? '+' : ''}${v}`} />
                        <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<UnifiedTooltip unit="%" />} />
                        <ReferenceLine x={0} stroke="#FFFFFF" strokeOpacity={0.4} />
                        <ReferenceLine y={0} stroke="#333333" />
                        <Line type="monotone" dataKey="r" name="Return" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3, fill: '#06B6D4' }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Summary */}
            <footer className="border-t border-[#1A1A1A] pt-6 mt-8">
                <h3 className={TYPOGRAPHY.sectionTitle}>圖表類型總覽 (6 種)</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <p><span className="text-[#3B82F6]">●</span> Price — 價格走勢線</p>
                        <p><span className="text-[#10B981]">●</span> OI — 未平倉面積圖</p>
                        <p><span className="text-[#F59E0B]">●</span> Flow — 資金流長條圖</p>
                    </div>
                    <div className="space-y-2">
                        <p><span className="text-[#EF4444]">●</span> FGI — 情緒漸層圖</p>
                        <p><span className="text-[#8B5CF6]">●</span> Compare — 雙線對比</p>
                        <p><span className="text-[#06B6D4]">●</span> Macro — 事件反應</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
