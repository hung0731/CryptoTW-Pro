'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Crown, CheckCircle, XCircle, MessageCircle, Phone, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface VipApp {
    id: string
    name: string
    contact_method: string
    contact_handle: string
    asset_tier: string
    trading_volume_monthly: string | null
    preferred_exchange: string | null
    notes: string | null
    status: 'new' | 'contacted' | 'approved' | 'rejected'
    created_at: string
}

export default function AdminVipPage() {
    const [apps, setApps] = useState<VipApp[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/vip')
            .then(res => res.json())
            .then(data => {
                if (data.applications) setApps(data.applications)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge className="bg-blue-500">New</Badge>
            case 'contacted': return <Badge className="bg-yellow-500">Contacted</Badge>
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>
            case 'rejected': return <Badge className="bg-red-500">Rejected</Badge>
            default: return <Badge className="bg-slate-500">{status}</Badge>
        }
    }

    const getContactIcon = (method: string) => {
        switch (method) {
            case 'line': return <div className="p-1 bg-[#06C755]/10 text-[#06C755] rounded"><MessageCircle size={16} /></div>
            case 'telegram': return <div className="p-1 bg-[#229ED9]/10 text-[#229ED9] rounded"><MessageCircle size={16} /></div>
            default: return <div className="p-1 bg-slate-100 text-slate-500 rounded"><Phone size={16} /></div>
        }
    }

    return (
        <div className="container py-10 px-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Crown className="text-amber-500" /> Alpha Prime Applications
                    </h1>
                    <p className="text-muted-foreground mt-1">High Net Worth Client Management (PWM)</p>
                </div>
                <Link href="/admin">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Pipeline</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{apps.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Pending Review</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-600">{apps.filter(a => a.status === 'new').length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Whales (&gt;1M)</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-amber-600">{apps.filter(a => a.asset_tier === '>1M').length}</div></CardContent>
                    </Card>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-10 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : apps.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            No applications yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Client</th>
                                        <th className="px-6 py-3">Contact</th>
                                        <th className="px-6 py-3">Tier (AUM)</th>
                                        <th className="px-6 py-3">Exchange</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {apps.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {app.name}
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{new Date(app.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getContactIcon(app.contact_method)}
                                                    <span className="font-mono text-slate-600">{app.contact_handle}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={`
                                                    ${app.asset_tier === '>1M' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                        app.asset_tier === '>200k' ? 'bg-slate-100 text-slate-700' : 'text-slate-500'}
                                                `}>
                                                    {app.asset_tier}
                                                </Badge>
                                                {app.trading_volume_monthly && (
                                                    <div className="text-xs text-slate-400 mt-1">Vol: {app.trading_volume_monthly}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {app.preferred_exchange || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(app.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <RefreshCw className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
