'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Zap, Users } from 'lucide-react'

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

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<AlertEvent[]>([])
    const [marketState, setMarketState] = useState<MarketState | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
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
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-8 text-neutral-500">載入中...</div>
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">市場快訊 (Alerts)</h1>
                <p className="text-neutral-400 mt-2">監控市場狀態變化與歷史警報事件。</p>
            </div>

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
                <CardHeader>
                    <CardTitle className="text-white">歷史警報 (過去 48 小時)</CardTitle>
                    <CardDescription className="text-neutral-400">
                        共 {alerts.length} 筆警報事件
                    </CardDescription>
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
                                        <div className="text-xs text-neutral-600 font-mono">
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
