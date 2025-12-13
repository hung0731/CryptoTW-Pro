'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, CreditCard, ArrowUpRight, Activity, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// --- Dashboard Component ---

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [recentBindings, setRecentBindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Stats
                const statsRes = await fetch('/api/admin/stats')
                const statsData = await statsRes.json()
                if (statsData.stats) setStats(statsData.stats)

                // 2. Fetch Recent Pending Bindings (as "Recent Activity")
                const verifyRes = await fetch('/api/admin/verify')
                const verifyData = await verifyRes.json()
                if (verifyData.bindings) {
                    setRecentBindings(verifyData.bindings.slice(0, 5)) // Top 5
                }

            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return <div className="p-8 text-neutral-500">Loading dashboard...</div>
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">總覽 (Dashboard)</h1>
                <p className="text-neutral-400 mt-2">系統即時概況與待辦事項。</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">總用戶數 (Total Users)</CardTitle>
                        <Users className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.total_users || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                            +2.5% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Pro 會員 (Pro Users)</CardTitle>
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">PRO</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.verified_users || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Active subscribers</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">待審核 (Pending)</CardTitle>
                        <CreditCard className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.pending_bindings || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">系統狀態 (System)</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Healthy</div>
                        <p className="text-xs text-neutral-500 mt-1">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Visual Placeholder for Analytics Graph */}
                <Card className="col-span-4 bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">流量趨勢 (Traffic Overview)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-neutral-600 border border-dashed border-neutral-800 rounded-lg">
                            Chart Component Placeholder
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity Feed */}
                <Card className="col-span-3 bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">近期活動 (Recent Activity)</CardTitle>
                        <CardDescription className="text-neutral-400">
                            最新的交易所綁定申請。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentBindings.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">無近期活動</p>}

                            {recentBindings.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9 border border-white/10">
                                        <AvatarImage src={item.user?.picture_url} alt="Avatar" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none text-white">
                                            {item.user?.display_name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            申請綁定 <span className="text-neutral-300 font-bold uppercase">{item.exchange_name}</span>
                                        </p>
                                    </div>
                                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
