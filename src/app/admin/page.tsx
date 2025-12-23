'use client'

import React, { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, TrendingUp, Radio, Newspaper, Settings, Activity, Clock, RefreshCw, Loader2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
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
            // Parallel fetch for speed
            const [statsRes, pendingRes] = await Promise.all([
                fetch('/api/admin/stats').then(res => res.json()),
                fetch('/api/admin/bindings?status=pending').then(res => res.json())
            ])

            if (statsRes.stats) setStats(statsRes.stats)
            if (statsRes.charts) setChartsData(statsRes.charts)
            if (pendingRes.bindings) setRecentBindings(pendingRes.bindings.slice(0, 5))

        } catch (e) {
            logger.error('Dashboard load error:', e, { feature: 'admin-dashboard' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    const formatCurrency = (val?: number) => {
        if (!val) return '$0'
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
        return `$${val.toFixed(0)}`
    }

    const cards = [
        { label: '總用戶數', value: stats?.total_users || 0, icon: Users, sub: '已註冊會員', link: '/admin/users' },
        { label: 'Pro 會員', value: stats?.verified_users || 0, icon: TrendingUp, sub: '已綁定 OKX', link: '/admin/users' }, // Verified users implies potential trading
        { label: '待審核綁定', value: stats?.pending_bindings || 0, icon: Clock, sub: '需要處理', color: 'text-yellow-400', link: '/admin/users' },
        { label: '系統狀態', value: '正常', icon: Activity, sub: '所有服務運行中', color: 'text-green-400', link: '/admin/system' },
    ]

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">儀表板 (Dashboard)</h1>
                    <p className="text-neutral-400 mt-1">系統概況與核心指標</p>
                </div>
                <Button variant="ghost" size="icon" onClick={loadData} className="text-neutral-400 hover:text-white">
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((c, i) => (
                    <Link key={i} href={c.link}>
                        <Card className="bg-neutral-900/50 border-white/5 hover:bg-neutral-900 hover:border-white/10 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400 group-hover:text-white transition-colors">{c.label}</CardTitle>
                                <c.icon className={cn("h-4 w-4 text-neutral-500", c.color ? c.color : "group-hover:text-white")} />
                            </CardHeader>
                            <CardContent>
                                <div className={cn("text-2xl font-bold text-white", c.color)}>{c.value}</div>
                                <p className="text-xs text-neutral-500 mt-1">{c.sub}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Charts Area */}
                <div className="col-span-4 space-y-6">
                    <Card className="bg-neutral-900/50 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">用戶增長趨勢</CardTitle>
                            <CardDescription>過去 30 天新增用戶</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserGrowthChart data={chartsData?.userGrowth || []} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-neutral-900/50 border-white/5 p-4 flex flex-col justify-center">
                            <span className="text-sm text-neutral-400">本月交易量 (Est.)</span>
                            <span className="text-2xl font-bold text-white mt-1">{formatCurrency(stats?.total_volume)}</span>
                        </Card>
                        <Card className="bg-neutral-900/50 border-white/5 p-4 flex flex-col justify-center">
                            <span className="text-sm text-neutral-400">本月返佣 (Est.)</span>
                            <span className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats?.total_commission)}</span>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Actions & Quick Links */}
                <div className="col-span-3 space-y-6">
                    {/* Action Required */}
                    <Card className="bg-neutral-900/50 border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", recentBindings.length > 0 ? "bg-yellow-400" : "bg-green-400")}></span>
                                    <span className={cn("relative inline-flex rounded-full h-3 w-3", recentBindings.length > 0 ? "bg-yellow-500" : "bg-green-500")}></span>
                                </span>
                                <CardTitle className="text-white">待處理事項</CardTitle>
                            </div>
                            <Link href="/admin/users"><Button variant="link" className="text-xs text-neutral-400 h-auto p-0 hover:text-white">查看全部</Button></Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentBindings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-neutral-500 space-y-2">
                                        <Clock className="w-8 h-8 opacity-20" />
                                        <p className="text-sm">目前沒有待審核項目</p>
                                    </div>
                                ) : (
                                    recentBindings.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-white/5 last:border-0 pb-3 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white">
                                                    {item.user?.display_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{item.user?.display_name}</p>
                                                    <p className="text-[10px] text-neutral-500 font-mono">UID: {item.exchange_uid}</p>
                                                </div>
                                            </div>
                                            <Link href="/admin/users">
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300">
                                                    Review
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Module Access */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/signals" className="group">
                            <Card className="bg-neutral-900/50 border-white/5 h-full hover:bg-neutral-800 transition-colors">
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                                        <Radio className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-white">市場訊號</span>
                                    <span className="text-[10px] text-neutral-500">Alerts & AI</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/admin/content" className="group">
                            <Card className="bg-neutral-900/50 border-white/5 h-full hover:bg-neutral-800 transition-colors">
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
                                        <Newspaper className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-white">內容管理</span>
                                    <span className="text-[10px] text-neutral-500">Reviews & Push</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/admin/system" className="group">
                            <Card className="bg-neutral-900/50 border-white/5 h-full hover:bg-neutral-800 transition-colors">
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <div className="p-2 rounded-full bg-neutral-500/10 text-neutral-400 group-hover:bg-neutral-500/20 group-hover:scale-110 transition-all">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-white">系統設定</span>
                                    <span className="text-[10px] text-neutral-500">Logs & Config</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/admin/users" className="group">
                            <Card className="bg-neutral-900/50 border-white/5 h-full hover:bg-neutral-800 transition-colors">
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <div className="p-2 rounded-full bg-green-500/10 text-green-400 group-hover:bg-green-500/20 group-hover:scale-110 transition-all">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-white">用戶中心</span>
                                    <span className="text-[10px] text-neutral-500">Members & VIP</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
