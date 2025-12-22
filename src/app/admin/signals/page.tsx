'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, Bot, AlertTriangle, TrendingUp, TrendingDown, Zap, Users, RefreshCw, Loader2, Newspaper, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// --- Alerts Components ---
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
    id: string
    market: string
    leverage_state: string
    whale_state: string
    liquidation_pressure: string
    price: number
    funding_rate: number
    open_interest: number
    long_short_ratio: number
    updated_at: string
}

const severityColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/50',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    low: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/50'
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

function AlertsTab() {
    const [alerts, setAlerts] = useState<AlertEvent[]>([])
    const [marketState, setMarketState] = useState<MarketState | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/alerts?hours=48')
            const data = await res.json()
            setAlerts(data.alerts || [])
            setMarketState(data.marketState || null)
        } catch (e) {
            console.error('Failed to fetch alerts:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-8 text-neutral-500 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            {/* Current Market State */}
            {marketState && (
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-400" />
                            當前市場狀態 (BTC)
                        </CardTitle>
                        <CardDescription className="text-neutral-500">
                            最後更新: {new Date(marketState.updated_at).toLocaleString('zh-TW')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">價格</p>
                                <p className="text-lg font-bold text-white">${marketState.price?.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">槓桿狀態</p>
                                <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                                    {marketState.leverage_state}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">巨鯨狀態</p>
                                <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                                    {marketState.whale_state}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">爆倉壓力</p>
                                <Badge variant="outline" className="text-amber-400 border-amber-500/50">
                                    {marketState.liquidation_pressure}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">資金費率</p>
                                <p className="text-sm font-medium text-white">
                                    {(marketState.funding_rate * 100).toFixed(4)}%
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-neutral-500">多空比</p>
                                <p className="text-sm font-medium text-white">
                                    {marketState.long_short_ratio?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alert History */}
            <Card className="bg-neutral-900 border-white/5">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-white">歷史警報 (過去 48 小時)</CardTitle>
                        <CardDescription className="text-neutral-400">
                            共 {alerts.length} 筆警報事件
                        </CardDescription>
                    </div>
                    <button onClick={fetchData} className="text-neutral-500 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                            過去 48 小時內無警報事件
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => {
                                const IconComponent = alertTypeIcons[alert.alert_type] || AlertTriangle
                                return (
                                    <div
                                        key={alert.id}
                                        className="flex items-start gap-4 p-4 rounded-lg bg-neutral-800/50 border border-white/5"
                                    >
                                        <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-500/20' : 'bg-neutral-700'}`}>
                                            <IconComponent className={`h-5 w-5 ${alert.severity === 'high' ? 'text-red-400' : 'text-neutral-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={severityColors[alert.severity]}>
                                                    {alert.severity.toUpperCase()}
                                                </Badge>
                                                <span className="text-xs text-neutral-500">
                                                    {alert.alert_type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white font-medium">{alert.summary}</p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {new Date(alert.created_at).toLocaleString('zh-TW')}
                                            </p>
                                        </div>
                                        <div className="text-xs text-neutral-600 font-mono hidden md:block">
                                            {JSON.stringify(alert.metrics_snapshot).slice(0, 50)}...
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// --- AI Status Components ---
interface CacheStatus {
    caches: {
        market_context: { exists: boolean, data: any, description: string }
        ai_decision: { exists: boolean, data: any, description: string }
        coinglass_news: { exists: boolean, itemCount: number, description: string }
    }
    lastChecked: string
}

function AIStatusTab() {
    const [status, setStatus] = useState<CacheStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/ai')
            const json = await res.json()
            setStatus(json)
        } catch (e) {
            console.error('Fetch error:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStatus() }, [])

    const handleAction = async (action: 'regenerate' | 'clear', type: string) => {
        setActionLoading(`${action}-${type}`)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, type })
            })
            const json = await res.json()
            if (json.success) {
                setMessage({ type: 'success', text: json.message })
                fetchStatus()
            } else {
                setMessage({ type: 'error', text: json.error || '操作失敗' })
            }
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message })
        } finally {
            setActionLoading(null)
        }
    }

    const cards = [
        {
            id: 'market_context',
            title: 'AI 新聞懶人包',
            description: '快訊頁面的 10 則排序新聞',
            icon: Newspaper,
            color: 'blue',
            data: status?.caches.market_context
        },
        {
            id: 'ai_decision',
            title: 'AI 市場決策',
            description: '首頁的市場判讀結論',
            icon: TrendingUp,
            color: 'purple',
            data: status?.caches.ai_decision
        }
    ]

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">AI 快取狀態</h3>
                <button
                    onClick={() => handleAction('regenerate', 'all')}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                >
                    {actionLoading === 'regenerate-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    重新生成全部
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            <div className="grid gap-4">
                {cards.map(card => (
                    <div key={card.id} className="bg-neutral-900/50 border border-white/10 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-${card.color}-500/20`}>
                                    <card.icon className={`w-5 h-5 text-${card.color}-400`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{card.title}</h3>
                                    <p className="text-xs text-neutral-500">{card.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {card.data?.exists ? (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">已快取</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-neutral-700 text-neutral-400 text-xs rounded">無快取</span>
                                )}
                            </div>
                        </div>

                        {card.data?.exists && card.data?.data && (
                            <div className="bg-neutral-800/50 rounded-lg p-3 mb-4 max-h-40 overflow-auto">
                                {card.id === 'market_context' && (
                                    <div>
                                        <p className="text-sm text-white mb-2">{card.data.data.summary}</p>
                                        <p className="text-xs text-neutral-500">{card.data.data.highlights?.length || 0} 則新聞</p>
                                    </div>
                                )}
                                {card.id === 'ai_decision' && (
                                    <div>
                                        <p className="text-sm text-white mb-1">{card.data.data.conclusion}</p>
                                        <p className="text-xs text-neutral-400">{card.data.data.action}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction('regenerate', card.id)}
                                disabled={actionLoading !== null}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                {actionLoading === `regenerate-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                重新生成
                            </button>
                            <button
                                onClick={() => handleAction('clear', card.id)}
                                disabled={actionLoading !== null}
                                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm disabled:opacity-50"
                            >
                                {actionLoading === `clear-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-center text-xs text-neutral-500">
                快取為記憶體快取，伺服器重啟後會清除
            </div>
        </div>
    )
}

export default function SignalsPage() {
    return (
        <div className="p-6 md:p-8 space-y-8 w-full max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">市場情報 (Signals)</h1>
                <p className="text-neutral-400 mt-2">監控市場警報與 AI 分析狀態</p>
            </div>

            <Tabs defaultValue="alerts" className="w-full">
                <TabsList className="bg-neutral-900 border border-white/10 text-neutral-400">
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        市場警報
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <Bot className="w-4 h-4 mr-2" />
                        AI 狀態
                    </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="alerts">
                        <AlertsTab />
                    </TabsContent>
                    <TabsContent value="ai">
                        <AIStatusTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
