'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ExchangeStats {
    total_bindings: number
    verified: number
    clicks: number
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Record<string, ExchangeStats>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/analytics')
                const data = await res.json()
                if (data.stats) setStats(data.stats)
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Sorting: Most verified first
    const sortedExchanges = Object.entries(stats).sort(([, a], [, b]) => b.verified - a.verified)

    // Calculate Totals
    const totalBindings = Object.values(stats).reduce((acc, curr) => acc + curr.total_bindings, 0)
    const totalVerified = Object.values(stats).reduce((acc, curr) => acc + curr.verified, 0)
    const totalClicks = Object.values(stats).reduce((acc, curr) => acc + curr.clicks, 0)

    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">數據分析 (Analytics)</h1>
                <p className="text-neutral-400 mt-2">查看交易所活動成效與用戶增長。</p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">總綁定數 (Total Bindings)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalBindings}</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">已驗證 (Verified)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{totalVerified}</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">點擊成效 (Clicks)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{totalClicks}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown Table */}
            <Card className="bg-neutral-900 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white">交易所成效 (Breakdown)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-neutral-900">
                                <TableHead className="text-neutral-400">交易所 (Exchange)</TableHead>
                                <TableHead className="text-right text-neutral-400">總申請 (Total)</TableHead>
                                <TableHead className="text-right text-neutral-400">已驗證 (Verified)</TableHead>
                                <TableHead className="text-right text-neutral-400">點擊 (Clicks)</TableHead>
                                <TableHead className="text-right text-neutral-400">轉換率 (Conv.)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-neutral-500">
                                        載入中...
                                    </TableCell>
                                </TableRow>
                            ) : sortedExchanges.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-neutral-500">
                                        尚無數據
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedExchanges.map(([name, stat]) => {
                                    const conversion = stat.total_bindings > 0
                                        ? Math.round((stat.verified / stat.total_bindings) * 100)
                                        : 0

                                    return (
                                        <TableRow key={name} className="border-white/5 hover:bg-neutral-800/50">
                                            <TableCell className="font-medium uppercase">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-white/20 text-neutral-300">{name}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-neutral-300">{stat.total_bindings}</TableCell>
                                            <TableCell className="text-right font-mono text-green-500 font-bold">{stat.verified}</TableCell>
                                            <TableCell className="text-right font-mono text-blue-500 font-bold">{stat.clicks}</TableCell>
                                            <TableCell className="text-right font-mono text-neutral-500">{conversion}%</TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
