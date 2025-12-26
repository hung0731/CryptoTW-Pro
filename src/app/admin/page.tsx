'use client'

import React, { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, TrendingUp, Radio, Newspaper, Settings, Activity, Clock, RefreshCw, Loader2, ArrowRight, Database, Zap } from 'lucide-react'
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

    // Sync states
    const [syncingFred, setSyncingFred] = useState(false)
    const [syncingMacro, setSyncingMacro] = useState(false)
    const [syncingSchedule, setSyncingSchedule] = useState(false)
    const [syncResults, setSyncResults] = useState<{ fred?: any; macro?: any; schedule?: any }>({})

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

    const syncFredData = async () => {
        setSyncingFred(true)
        try {
            const res = await fetch('/api/admin/sync-fred', { method: 'POST' })
            const data = await res.json()
            setSyncResults(prev => ({ ...prev, fred: data }))
        } catch (e) {
            setSyncResults(prev => ({ ...prev, fred: { success: false, error: 'Request failed' } }))
        } finally {
            setSyncingFred(false)
        }
    }

    const syncMacroData = async () => {
        setSyncingMacro(true)
        try {
            const res = await fetch('/api/admin/sync-macro', { method: 'POST' })
            const data = await res.json()
            setSyncResults(prev => ({ ...prev, macro: data }))
        } catch (e) {
            setSyncResults(prev => ({ ...prev, macro: { success: false, error: 'Request failed' } }))
        } finally {
            setSyncingMacro(false)
        }
    }

    const syncScheduleData = async () => {
        setSyncingSchedule(true)
        try {
            const res = await fetch('/api/admin/sync-schedule', { method: 'POST' })
            const data = await res.json()
            setSyncResults(prev => ({ ...prev, schedule: data }))
        } catch (e) {
            setSyncResults(prev => ({ ...prev, schedule: { success: false, error: 'Request failed' } }))
        } finally {
            setSyncingSchedule(false)
        }
    }

    const syncAllData = async () => {
        await Promise.all([syncFredData(), syncMacroData(), syncScheduleData()])
    }

    useEffect(() => { void loadData() }, [])

    const formatCurrency = (val?: number) => {
        if (!val) return '$0'
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
        return `$${val.toFixed(0)}`
    }

    const cards = [
        { label: '總用戶數', value: stats?.total_users || 0, icon: Users, sub: '已註冊會員', link: '/admin/users' },
        { label: 'OKX 用戶', value: stats?.okx_users || 0, icon: TrendingUp, sub: '綁定 OKX', link: '/admin/users' },
        { label: 'LBank 用戶', value: stats?.lbank_users || 0, icon: TrendingUp, sub: '綁定 LBank', color: 'text-blue-400', link: '/admin/users' },
        { label: '待審核綁定', value: stats?.pending_bindings || 0, icon: Clock, sub: '需要處理', color: 'text-yellow-400', link: '/admin/users' },
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

            {/* Data Sync Card */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Database className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-white">數據同步中心</CardTitle>
                                <CardDescription>同步經濟指標與市場數據</CardDescription>
                            </div>
                        </div>
                        <Button
                            onClick={syncAllData}
                            disabled={syncingFred || syncingMacro}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {(syncingFred || syncingMacro) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Zap className="h-4 w-4 mr-2" />
                            )}
                            一鍵同步全部
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* FRED Sync */}
                        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-white">FRED 經濟數據</h4>
                                    <p className="text-xs text-neutral-500">CPI, NFP, FOMC, 失業率, PPI</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={syncFredData}
                                    disabled={syncingFred}
                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                >
                                    {syncingFred ? <Loader2 className="h-3 w-3 animate-spin" /> : '同步'}
                                </Button>
                            </div>
                            {syncResults.fred && (
                                <div className={cn(
                                    "text-xs p-2 rounded",
                                    syncResults.fred.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {syncResults.fred.success
                                        ? `✓ CPI: ${syncResults.fred.results?.cpiRecords || 0}, NFP: ${syncResults.fred.results?.nfpRecords || 0}, FOMC: ${syncResults.fred.results?.fomcRecords || 0}, 失業率: ${syncResults.fred.results?.unrateRecords || 0}, PPI: ${syncResults.fred.results?.ppiRecords || 0}`
                                        : `✗ ${syncResults.fred.error}`
                                    }
                                </div>
                            )}
                        </div>

                        {/* Macro/BTC Sync */}
                        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-white">BTC 市場反應</h4>
                                    <p className="text-xs text-neutral-500">事件前後價格走勢 (Binance)</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={syncMacroData}
                                    disabled={syncingMacro}
                                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                >
                                    {syncingMacro ? <Loader2 className="h-3 w-3 animate-spin" /> : '同步'}
                                </Button>
                            </div>
                            {syncResults.macro && (
                                <div className={cn(
                                    "text-xs p-2 rounded",
                                    syncResults.macro.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {syncResults.macro.success
                                        ? `✓ 已處理 ${syncResults.macro.results?.processed || 0} 筆, 跳過 ${syncResults.macro.results?.skipped || 0} 筆`
                                        : `✗ ${syncResults.macro.error}`
                                    }
                                </div>
                            )}
                        </div>

                        {/* Schedule Sync */}
                        <div className="p-4 rounded-lg bg-black/30 border border-white/5 md:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-white">📅 事件日程表</h4>
                                    <p className="text-xs text-neutral-500">自動生成 CPI, NFP, FOMC 未來發布日期</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={syncScheduleData}
                                    disabled={syncingSchedule}
                                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                >
                                    {syncingSchedule ? <Loader2 className="h-3 w-3 animate-spin" /> : '生成日程'}
                                </Button>
                            </div>
                            {syncResults.schedule && (
                                <div className={cn(
                                    "text-xs p-2 rounded",
                                    syncResults.schedule.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {syncResults.schedule.success
                                        ? `✓ CPI: ${syncResults.schedule.results?.cpi || 0}, NFP: ${syncResults.schedule.results?.nfp || 0}, FOMC: ${syncResults.schedule.results?.fomc || 0} (${syncResults.schedule.results?.yearRange})`
                                        : `✗ ${syncResults.schedule.error}`
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
