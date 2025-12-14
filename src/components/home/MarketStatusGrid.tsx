'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { HelpDrawer } from '@/components/ui/HelpDrawer'
import { cn } from '@/lib/utils'

interface StatusItem {
    label: string
    code: string
    value: string
}

interface MarketStatusData {
    regime: StatusItem
    leverage: StatusItem
    sentiment: StatusItem
    whale: StatusItem
    volatility: StatusItem
}

export function MarketStatusGrid() {
    const [data, setData] = useState<MarketStatusData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/market/status')
                const json = await res.json()
                if (json.status) {
                    setData(json.status)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
        // Refresh every minute
        const interval = setInterval(fetchStatus, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full min-w-[80px] bg-neutral-900/50 rounded-lg" />
                ))}
            </div>
        )
    }

    if (!data) return null

    // Helper to get color style based on code
    const getStyle = (code: string) => {
        switch (code) {
            // Regime
            case 'stable': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'volatile': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'pressure': return 'text-red-400 bg-red-500/10 border-red-500/20'

            // Leverage
            case 'cool': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'warm': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'overheated': return 'text-red-400 bg-red-500/10 border-red-500/20'

            // Sentiment
            case 'fear': return 'text-green-400 bg-green-500/10 border-green-500/20' // Opposites? Usually Fear is oversold (good to buy) -> user said "反向思考"
            case 'neutral': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
            case 'greed': return 'text-red-400 bg-red-500/10 border-red-500/20' // Danger

            // Whale
            case 'bullish': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'watch': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
            case 'bearish': return 'text-red-400 bg-red-500/10 border-red-500/20'

            // Volatility
            case 'low': return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20'

            default: return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
        }
    }

    const getExplanation = (code: string, type: string) => {
        switch (type) {
            case 'regime': return (
                <>
                    <p>判斷市場目前的大趨勢狀態。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>穩定</strong>：比特幣 24H 漲跌幅 &lt; 2% 且振幅小。適合區間操作。</li>
                        <li><strong>震盪</strong>：振幅放大 (>3%) 但無明確方向。小心多空雙巴。</li>
                        <li><strong>壓力中</strong>：24H 跌幅顯著 (>3%)。建議觀望或保守操作。</li>
                    </ul>
                </>
            )
            case 'leverage': return (
                <>
                    <p>監測市場槓桿過熱程度，透過資金費率 (Funding Rate) 與清算量判斷。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>冷靜</strong>：費率正常，無大規模清算。</li>
                        <li><strong>偏熱</strong>：費率上升 (>0.03%) 或出現中型清算。多頭車重。</li>
                        <li><strong>過熱</strong>：費率極高 (>0.08%) 或爆倉量大。隨時可能插針去槓桿。</li>
                    </ul>
                </>
            )
            case 'sentiment': return (
                <>
                    <p>基於恐懼與貪婪指數 (Fear & Greed Index)。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>恐慌</strong> (0-30)：市場極度悲觀，通常是買點（別人恐懼我貪婪）。</li>
                        <li><strong>中性</strong> (31-60)：市場情緒平穩。</li>
                        <li><strong>貪婪</strong> (61-100)：市場過度樂觀，追高風險大。</li>
                    </ul>
                </>
            )
            case 'whale': return (
                <>
                    <p>觀察頂級交易員 (Top Traders) 的多空持倉比例。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>偏多</strong>：大戶多單佔比 > 52%。</li>
                        <li><strong>偏空</strong>：大戶空單佔比 > 52%。</li>
                        <li><strong>觀望</strong>：多空勢均力敵。</li>
                    </ul>
                </>
            )
            case 'volatility': return (
                <>
                    <p>短線價格波動與爆倉強度的綜合指標。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>低</strong>：1 小時內波動平靜。</li>
                        <li><strong>中</strong>：出現小幅劇烈波動。</li>
                        <li><strong>高</strong>：正在發生劇烈行情或大額爆倉。請注意風險。</li>
                    </ul>
                </>
            )
            default: return null
        }
    }

    const cards = [
        { title: '市場狀態', ...data.regime, type: 'regime' },
        { title: '槓桿情緒', ...data.leverage, type: 'leverage' },
        { title: '市場情緒', ...data.sentiment, type: 'sentiment' },
        { title: '大戶動向', ...data.whale, type: 'whale' },
        { title: '短線波動', ...data.volatility, type: 'volatility' }
    ]

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={cn(
                        "flex-none w-24 flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-20 snap-center relative",
                        getStyle(card.code)
                    )}
                >
                    <HelpDrawer
                        title={card.title}
                        content={getExplanation(card.code, card.type)}
                        className="absolute top-1 right-1 opacity-50 hover:opacity-100"
                    />
                    <span className="text-[10px] opacity-70 mb-1 font-medium whitespace-nowrap">{card.title}</span>
                    <span className="text-sm font-bold tracking-wide whitespace-nowrap">{card.value}</span>
                </div>
            ))}
        </div>
    )
}
