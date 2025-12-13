'use client'

import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { BottomNav } from '@/components/BottomNav'
import { Bell, Sparkles, TrendingUp, TrendingDown, Zap, Users, AlertTriangle, Activity, RefreshCw } from 'lucide-react'
import { ExplainTooltip } from '@/components/ExplainTooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface AlertEvent {
    id: string
    market: string
    alert_type: string
    summary: string
    severity: 'low' | 'medium' | 'high'
    metrics_snapshot: any
    created_at: string
}

interface MarketState {
    leverage_state: string
    whale_state: string
    liquidation_pressure: string
    price: number
    updated_at: string
}

const alertTypeIcons: Record<string, any> = {
    price_pump: TrendingUp,
    price_drop: TrendingDown,
    volatility_warning: Activity,
    heavy_dump: AlertTriangle,
    heavy_pump: Zap,
    liquidation_flip: Activity,
    oi_spike: Zap,
    funding_high: AlertTriangle,
    funding_flip_neg: TrendingDown,
    whale_shift: Users,
    whale_divergence: Users
}

const severityColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
}

export default function AlertsPage() {
    const [loading, setLoading] = useState(true)
    const [alerts, setAlerts] = useState<AlertEvent[]>([])
    const [marketState, setMarketState] = useState<MarketState | null>(null)
    const [aiReport, setAiReport] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async () => {
        try {
            const [alertsRes, summaryRes] = await Promise.all([
                fetch('/api/alerts?hours=24'),
                fetch('/api/market-summary')
            ])

            const alertsData = await alertsRes.json()
            const summaryData = await summaryRes.json()

            setAlerts(alertsData.alerts || [])
            setMarketState(alertsData.marketState || null)
            setAiReport(summaryData.report || null)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchData()
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            <PageHeader title="市場快訊" showLogo={false} />

            <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
                {/* Current Market State */}
                {marketState && (
                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-white">BTC 市場狀態</span>
                                <ExplainTooltip
                                    term="BTC 市場狀態"
                                    definition="比特幣當前的市場健康度檢查。"
                                    explanation={
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><strong>槓桿狀態</strong>：過熱代表大量借貸做多，容易回調。</li>
                                            <li><strong>巨鯨狀態</strong>：大戶做多代表有主力護盤。</li>
                                            <li><strong>爆倉壓力</strong>：顯示價格容易被吸往哪個方向。</li>
                                        </ul>
                                    }
                                />
                            </div>
                            <button onClick={handleRefresh} disabled={refreshing} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <RefreshCw className={`w-3.5 h-3.5 text-neutral-400 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-[10px] text-neutral-500 mb-1">現價</p>
                                <p className="text-lg font-bold text-white">${marketState.price?.toLocaleString()}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-neutral-500">槓桿</span>
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-blue-400 border-blue-500/30">{marketState.leverage_state}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-neutral-500">巨鯨</span>
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-purple-400 border-purple-500/30">{marketState.whale_state}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-32 w-full rounded-xl bg-neutral-900" />
                        <Skeleton className="h-24 w-full rounded-xl bg-neutral-900" />
                        <Skeleton className="h-24 w-full rounded-xl bg-neutral-900" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* AI Summary */}
                        {aiReport && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-medium text-neutral-500 ml-1">AI 市場解讀</h3>
                                <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Sparkles className="w-12 h-12 text-purple-500" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-purple-400">AI Insight</span>
                                        <ExplainTooltip
                                            term="AI Insight"
                                            definition="AI 自動分析過去 24 小時的所有異動訊號，生成摘要報告。"
                                            explanation={
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li>幫助你快速掌握今日市場主旋律。</li>
                                                    <li>過濾雜訊，只專注於有意義的結構改變。</li>
                                                </ul>
                                            }
                                        />
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2">{aiReport.headline}</h4>
                                    <p className="text-xs text-neutral-300 leading-relaxed border-l-2 border-purple-500/30 pl-3">
                                        {aiReport.analysis}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Alert Events */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-medium text-neutral-500 ml-1">過去 24 小時異動</h3>
                                <span className="text-[10px] text-neutral-600">{alerts.length} 筆</span>
                            </div>

                            {alerts.length === 0 ? (
                                <div className="text-center py-8 text-neutral-600 bg-neutral-900/30 rounded-xl border border-white/5">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">過去 24 小時無顯著市場異動</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {alerts.map((alert) => {
                                        const IconComponent = alertTypeIcons[alert.alert_type] || AlertTriangle
                                        return (
                                            <div
                                                key={alert.id}
                                                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-white/5"
                                            >
                                                <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-500/10' : 'bg-neutral-800'}`}>
                                                    <IconComponent className={`w-4 h-4 ${alert.severity === 'high' ? 'text-red-400' : 'text-neutral-400'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className={`text-[10px] py-0 px-1.5 ${severityColors[alert.severity]}`}>
                                                            {alert.severity === 'high' ? '重要' : alert.severity === 'medium' ? '注意' : '一般'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-white font-medium leading-relaxed">{alert.summary}</p>
                                                    <p className="text-[10px] text-neutral-500 mt-1">
                                                        {new Date(alert.created_at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
