'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { HelpDrawer } from '@/components/ui/HelpDrawer'
import { cn } from '@/lib/utils'
import { CARDS, SPACING } from '@/lib/design-tokens'

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

interface Conclusion {
    bias: '偏多' | '偏空' | '觀望'
    action: string
    emoji: string
    reasoning: string
}

export function MarketStatusGrid() {
    const [data, setData] = useState<MarketStatusData | null>(null)
    const [conclusion, setConclusion] = useState<Conclusion | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/market/status')
                if (!res.ok) throw new Error('API Error')
                const json = await res.json()
                if (json.status) setData(json.status)
                if (json.conclusion) setConclusion(json.conclusion)
            } catch (e) {
                console.error(e)
                // Fallback data if API fails
                setData({
                    regime: { label: '讀取中', code: 'stable', value: '--' },
                    leverage: { label: '讀取中', code: 'cool', value: '--' },
                    sentiment: { label: '讀取中', code: 'neutral', value: '--' },
                    whale: { label: '讀取中', code: 'watch', value: '--' },
                    volatility: { label: '讀取中', code: 'low', value: '--' }
                })
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
        const interval = setInterval(fetchStatus, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading && !data) { // show skeleton only on first load
        return (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full bg-[#0A0A0A] rounded-xl" />
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-20 w-24 flex-none bg-[#0A0A0A] rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    // Default Fallback (Safe Guard)
    const displayData = data || {
        regime: { label: '—', code: 'stable', value: '—' },
        leverage: { label: '—', code: 'cool', value: '—' },
        sentiment: { label: '—', code: 'neutral', value: '—' },
        whale: { label: '—', code: 'watch', value: '—' },
        volatility: { label: '—', code: 'low', value: '—' }
    }

    // Helper to get color style based on code
    const getStyle = (code: string) => {
        switch (code) {
            case 'stable': case 'cool': case 'fear': case 'bullish':
                return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'volatile': case 'warm': case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'pressure': case 'overheated': case 'greed': case 'bearish': case 'high':
                return 'text-red-400 bg-red-500/10 border-red-500/20'
            default:
                return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
        }
    }

    // Action-oriented explanations (P1)
    const getActionHint = (code: string, type: string): string => {
        switch (type) {
            case 'regime':
                if (code === 'stable') return '適合區間操作'
                if (code === 'volatile') return '小心多空雙巴'
                return '建議觀望'
            case 'leverage':
                if (code === 'cool') return '有上升空間'
                if (code === 'warm') return '多頭車重，注意'
                return '隨時可能插針'
            case 'sentiment':
                if (code === 'fear') return '別人恐懼我貪婪'
                if (code === 'greed') return '追高風險大'
                return '觀望為主'
            case 'whale':
                if (code === 'bullish') return '跟隨大戶做多'
                if (code === 'bearish') return '大戶在出貨'
                return '無明顯方向'
            case 'volatility':
                if (code === 'high') return '注意風險！'
                if (code === 'medium') return '小心波動'
                return '盤面平靜'
            default: return ''
        }
    }

    const getExplanation = (code: string, type: string) => {
        switch (type) {
            case 'regime': return (
                <>
                    <p>判斷市場目前的大趨勢狀態。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>穩定</strong>：24H 漲跌幅 &lt; 2%，適合區間操作。</li>
                        <li><strong>震盪</strong>：振幅放大，小心多空雙巴。</li>
                        <li><strong>壓力中</strong>：跌幅顯著，建議觀望。</li>
                    </ul>
                </>
            )
            case 'leverage': return (
                <>
                    <p>透過資金費率與清算量判斷槓桿過熱程度。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>冷靜</strong>：費率正常，有上漲空間。</li>
                        <li><strong>偏熱</strong>：多頭車重，小心回調。</li>
                        <li><strong>過熱</strong>：隨時可能插針去槓桿。</li>
                    </ul>
                </>
            )
            case 'sentiment': return (
                <>
                    <p>基於恐懼與貪婪指數 (Fear & Greed)。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>恐慌</strong> (0-30)：通常是買點！</li>
                        <li><strong>中性</strong> (31-60)：情緒平穩。</li>
                        <li><strong>貪婪</strong> (61-100)：追高風險大。</li>
                    </ul>
                </>
            )
            case 'whale': return (
                <>
                    <p>觀察頂級交易員的多空持倉比例。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>偏多</strong>：大戶多單佔比高，跟隨。</li>
                        <li><strong>偏空</strong>：大戶在出貨，小心。</li>
                        <li><strong>觀望</strong>：多空勢均力敵。</li>
                    </ul>
                </>
            )
            case 'volatility': return (
                <>
                    <p>短線波動與爆倉強度的綜合指標。</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li><strong>低</strong>：盤面平靜。</li>
                        <li><strong>中</strong>：小心波動。</li>
                        <li><strong>高</strong>：正在發生劇烈行情！</li>
                    </ul>
                </>
            )
            default: return null
        }
    }

    const cards = [
        { title: '市場狀態', ...displayData.regime, type: 'regime' },
        { title: '槓桿情緒', ...displayData.leverage, type: 'leverage' },
        { title: '市場情緒', ...displayData.sentiment, type: 'sentiment' },
        { title: '大戶動向', ...displayData.whale, type: 'whale' },
        { title: '短線波動', ...displayData.volatility, type: 'volatility' }
    ]

    return (
        <div className="space-y-3">
            {/* Status Cards */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-none w-24 flex flex-col items-center justify-center p-2 rounded-xl border h-20 snap-center relative group",
                            getStyle(card.code)
                        )}
                    >
                        <HelpDrawer
                            title={card.title}
                            content={getExplanation(card.code, card.type)}
                            className="absolute top-1 right-1 opacity-50 hover:opacity-100"
                        />
                        {/* Primary */}
                        <span className="text-[10px] opacity-70 mb-1 font-medium whitespace-nowrap">{card.title}</span>
                        <span className="text-base font-bold tracking-wide whitespace-nowrap">{card.value}</span>
                        {/* Secondary - Action Hint (P1) */}
                        <span className="text-[9px] text-neutral-500 opacity-0 group-hover:opacity-100 whitespace-nowrap mt-0.5">
                            {getActionHint(card.code, card.type)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

