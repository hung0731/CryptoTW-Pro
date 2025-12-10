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
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Partner Analytics</h1>

                {/* Overview Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Bindings</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{totalBindings}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Verified</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{totalVerified}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-600">{totalClicks}</div></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Exchange Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-40 w-full" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Exchange</TableHead>
                                        <TableHead className="text-right">Bindings</TableHead>
                                        <TableHead className="text-right">Verified Accounts</TableHead>
                                        <TableHead className="text-right">Engagement (Clicks)</TableHead>
                                        <TableHead className="text-right">Conversion Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedExchanges.map(([name, stat]) => {
                                        const conversion = stat.total_bindings > 0
                                            ? Math.round((stat.verified / stat.total_bindings) * 100)
                                            : 0

                                        return (
                                            <TableRow key={name}>
                                                <TableCell className="font-medium uppercase">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{name}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">{stat.total_bindings}</TableCell>
                                                <TableCell className="text-right font-mono text-green-600 font-bold">{stat.verified}</TableCell>
                                                <TableCell className="text-right font-mono text-blue-600 font-bold">{stat.clicks}</TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">{conversion}%</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
