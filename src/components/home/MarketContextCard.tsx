
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, TrendingUp, TrendingDown, Activity, AlertTriangle, Shield, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"

interface Theme {
    title: string
    summary: string
    watch: 'contracts' | 'whales' | 'macro' | 'sentiment' | 'etf'
    why_it_matters: string
}

interface MarketContextProps {
    data: {
        sentiment: '樂觀' | '保守' | '恐慌' | '中性'
        themes: Theme[]
    } | null
    isLoading?: boolean
}

const WatchMap = {
    contracts: { label: '合約數據', url: '/prediction?tab=derivatives', icon: Activity },
    whales: { label: '巨鯨動向', url: '/prediction?tab=smartmoney', icon: Shield },
    macro: { label: '宏觀日曆', url: '/calendar', icon: Newspaper },
    sentiment: { label: '市場數據', url: '/prediction', icon: TrendingUp },
    etf: { label: 'ETF 流量', url: '/calendar', icon: TrendingUp } // Fallback or specific page
}

const SentimentColors = {
    '樂觀': 'text-green-500 bg-green-500/10 border-green-500/20',
    '保守': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    '恐慌': 'text-red-500 bg-red-500/10 border-red-500/20',
    '中性': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
}

export function MarketContextCard({ data, isLoading }: MarketContextProps) {
    const router = useRouter()
    const [expanded, setExpanded] = useState(false)

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-muted/20 rounded-xl mb-4" />
    }

    if (!data) return null

    return (
        <Card className="mb-6 border-l-4 border-l-primary/50 overflow-hidden bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                            今日市場脈絡
                        </h3>
                        <Badge variant="outline" className={cn("text-xs font-medium border", SentimentColors[data.sentiment])}>
                            {data.sentiment}
                        </Badge>
                    </div>
                </div>

                {/* Brief List */}
                <div className="space-y-3">
                    {data.themes.map((theme, idx) => {
                        const WatchConfig = WatchMap[theme.watch] || WatchMap.sentiment
                        const Icon = WatchConfig.icon

                        // Only show first 2 items if not expanded, unless there are few items
                        if (!expanded && idx > 1 && data.themes.length > 2) return null

                        return (
                            <div key={idx} className="group relative pl-3 border-l-2 border-muted hover:border-primary transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-foreground/90 leading-tight mb-1">
                                            {theme.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {theme.summary}
                                        </p>

                                        {/* Why it matters & Action (Conditional or always visible?) 
                                            User requested: "Collapsed: simple... Expanded: Detail".
                                            Let's show "Why" in a subtle way.
                                        */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground/70 bg-muted/30 px-1.5 py-0.5 rounded">
                                                💡 {theme.why_it_matters}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 text-[10px] px-2 text-primary hover:text-primary/80 hover:bg-primary/5 ml-auto"
                                                onClick={() => router.push(WatchConfig.url)}
                                            >
                                                查看{WatchConfig.label} <ChevronRight className="w-3 h-3 ml-0.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Expand Toggle */}
                {data.themes.length > 2 && (
                    <div className="mt-3 text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-6 text-muted-foreground hover:text-foreground"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? '收起' : `還有 ${data.themes.length - 2} 個重點...`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
