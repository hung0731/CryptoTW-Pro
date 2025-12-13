'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, TrendingUp, DollarSign, Activity, Clock, RefreshCw, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart'
import { VolumeTrendChart } from '@/components/admin/charts/VolumeTrendChart'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [chartsData, setChartsData] = useState<any>(null)
    const [recentBindings, setRecentBindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const loadData = async () => {
        setLoading(true)
        try {
            // 1. Fetch Stats & Charts
            const statsRes = await fetch('/api/admin/stats')
            const statsData = await statsRes.json()
            if (statsData.stats) setStats(statsData.stats)
            if (statsData.charts) setChartsData(statsData.charts)

            // 2. Fetch Recent Pending Bindings
            const pendingRes = await fetch('/api/admin/bindings?status=pending')
            const pendingData = await pendingRes.json()
            if (pendingData.bindings) {
                setRecentBindings(pendingData.bindings.slice(0, 5))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const formatCurrency = (val: number) => {
        if (!val) return '$0'
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
        return `$${val.toFixed(0)}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">儀表板</h1>
                    <p className="text-neutral-400 mt-1">系統即時概況與待辦事項</p>
                </div>
                <Button variant="ghost" size="icon" onClick={loadData} className="text-neutral-400 hover:text-white">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                </div>
            ) : (
                <>
                    {/* 主要指標 */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-neutral-900/50 border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">總用戶數</CardTitle>
                                <Users className="h-4 w-4 text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats?.total_users || 0}</div>
                                <p className="text-xs text-neutral-500 mt-1">已註冊會員</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-neutral-900/50 border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">Pro 會員</CardTitle>
                                <Badge className="bg-white text-black text-xs">PRO</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats?.verified_users || 0}</div>
                                <p className="text-xs text-neutral-500 mt-1">已驗證 OKX 綁定</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-neutral-900/50 border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">待審核</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-400">{stats?.pending_bindings || 0}</div>
                                <p className="text-xs text-neutral-500 mt-1">需要處理</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-neutral-900/50 border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">系統狀態</CardTitle>
                                <Activity className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-400">正常</div>
                                <p className="text-xs text-neutral-500 mt-1">所有服務運行中</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Charts Section */}
                        <div className="col-span-4 space-y-4">
                            {/* Growth Chart */}
                            <Card className="bg-neutral-900/50 border-white/5">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white">用戶增長</CardTitle>
                                            <CardDescription className="text-neutral-400">過去 30 天新增用戶趨勢</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <UserGrowthChart data={chartsData?.userGrowth || []} />
                                </CardContent>
                            </Card>

                            {/* Volume/Revenue Overview */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-neutral-900/50 border-white/5 p-4">
                                    <div className="text-sm text-neutral-400 mb-1">本月總交易量 (預估)</div>
                                    <div className="text-2xl font-bold text-white">{formatCurrency(stats?.total_volume || 0)}</div>
                                </Card>
                                <Card className="bg-neutral-900/50 border-white/5 p-4">
                                    <div className="text-sm text-neutral-400 mb-1">本月總返佣 (預估)</div>
                                    <div className="text-2xl font-bold text-green-400">{formatCurrency(stats?.total_commission || 0)}</div>
                                </Card>
                            </div>

                            {/* Volume Trend Chart */}
                            <Card className="bg-neutral-900/50 border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-white">交易量趨勢</CardTitle>
                                    <CardDescription className="text-neutral-400">過去 7 天交易量與返佣</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <VolumeTrendChart data={chartsData?.volumeTrend || []} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Bindings List */}
                        <Card className="col-span-3 bg-neutral-900/50 border-white/5 h-fit">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">待處理申請</CardTitle>
                                    <CardDescription className="text-neutral-400">最新的 OKX 綁定申請</CardDescription>
                                </div>
                                <Link href="/admin/bindings">
                                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                                        查看全部
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentBindings.length === 0 && (
                                        <p className="text-sm text-neutral-500 text-center py-4">目前沒有待處理的申請 ✓</p>
                                    )}

                                    {recentBindings.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                            <Avatar className="h-9 w-9 ring-1 ring-white/10">
                                                <AvatarImage src={item.user?.picture_url} alt="Avatar" />
                                                <AvatarFallback className="bg-neutral-800 text-neutral-400">U</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none text-white">
                                                    {item.user?.display_name || '未知用戶'}
                                                </p>
                                                <p className="text-xs text-neutral-500 font-mono">
                                                    UID: {item.exchange_uid}
                                                </p>
                                            </div>
                                            <Link href={`/admin/bindings?id=${item.id}`}>
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10">
                                                    審核
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
