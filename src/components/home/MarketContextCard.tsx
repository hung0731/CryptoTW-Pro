'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Activity, Shield, Newspaper, TrendingUp, Sparkles } from "lucide-react"
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
    etf: { label: 'ETF 流量', url: '/calendar', icon: TrendingUp }
}

const SentimentEmoji = {
    '樂觀': '🚀',
    '保守': '🛡️',
    '恐慌': '🔻',
    '中性': '⚖️',
}

export function MarketContextCard({ data, isLoading }: MarketContextProps) {
    const router = useRouter()

    if (isLoading) {
        return <div className="animate-pulse h-24 bg-neutral-900/50 rounded-xl" />
    }

    if (!data) return null

    // Generate context text from themes
    const getContextText = () => {
        if (data.themes.length === 0) {
            return `市場情緒${data.sentiment}，暫無明顯主線。`
        }

        const mainThemes = data.themes.slice(0, 2)
        const themeTexts = mainThemes.map(t => t.summary).join(' ')
        return themeTexts || `市場整體呈現${data.sentiment}態勢。`
    }

    const contextEmoji = SentimentEmoji[data.sentiment] || '📊'
    const contextText = getContextText()

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-0 overflow-hidden">
            {/* AI Context Card (Same style as Whale page) */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-b border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{contextEmoji}</span>
                    <h3 className="text-sm font-bold text-blue-200">市場脈絡 (AI)</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {contextText}
                </p>
            </div>

            {/* Theme List */}
            {data.themes.length > 0 && (
                <div className="px-3 py-2 space-y-2">
                    {data.themes.slice(0, 3).map((theme, idx) => {
                        const WatchConfig = WatchMap[theme.watch] || WatchMap.sentiment

                        return (
                            <div
                                key={idx}
                                onClick={() => router.push(WatchConfig.url)}
                                className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-neutral-600 font-mono w-4">{idx + 1}</span>
                                    <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">
                                        {theme.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-neutral-500 group-hover:text-blue-400 transition-colors">
                                    {WatchConfig.label}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
