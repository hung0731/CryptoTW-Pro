'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChevronRight, Bell } from 'lucide-react'

interface ToolStatus {
    title: string
    status: string
    active: boolean
    href: string
}

export function MarketEntryWidgets() {
    const [tools, setTools] = useState<ToolStatus[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/market/status')
                const json = await res.json()
                if (json.tools) {
                    setTools(json.tools)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 w-full bg-neutral-900/50 rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">市場工具</h3>
            <div className="grid grid-cols-2 gap-3">
                {tools.map((tool, i) => (
                    <Link
                        key={i}
                        href={tool.href}
                        className={cn(
                            "flex flex-col justify-center p-4 rounded-xl border transition-all relative overflow-hidden group",
                            // Alert/Active style vs Neutral style
                            tool.active
                                ? "bg-neutral-900/80 border-blue-500/30 hover:border-blue-500/50"
                                : "bg-neutral-900/30 border-white/5 hover:bg-neutral-900/50"
                        )}
                    >
                        {/* Active Indicator (optional subtle glow or icon) */}
                        {tool.active && tool.title === '異常警報' && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}

                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                                {tool.title}
                            </span>
                            {/* Arrow mainly for cues */}
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400" />
                        </div>

                        <div className={cn(
                            "text-xs font-medium truncate",
                            tool.active ? "text-blue-300" : "text-neutral-500"
                        )}>
                            {/* Add Bell icon if active alert */}
                            {tool.active && tool.title === '巨鯨動態' && '🔔 '}
                            {tool.status}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
