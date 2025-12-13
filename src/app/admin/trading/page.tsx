'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RefreshCw, User, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react'

interface VerifiedBinding {
    id: string
    exchange_name: string
    exchange_uid: string
    status: string
    monthly_volume: number | null
    accumulated_fee: number | null
    total_commission: number | null
    deposit_amount: number | null
    okx_level: string | null
    last_synced_at: string | null
    created_at: string
    user: {
        id: string
        display_name: string
        picture_url: string
    }
}

export default function TradingDataPage() {
    const [bindings, setBindings] = useState<VerifiedBinding[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [stats, setStats] = useState({
        totalVolume: 0,
        totalCommission: 0,
        totalUsers: 0,
    })

    const fetchBindings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/bindings?status=verified')
            const data = await res.json()
            if (data.bindings) {
                setBindings(data.bindings)

                // Calculate stats
                const totalVolume = data.bindings.reduce((sum: number, b: VerifiedBinding) =>
                    sum + (b.monthly_volume || 0), 0
                )
                const totalCommission = data.bindings.reduce((sum: number, b: VerifiedBinding) =>
                    sum + (b.total_commission || 0), 0
                )

                setStats({
                    totalVolume,
                    totalCommission,
                    totalUsers: data.bindings.length,
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBindings()
    }, [])

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch('/api/cron/okx-sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`
                }
            })
            if (res.ok) {
                // Refresh data after sync
                await fetchBindings()
            }
        } catch (e) {
            console.error('Sync failed:', e)
        } finally {
            setSyncing(false)
        }
    }

    const formatCurrency = (value: number | null) => {
        if (value === null || value === undefined) return '-'
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">交易數據</h1>
                    <p className="text-neutral-400 mt-2">OKX 用戶交易量與返佣追蹤</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={syncing}
                        className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                    >
                        <Zap className={`h-4 w-4 mr-2 ${syncing ? 'animate-pulse' : ''}`} />
                        {syncing ? '同步中...' : '立即同步'}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchBindings}
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-neutral-900 border-white/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <TrendingUp className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">本月總交易量</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalVolume)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-500/10">
                                <DollarSign className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">累計返佣</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommission)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <User className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">已驗證用戶</p>
                                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bindings Table */}
            <Card className="bg-neutral-900 border-white/5">
                <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-white">用戶交易數據</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12 text-neutral-500">載入中...</div>
                    ) : bindings.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            暫無驗證用戶
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-800/50">
                                    <tr className="text-left text-xs text-neutral-400 uppercase">
                                        <th className="p-4">用戶</th>
                                        <th className="p-4">UID</th>
                                        <th className="p-4">等級</th>
                                        <th className="p-4 text-right">當月交易量</th>
                                        <th className="p-4 text-right">累計手續費</th>
                                        <th className="p-4 text-right">累計返佣</th>
                                        <th className="p-4">最後同步</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bindings.map(binding => (
                                        <tr key={binding.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={binding.user?.picture_url} />
                                                        <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">
                                                            {binding.user?.display_name?.[0] || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-white font-medium text-sm">
                                                        {binding.user?.display_name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="uppercase border-white/20 text-neutral-300 text-[10px]">
                                                        {binding.exchange_name}
                                                    </Badge>
                                                    <code className="text-sm font-mono text-neutral-300">{binding.exchange_uid}</code>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {binding.okx_level ? (
                                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                        {binding.okx_level}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-neutral-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-mono text-white">
                                                {formatCurrency(binding.monthly_volume)}
                                            </td>
                                            <td className="p-4 text-right font-mono text-neutral-300">
                                                {formatCurrency(binding.accumulated_fee)}
                                            </td>
                                            <td className="p-4 text-right font-mono text-green-400">
                                                {formatCurrency(binding.total_commission)}
                                            </td>
                                            <td className="p-4 text-xs text-neutral-500">
                                                {binding.last_synced_at ? (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(binding.last_synced_at)}
                                                    </div>
                                                ) : (
                                                    <span className="text-yellow-500">未同步</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
