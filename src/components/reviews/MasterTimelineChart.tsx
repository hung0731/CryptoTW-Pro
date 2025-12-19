'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceDot,
    ReferenceArea,
    Label,
    Brush
} from 'recharts';
// import { MOCK_BTC_HISTORY } from '@/lib/mock-btc-data';
import { REAL_BTC_HISTORY } from '@/lib/btc-history-real';
import { REVIEWS_DATA } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

interface MasterTimelineChartProps {
    onEventClick: (year: number) => void;
    selectedYear: number | null;
}

const getEventIcon = (type: string) => {
    const map: Record<string, string> = {
        'leverage_cleanse': '💥',
        'exchange_event': '🏦',
        'macro_shock': '🦢',
        'policy_regulation': '⚖️',
        'tech_event': '⚡',
        'market_structure': '🏗️',
        'trust_collapse': '💔'
    };
    return map[type] || '📍';
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0A0A0A]/95 border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-md z-50 min-w-[150px]">
                <p className="text-[10px] font-mono text-neutral-400 mb-1 border-b border-white/5 pb-1">{label}</p>
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <p className="text-sm font-bold text-white">BTC: ${payload[0].value.toLocaleString()}</p>
                </div>
            </div>
        );
    }
    return null;
};

// Helper to find closest exact data point for correct positioning
const getEventPosition = (dateStr: string) => {
    // We need to find the data point that best matches this YYYY-MM
    // The data points are YYYY-MM-DD (mostly 01 or specific dates)

    // 1. Try to find exact match for YYYY-MM-DD (assuming dateStr is YYYY-MM, we try appending -01)
    const targetMonthStart = `${dateStr}-01`;
    const point = REAL_BTC_HISTORY.find(p => p.date === targetMonthStart);

    if (point) return { x: point.date, y: point.price };

    // 2. If not found, find closest by time diff in the entire dataset
    const targetTime = new Date(dateStr).getTime();
    if (isNaN(targetTime)) return { x: REAL_BTC_HISTORY[0].date, y: REAL_BTC_HISTORY[0].price }; // Fallback

    const closest = REAL_BTC_HISTORY.reduce((prev, curr) => {
        return (Math.abs(new Date(curr.date).getTime() - targetTime) < Math.abs(new Date(prev.date).getTime() - targetTime) ? curr : prev);
    });

    return { x: closest.date, y: closest.price };
};

const MARKET_ERAS = [
    { start: '2014-01', end: '2016-12', label: '草莽時代 (Wild West)', color: '#3b82f6', opacity: 0.05 },
    { start: '2017-01', end: '2017-12', label: 'ICO 狂熱', color: '#10b981', opacity: 0.1 },
    { start: '2018-01', end: '2019-12', label: '寒冬 I (Winter)', color: '#ef4444', opacity: 0.05 },
    { start: '2020-01', end: '2021-11', label: 'DeFi 盛夏 / QE', color: '#10b981', opacity: 0.1 },
    { start: '2021-12', end: '2022-12', label: '去槓桿 (Deleveraging)', color: '#ef4444', opacity: 0.1 },
    { start: '2023-01', end: '2025-12', label: '機構時代 (ETF)', color: '#8b5cf6', opacity: 0.1 },
];


export function MasterTimelineChart({ onEventClick, selectedYear }: MasterTimelineChartProps) {
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [brushRange, setBrushRange] = useState<any>(null);
    const displayedData = brushRange ? REAL_BTC_HISTORY.slice(brushRange.startIndex, brushRange.endIndex + 1) : REAL_BTC_HISTORY;
    const yMin = displayedData.length > 0 ? Math.min(...displayedData.map(d => d.price)) : 0;
    const yMax = displayedData.length > 0 ? Math.max(...displayedData.map(d => d.price)) : 100000;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-scroll to the end (Right) on mount to show latest events
    useLayoutEffect(() => {
        if (isMounted && scrollContainerRef.current) {
            // Slight timeout to ensure layout is painted
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
                }
            }, 100);
        }
    }, [isMounted]);

    if (!isMounted) {
        return <div className="w-full h-[360px] bg-[#050505] flex items-center justify-center text-neutral-800 animate-pulse">Loading History...</div>;
    }

    return (
        <div className="w-full h-[380px] bg-[#050505] relative group border-b border-white/5 flex flex-col">

            {/* Header / Legend - Z-index higher, but ensure pointer-events-none */}
            <div className="absolute top-4 left-6 z-20 pointer-events-none">
                <h2 className="text-xs font-bold text-white/80 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    BTC MASTER TIMELINE (2014-2025)
                </h2>
                <p className="text-[10px] text-neutral-500 mt-0.5">滑動查看完整歷史 · Log 座標</p>
            </div>



            {/* Scrollable Container
                - Removed 'hide-scrollbar' so users on desktop see the bar.
                - Added 'pb-6' to make room for scrollbar.
                - touch-action: pan-x for better mobile handling.
            */}
            <div className="flex-1 w-full relative min-h-0 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={displayedData}
                        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Market Eras Background */}
                        {MARKET_ERAS.map((era) => (
                            <ReferenceArea
                                key={era.label}
                                x1={era.start}
                                x2={era.end}
                                fill={era.color}
                                fillOpacity={era.opacity}
                            >
                                <Label
                                    position="top"
                                    offset={10}
                                    className="fill-white/30 text-[12px] font-bold tracking-wider"
                                    value={era.label}
                                />
                            </ReferenceArea>
                        ))}

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" opacity={0.5} />

                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }}
                            tickFormatter={(val) => val.split('-')[0]} // Show Year
                            axisLine={false}
                            tickLine={false}
                            ticks={['2015-01', '2020-01', '2025-01']}
                            minTickGap={0}
                            dy={10}
                        />

                        <YAxis
                            domain={[yMin * 0.9, yMax * 1.1]}
                            scale="log"
                            orientation="right"
                            tick={{ fontSize: 9, fill: '#666', fontFamily: 'monospace' }}
                            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            allowDataOverflow={true}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                            dx={5}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBtc)"
                            isAnimationActive={false}
                        />


                        {/* Render Events */}
                        {REVIEWS_DATA.map((event, index) => {
                            const eventDate = (event.eventStartAt || '2020-01-01').substring(0, 7);
                            const position = getEventPosition(eventDate);

                            // Filter events outside the current brush range
                            if (displayedData.length > 0) {
                                const startDate = displayedData[0]?.date;
                                const endDate = displayedData[displayedData.length - 1]?.date;
                                if (startDate && endDate && (eventDate < startDate || eventDate > endDate)) {
                                    return null;
                                }
                            }

                            const isCrash = ['leverage_cleanse', 'exchange_event', 'macro_shock', 'trust_collapse'].includes(event.type) || event.reactionType === 'trust_collapse';
                            const isSurge = ['policy_regulation', 'tech_event', 'priced_in'].includes(event.type) || event.reactionType === 'priced_in';

                            const color = isCrash ? '#ef4444' : (isSurge ? '#10b981' : '#f59e0b');
                            const icon = getEventIcon(event.type);

                            const isSelected = selectedYear === event.year;
                            const isHovered = hoveredEvent === event.id;

                            // V6: Larger visuals & Staggered Labels
                            // Actually user said "too concentrated", so listing names helps identifying?
                            // Let's stick to Importance 'S' OR Hover, but staggered creates room for more.
                            const shouldShowLabel = event.importance === 'S' || isSelected || isHovered;

                            const labelText = event.slug.toUpperCase();

                            // Stagger Logic: Even -> Top, Odd -> Bottom
                            const isTopObj = index % 2 === 0;
                            const labelYOffset = isTopObj ? -28 : 28;

                            return (
                                <ReferenceDot
                                    key={event.id}
                                    x={position.x}
                                    y={position.y}
                                    alwaysShow
                                    shape={(props: any) => {
                                        const { cx, cy } = props;
                                        if (!cx || !cy) return null;

                                        // V6: Increased Size
                                        const baseR = 12; // Was 8

                                        return (
                                            <g
                                                className="cursor-pointer group"
                                                onClick={() => onEventClick(event.year)}
                                                onMouseEnter={() => setHoveredEvent(event.id)}
                                                onMouseLeave={() => setHoveredEvent(null)}
                                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                                            >
                                                {isSelected && (
                                                    <circle cx={cx} cy={cy} r={baseR + 8} fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
                                                )}
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={isHovered ? baseR + 5 : baseR}
                                                    fill="#0A0A0A"
                                                    stroke={color}
                                                    strokeWidth={isHovered ? 2 : 1.5}
                                                    className="transition-all duration-300"
                                                />
                                                <text
                                                    x={cx}
                                                    y={cy}
                                                    dy={4}
                                                    textAnchor="middle"
                                                    fontSize={isHovered ? 16 : 14}
                                                    className="pointer-events-none select-none transition-all"
                                                    filter={isHovered ? "drop-shadow(0 0 4px rgba(255,255,255,0.5))" : ""}
                                                >
                                                    {icon}
                                                </text>

                                                {/* Staggered Floating Label */}
                                                {shouldShowLabel && (
                                                    <g
                                                        transform={`translate(${cx}, ${cy + labelYOffset})`}
                                                        className="animate-in fade-in zoom-in duration-300"
                                                    >
                                                        {/* Optional Connector Line */}
                                                        <line
                                                            x1="0" y1={isTopObj ? 14 : -14}
                                                            x2="0" y2={isTopObj ? 20 : -20}
                                                            stroke={color}
                                                            strokeWidth="1"
                                                            opacity="0.5"
                                                        />

                                                        <rect
                                                            x="-30"
                                                            y={isTopObj ? -10 : -6} // Adjust rect based on direction
                                                            width="60"
                                                            height="20"
                                                            rx="4"
                                                            fill="#000"
                                                            stroke={color}
                                                            strokeWidth="1"
                                                        />
                                                        <text
                                                            x="0"
                                                            y={isTopObj ? 4 : 8}
                                                            textAnchor="middle"
                                                            fill="#FFF"
                                                            fontWeight="bold"
                                                            fontSize="10"
                                                            fontFamily="monospace"
                                                        >
                                                            {labelText}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    }}
                                />
                            );
                        })}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom: Context Chart (Slider) with Eras */}
            <div className="h-[50px] w-full mt-1 relative border-t border-white/5 bg-[#0A0A0A]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={REAL_BTC_HISTORY}
                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >


                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#333"
                            strokeWidth={1}
                            fill="#222"
                            fillOpacity={0.5}
                            isAnimationActive={false}
                        />

                        {/* Eras Backgrounds - Moved AFTER Area to ensure Labels are visible on top */}
                        {MARKET_ERAS.map((era) => (
                            <ReferenceArea
                                key={era.label}
                                x1={era.start}
                                x2={era.end}
                                fill={era.color}
                                fillOpacity={0.15}
                            >
                                <Label
                                    value={era.label}
                                    position="center"
                                    fill="#FFFFFF"
                                    fontSize={10}
                                    fontWeight="bold"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                                />
                            </ReferenceArea>
                        ))}

                        {/* The Magic Brush - Controls the Top Chart */}
                        <Brush
                            dataKey="date"
                            height={50}
                            stroke="#3b82f6"
                            travellerWidth={6}
                            onChange={(range) => setBrushRange(range)}
                            startIndex={brushRange?.startIndex}
                            endIndex={brushRange?.endIndex}
                            fill="transparent"
                            tickFormatter={(val) => val.split('-')[0]}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>



        </div >
    );
}
