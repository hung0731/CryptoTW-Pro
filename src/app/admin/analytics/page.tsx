'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { Loader2, Activity, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalQueries: 0,
        activeUsers: 0,
        errorRate: 0,
        topSymbols: [] as { name: string, count: number }[],
    })

    const supabase = createClient()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch recent events (last 7 days for demo/alpha)
                // Note: For production with millions of rows, use a Materialized View or RPC.
                // For Alpha, client-side aggregation of last ~1000 rows is fine.

                const { data: events, error } = await supabase
                    .from('line_events')
                    .select('user_id, type, metadata, created_at')
                    .order('created_at', { ascending: false })
                    .limit(2000)

                if (error) throw error

                if (!events) return

                // 1. Total Queries (in fetched set)
                const totalQueries = events.length

                // 2. Active Users
                const uniqueUsers = new Set(events.map(e => e.user_id)).size

                // 3. Error Rate
                const errorCount = events.filter(e => e.type === 'error' || (e.metadata && !e.metadata.success)).length
                const errorRate = totalQueries > 0 ? ((errorCount / totalQueries) * 100).toFixed(1) : 0

                // 4. Top Symbols (Parse metadata)
                const symbolCounts: Record<string, number> = {}
                events.forEach(e => {
                    const meta = e.metadata as any
                    if (meta?.symbol) {
                        const sym = meta.symbol.toUpperCase()
                        symbolCounts[sym] = (symbolCounts[sym] || 0) + 1
                    }
                })

                const sortedSymbols = Object.entries(symbolCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                setStats({
                    totalQueries,
                    activeUsers: uniqueUsers,
                    errorRate: Number(errorRate),
                    topSymbols: sortedSymbols
                })

            } catch (e) {
                logger.error('Failed to fetch analytics:', e, { feature: 'admin-analytics' })
            } finally {
                setIsLoading(false)
            }
        }

        void fetchStats()
    }, [supabase])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                機器人數據分析 (Bot Analytics)
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">總互動次數 (Total Interactions)</CardTitle>
                        <Activity className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQueries}</div>
                        <p className="text-xs text-neutral-500">近 7 日數據</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">活躍用戶數 (Unique Users)</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeUsers}</div>
                        <p className="text-xs text-neutral-500">不重複 ID 統計</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">錯誤率 (Error Rate)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.errorRate}%</div>
                        <p className="text-xs text-neutral-500">互動失敗比例</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            熱門查詢幣種 (Top Symbols)
                        </CardTitle>
                        <CardDescription>用戶最常關注的加密貨幣</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topSymbols}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="#EAB308" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
