'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Check, X, Search, Trash2 } from 'lucide-react'

interface VipApp {
    id: string
    user_id: string
    full_name: string
    phone: string
    email: string
    exchange_name: string
    exchange_uid: string
    asset_volume: string
    telegram_id: string
    status: 'new' | 'contacted' | 'approved' | 'rejected'
    created_at: string
    user?: {
        picture_url: string
        display_name: string
    }
}

export default function AdminVipPage() {
    const [apps, setApps] = useState<VipApp[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    })

    const fetchApplications = useCallback(() => {
        setLoading(true)
        fetch('/api/admin/vip')
            .then(res => res.json())
            .then(data => {
                if (data.applications) {
                    const applications: VipApp[] = data.applications
                    setApps(applications)

                    // Calculate stats
                    setStats({
                        total: applications.length,
                        pending: applications.filter(a => a.status === 'new').length,
                        approved: applications.filter(a => a.status === 'approved').length,
                        rejected: applications.filter(a => a.status === 'rejected').length
                    })
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchApplications()
    }, [fetchApplications])

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this application?`)) return

        setProcessingId(id);
        try {
            const response = await fetch(`/api/admin/vip/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
            });
            if (response.ok) {
                fetchApplications(); // Refresh the list
            } else {
                console.error('Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">VIP 申請管理</h1>
                    <p className="text-neutral-400 mt-2">管理與審核所有 VIP 資格申請。總計申請數: {stats.total}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">待審核</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">已核准</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">已拒絕</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-neutral-900 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white">申請列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/5">
                        <Table>
                            <TableHeader className="bg-neutral-900">
                                <TableRow className="border-white/5 hover:bg-neutral-900">
                                    <TableHead className="text-neutral-400">用戶</TableHead>
                                    <TableHead className="text-neutral-400">交易所資訊</TableHead>
                                    <TableHead className="text-neutral-400">資產規模</TableHead>
                                    <TableHead className="text-neutral-400">聯絡方式</TableHead>
                                    <TableHead className="text-neutral-400">狀態</TableHead>
                                    <TableHead className="text-neutral-400 text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-neutral-500">
                                            載入中 (Loading)...
                                        </TableCell>
                                    </TableRow>
                                ) : apps.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-neutral-500">
                                            目前沒有待審核的申請
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    apps.map((app) => (
                                        <TableRow key={app.id} className="border-white/5 hover:bg-neutral-800/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={app.user?.picture_url} />
                                                        <AvatarFallback className="bg-neutral-800 text-neutral-500">
                                                            {app.full_name?.[0] || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid gap-0.5">
                                                        <span className="font-medium text-white">{app.full_name}</span>
                                                        <span className="text-xs text-neutral-500">{app.user?.display_name}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="grid gap-0.5">
                                                    <span className="text-neutral-300">{app.exchange_name}</span>
                                                    <span className="text-xs text-neutral-500 font-mono">UID: {app.exchange_uid}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
                                                    {app.asset_volume}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="grid gap-0.5 text-sm">
                                                    <span className="text-neutral-400">Line: pending</span>
                                                    <span className="text-neutral-400">TG: {app.telegram_id}</span>
                                                    <span className="text-neutral-500 text-xs">{app.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`
                                                    ${app.status === 'new' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' :
                                                        app.status === 'approved' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                                                            app.status === 'rejected' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' :
                                                                'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}
                                                `}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                {app.status === 'new' ? (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                                            onClick={() => handleAction(app.id, 'approve')}
                                                            disabled={processingId === app.id}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                            onClick={() => handleAction(app.id, 'reject')}
                                                            disabled={processingId === app.id}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-neutral-600 italic">已處理</span>
                                                )}

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-neutral-500 hover:text-red-500 hover:bg-red-500/10"
                                                    onClick={async () => {
                                                        if (!confirm('Are you sure you want to DELETE this application history?')) return
                                                        try {
                                                            const res = await fetch(`/api/admin/vip?id=${app.id}`, { method: 'DELETE' })
                                                            if (res.ok) fetchApplications()
                                                        } catch (e) { console.error(e) }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
