
'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Lock, Settings, RefreshCcw, ExternalLink, ArrowRight, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLiff } from '@/components/LiffProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ArbitrageItem {
    symbol: string
    buy: {
        exchange: string
        open_interest_usd: number
        funding_rate: number
        funding_rate_interval?: number
    }
    sell: {
        exchange: string
        open_interest_usd: number
        funding_rate: number
        funding_rate_interval?: number
    }
    apr: number
    funding: number // diff
    fee: number
    spread: number
    next_funding_time: number
}

const EXCHANGE_OPTIONS = ['Binance', 'OKX', 'Bybit', 'Bitget', 'Gate.io']

export function ArbitrageView() {
    const { dbUser } = useLiff()
    const isPro = ['pro', 'vip', 'lifetime'].includes(dbUser?.membership_status || '')

    const [data, setData] = useState<ArbitrageItem[]>([])
    const [loading, setLoading] = useState(true)
    const [principal, setPrincipal] = useState(10000)
    const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]) // Empty = All

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Construct Query
                const params = new URLSearchParams()
                params.set('usd', principal.toString())
                if (selectedExchanges.length > 0) {
                    params.set('exchange_list', selectedExchanges.join(','))
                }

                const res = await fetch(`/api/market/arbitrage?${params.toString()}`)
                const json = await res.json()
                if (json.arbitrage) {
                    setData(json.arbitrage)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        // Debounce fetch if inputs change frequently? For now simpler effect.
        fetchData()
    }, [principal, selectedExchanges]) // In real app, debounce this.

    // Calculate Net Profit for Display
    const calculateProfit = (item: ArbitrageItem) => {
        // Simple Estimation: Principal * (Funding Diff) - Fee - Spread
        // APR is annual.
        // Funding is per period (usually 8h).
        // Let's use Funding Rate Diff for "Next Payment".
        // item.funding is the diff rate.
        const fundingYield = item.funding * principal
        // Fee (approx check Coinglass response unit, usually rate?)
        const cost = (item.fee + Math.abs(item.spread)) * principal
        const net = fundingYield - cost
        return { fundingYield, cost, net }
    }

    const displayData = isPro ? data : data.slice(0, 3)

    return (
        <div className="space-y-4">
            {/* 1. Risk Warning (Fixed) */}
            {/* 1. Risk Warning (Red Alert) */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200/80 leading-relaxed">
                    <strong className="text-red-400 block mb-1 text-sm">⚠️ 適合熟悉對沖與保證金機制者，新手不建議直接操作</strong>
                    <ul className="list-disc pl-3 space-y-0.5 text-[11px] text-red-200/70 mt-1">
                        <li><strong>資金費率快速反轉</strong>：年化收益為即時推算，不代表長期回報。</li>
                        <li><strong>槓桿方向錯誤</strong>：操作失誤可能導致單邊虧損。</li>
                        <li><strong>流動性不足</strong>：小幣種可能面臨滑價或無法平倉。</li>
                        <li><strong>強平風險</strong>：若保證金監控不當，可能面臨強制平倉。</li>
                    </ul>
                </div>
            </div>

            {/* 2. Controls (Pro Only) */}
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> 參數設定
                        {!isPro && <Badge variant="secondary" className="bg-neutral-800 text-neutral-500 text-[10px]">Pro</Badge>}
                    </h3>
                    {!isPro && (
                        <span className="text-[10px] text-neutral-500">解鎖完整篩選功能</span>
                    )}
                </div>

                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", !isPro && "opacity-50 pointer-events-none grayscale")}>
                    <div>
                        <label className="text-[10px] text-neutral-500 mb-1.5 block">本金 (USD)</label>
                        <div className="relative">
                            <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                            <Input
                                type="number"
                                value={principal}
                                onChange={(e) => setPrincipal(parseInt(e.target.value) || 0)}
                                className="pl-9 bg-black/40 border-white/10 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-neutral-500 mb-1.5 block">交易所篩選</label>
                        <div className="flex flex-wrap gap-2">
                            {EXCHANGE_OPTIONS.map(ex => (
                                <button
                                    key={ex}
                                    onClick={() => {
                                        if (selectedExchanges.includes(ex)) {
                                            setSelectedExchanges(selectedExchanges.filter(e => e !== ex))
                                        } else {
                                            setSelectedExchanges([...selectedExchanges, ex])
                                        }
                                    }}
                                    className={cn(
                                        "px-2 py-1 rounded text-[10px] border transition-all",
                                        selectedExchanges.includes(ex)
                                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                            : "bg-black/40 text-neutral-500 border-white/10 hover:border-white/20"
                                    )}
                                >
                                    {ex}
                                </button>
                            ))}
                            {selectedExchanges.length === 0 && (
                                <span className="text-[10px] text-neutral-600 self-center">全選 (預設)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Data List */}
            <div className="space-y-3">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full bg-neutral-900/50 rounded-xl" />)
                ) : (
                    <>
                        {displayData.map((item, i) => {
                            const { net } = calculateProfit(item)
                            const isPositive = net > 0
                            return (
                                <div key={i} className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                                    {/* Header: Symbol & APR */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Symbol Icon Placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 text-xs">
                                                {item.symbol.substring(0, 3)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white">{item.symbol}</h3>
                                                <span className="text-[10px] text-neutral-500">OI ${(Math.min(item.buy.open_interest_usd, item.sell.open_interest_usd) / 1000000).toFixed(1)}M</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-neutral-500 mb-0.5">理論 APR</div>
                                            <div className="text-xl font-mono font-bold text-green-400">
                                                {item.apr.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategy Block */}
                                    <div className="grid grid-cols-7 gap-2 items-center bg-black/20 rounded-lg p-2 mb-3 text-xs">
                                        {/* Buy Leg */}
                                        <div className="col-span-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-green-400 font-bold bg-green-500/10 px-1.5 rounded">買入 Long</span>
                                                <span className="text-neutral-400">{item.buy.exchange}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                                                <span>費率</span>
                                                <span className={cn(item.buy.funding_rate < 0 ? "text-green-400" : "text-white")}>
                                                    {(item.buy.funding_rate * 100).toFixed(4)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="col-span-1 flex justify-center">
                                            <RefreshCcw className="w-3 h-3 text-neutral-600" />
                                        </div>

                                        {/* Sell Leg */}
                                        <div className="col-span-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-red-400 font-bold bg-red-500/10 px-1.5 rounded">賣出 Short</span>
                                                <span className="text-neutral-400">{item.sell.exchange}</span>
                                            </div>
                                            <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                                                <span>費率</span>
                                                <span className={cn(item.sell.funding_rate > 0 ? "text-green-400" : "text-white")}>
                                                    {(item.sell.funding_rate * 100).toFixed(4)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Yield & Footer */}
                                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[10px]">
                                                <span className="text-neutral-500 block">Spread</span>
                                                <span className="text-neutral-300 font-mono">{(item.spread * 100).toFixed(2)}%</span>
                                            </div>
                                            <div className="text-[10px]">
                                                <span className="text-neutral-500 block">淨收益估算</span>
                                                <span className={cn("font-mono font-bold", isPositive ? "text-green-400" : "text-red-400")}>
                                                    {isPositive ? '+' : ''}{net.toFixed(2)} USD
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-neutral-600">
                                                下次结算: {new Date(item.next_funding_time).getHours()}:00
                                            </span>
                                            {/* Link or Action? Just visual for now */}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Paywall Gate */}
                        {!isPro && data.length > 3 && (
                            <div className="relative overflow-hidden rounded-xl border border-white/5 p-4">
                                <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                                    <Lock className="w-8 h-8 text-neutral-500 mb-3" />
                                    <h3 className="text-sm font-bold text-white mb-1">解鎖更多套利機會</h3>
                                    <p className="text-xs text-neutral-400 mb-4 max-w-[200px]">
                                        目前還有 {data.length - 3} 個高收益機會隱藏中。升級 Pro 可查看完整清單與自訂篩選。
                                    </p>
                                    <Button size="sm" className="bg-white text-black hover:bg-neutral-200">
                                        升級 Pro
                                    </Button>
                                </div>
                                {/* Blurred Mock Row */}
                                <div className="opacity-20 blur-sm pointer-events-none">
                                    <div className="h-32 bg-neutral-800 rounded-xl"></div>
                                </div>
                            </div>
                        )}

                        {data.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-sm text-neutral-500">暫無符合條件的套利機會</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
