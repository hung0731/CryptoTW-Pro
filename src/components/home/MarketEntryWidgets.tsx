'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMarketStatusAction } from '@/app/actions/market'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { CARDS } from '@/lib/design-tokens'
import { ChevronRight, Bell } from 'lucide-react'
import { HelpDrawer } from '@/components/ui/HelpDrawer'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { INDICATOR_KNOWLEDGE } from '@/lib/indicator-knowledge'

interface ToolStatus {
    title: string
    status: string
    active: boolean
    href: string
}

// Default initial tools
export function MarketEntryWidgets() {
    const defaultTools: ToolStatus[] = [
        { title: '合約市場', status: '載入中...', active: false, href: '/market' },
        { title: '巨鯨動態', status: '載入中...', active: false, href: '/market/whales' },
        { title: '資金費率', status: '載入中...', active: false, href: '/market/funding' },
        { title: '市場預期', status: '載入中...', active: false, href: '/prediction' },
        { title: '異常警報', status: '載入中...', active: false, href: '/alerts' }
    ]

    const [tools, setTools] = useState<ToolStatus[]>(defaultTools)
    const [loading, setLoading] = useState(true)

    // Explanations for each tool
    const getExplanation = (title: string) => {
        switch (title) {
            case '合約市場': return (
                <>
                    <p>提供期貨合約的即時數據面板。</p>
                    <p className="mt-2 text-neutral-400">當顯示<strong>「槓桿情緒：偏熱」</strong>時，代表市場過度槓桿化，可能會出現插針或回調。</p>
                </>
            )
            case '巨鯨動態': return (
                <>
                    <p>監控大戶與頂級交易員的資金流向。</p>
                    <p className="mt-2 text-neutral-400">當顯示<strong>「出現單邊押注」</strong>或<strong>「🔔」</strong>時，代表主力正在集中做多或做空。</p>
                </>
            )
            case '資金費率': return (
                <>
                    <p>{INDICATOR_KNOWLEDGE.fundingRate.definition}</p>
                    <p className="mt-2 text-neutral-400">{INDICATOR_KNOWLEDGE.fundingRate.interpretation}</p>
                </>
            )
            case '市場預期': return (
                <>
                    <p>來自 Polymarket 的預測市場數據。</p>
                    <p className="mt-2 text-neutral-400">反映真實資金對未來事件（如降息、選舉）的機率判斷，通常比民調更準確。</p>
                </>
            )
            case '異常警報': return (
                <>
                    <p>AI 自動偵測的市場異常事件。</p>
                    <p className="mt-2 text-neutral-400">包含：價格劇烈波動、大額爆倉、巨鯨轉帳等。每日必看。</p>
                </>
            )
            default: return 'No description.'
        }
    }

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await getMarketStatusAction()
                // Check if res matches { status, conclusion, tools? }
                // Actually MarketAction may not return 'tools', let's check MarketStatusService
                // But previously it was /api/market/status, which returned 'tools'
                if (res && 'tools' in res && Array.isArray((res as any).tools)) {
                    setTools((res as any).tools)
                }
            } catch (e) {
                console.error(e)
                // On error, keep defaults but update status to '尚無數據'
                setTools(prev => prev.map(t => ({ ...t, status: t.status === '載入中...' ? '尚無數據' : t.status })))
            } finally {
                setLoading(false)
            }
        }
        void fetchStatus()
    }, [])

    // Only show skeleton on initial mount if really needed, but defaults are better
    if (loading && tools[0].status === '載入中...') {
        return (
            <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-28 w-36 flex-none bg-neutral-900/50 rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">市場工具</h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                {tools.map((tool, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-none w-36 h-28 relative overflow-hidden group snap-center",
                            CARDS.secondary // Standard Type B Card
                        )}
                    >
                        <Link href={tool.href} className="block p-4 h-full w-full flex flex-col justify-between">
                            <div className="flex items-center justify-between pr-4">
                                <span className={cn(
                                    "text-sm font-bold whitespace-nowrap transition-colors",
                                    tool.active ? "text-[#93C5FD]" : "text-white group-hover:text-[#93C5FD]"
                                )}>
                                    {tool.title}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-[#666666] group-hover:text-[#A0A0A0]" />
                            </div>

                            <div className={cn(
                                "text-xs font-medium truncate",
                                tool.active ? "text-[#93C5FD]" : "text-[#808080]"
                            )}>
                                {/* Add Bell icon if active alert */}
                                {tool.active && tool.title === '巨鯨動態' && '🔔 '}
                                {tool.status}
                            </div>
                        </Link>

                        {/* Help Icon - Absolute positioned */}
                        <HelpDrawer
                            title={tool.title}
                            content={getExplanation(tool.title)}
                            className="absolute top-2 right-2 z-20 text-neutral-600 hover:text-white transition-colors"
                        />

                        {/* Active Indicator Pulse */}
                        {tool.active && tool.title === '異常警報' && (
                            <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-red-500 animate-pulse pointer-events-none" />
                        )}
                    </div>
                ))}
            </div>
        </div>

    )
}
