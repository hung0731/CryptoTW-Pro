'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, TrendingUp, DollarSign, Users, BarChart3, Globe, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AnalyticsData {
    total_bindings: number
    verified_bindings: number
    pending_bindings: number
    rejected_bindings: number
    total_volume: number
    total_commission: number
    total_fees: number
    level_distribution: Record<string, number>
    region_distribution: Record<string, number>
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const fetchAnalytics = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/bindings?status=verified&exchange=okx')
            const json = await res.json()

            if (json.bindings) {
                const bindings = json.bindings

                // Calculate aggregated stats
                let totalVolume = 0
                let totalCommission = 0
                let totalFees = 0
                const levelDist: Record<string, number> = {}
                const regionDist: Record<string, number> = {}

                bindings.forEach((b: any) => {
                    totalVolume += b.monthly_volume || 0
                    totalCommission += b.total_commission || 0
                    totalFees += b.accumulated_fee || 0

                    const level = b.okx_level || '未知'
                    levelDist[level] = (levelDist[level] || 0) + 1

                    const region = b.region || '未知'
                    regionDist[region] = (regionDist[region] || 0) + 1
                })

                // Fetch pending count
                const pendingRes = await fetch('/api/admin/bindings?status=pending')
                const pendingData = await pendingRes.json()
                const pendingCount = pendingData.bindings?.length || 0

                // Fetch rejected count
                const rejectedRes = await fetch('/api/admin/bindings?status=rejected')
                const rejectedData = await rejectedRes.json()
                const rejectedCount = rejectedData.bindings?.length || 0

                setData({
                    total_bindings: bindings.length + pendingCount + rejectedCount,
                    verified_bindings: bindings.length,
                    pending_bindings: pendingCount,
                    rejected_bindings: rejectedCount,
                    total_volume: totalVolume,
                    total_commission: totalCommission,
                    total_fees: totalFees,
                    level_distribution: levelDist,
                    region_distribution: regionDist
                })
            }
        } catch (e) {
            console.error(e)
            toast({ title: '載入失敗', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
        return `$${val.toFixed(2)}`
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">OKX 數據分析</h1>
                    <p className="text-neutral-400 mt-1">追蹤交易量、返佣與用戶分布</p>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchAnalytics} className="text-neutral-400 hover:text-white">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* 主要指標 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">總交易量</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(data?.total_volume || 0)}</div>
                        <p className="text-xs text-neutral-500 mt-1">當月累計</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">累計返佣</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(data?.total_commission || 0)}</div>
                        <p className="text-xs text-neutral-500 mt-1">返還給平台</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">用戶手續費</CardTitle>
                        <BarChart3 className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">{formatCurrency(data?.total_fees || 0)}</div>
                        <p className="text-xs text-neutral-500 mt-1">累計支付</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">已驗證用戶</CardTitle>
                        <Users className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{data?.verified_bindings || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">
                            待審核 {data?.pending_bindings || 0} · 已拒絕 {data?.rejected_bindings || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* 等級分布 */}
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">用戶等級分布</CardTitle>
                        <CardDescription className="text-neutral-400">OKX 平台等級統計</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.level_distribution && Object.keys(data.level_distribution).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(data.level_distribution)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([level, count]) => {
                                        const percentage = ((count / (data.verified_bindings || 1)) * 100).toFixed(0)
                                        return (
                                            <div key={level} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-white/20 text-neutral-300">{level}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-neutral-400 w-16 text-right">{count} 人 ({percentage}%)</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        ) : (
                            <p className="text-neutral-500 text-center py-8">尚無數據</p>
                        )}
                    </CardContent>
                </Card>

                {/* 地區分布 */}
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-cyan-400" />
                            <CardTitle className="text-white">地區分布</CardTitle>
                        </div>
                        <CardDescription className="text-neutral-400">用戶註冊地區統計</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.region_distribution && Object.keys(data.region_distribution).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(data.region_distribution)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 8)
                                    .map(([region, count]) => {
                                        const percentage = ((count / (data.verified_bindings || 1)) * 100).toFixed(0)
                                        return (
                                            <div key={region} className="flex items-center justify-between">
                                                <span className="text-neutral-300">{region}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-cyan-500 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-neutral-400 w-16 text-right">{count} 人</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        ) : (
                            <p className="text-neutral-500 text-center py-8">尚無數據</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
