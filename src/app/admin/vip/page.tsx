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
            default: return <div className="p-1 bg-neutral-900 text-neutral-400 rounded"><Phone size={16} /></div>
        }
    }

    // New function for handling actions
    const handleAction = async (id: string, action: 'approve' | 'reject') => {
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
        <div className="min-h-screen bg-black p-4 text-white">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">VIP Applications</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchApplications} className="border-white/20 bg-transparent text-white hover:bg-white/10">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-neutral-900 border-white/5">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-neutral-400">Total Applications</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-white">{stats.total}</div></CardContent>
                    </Card>
                    <Card className="bg-neutral-900 border-white/5">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-neutral-400">Pending Review</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-amber-500">{stats.pending}</div></CardContent>
                    </Card>
                    <Card className="bg-neutral-900 border-white/5">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-neutral-400">Approved (VIP)</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-500">{stats.approved}</div></CardContent>
                    </Card>
                    <Card className="bg-neutral-900 border-white/5">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-neutral-400">Whales (&gt;1M)</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-purple-500">{stats.whales}</div></CardContent>
                    </Card>
                </div>

                <div className="grid gap-4">
                    {loading && <p className="text-neutral-500">Loading applications...</p>}
                    {!loading && apps.length === 0 && (
                        <Card className="p-12 text-center text-neutral-500 bg-neutral-900/50 border-white/5 border-dashed">
                            <div className="flex flex-col items-center gap-2">
                                <Users className="h-12 w-12 opacity-20" />
                                <p>No VIP applications found.</p>
                            </div>
                        </Card>
                    )}

                    {apps.map(app => (
                        <Card key={app.id} className="bg-neutral-900 border-white/5 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: User Info */}
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 ring-2 ring-white/10">
                                                    <AvatarImage src={app.user?.picture_url} />
                                                    <AvatarFallback className="bg-neutral-800 text-neutral-400">VIP</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-lg text-white">{app.full_name}</div>
                                                    <div className="text-sm text-neutral-400 flex items-center gap-2">
                                                        <span className="font-mono">{app.phone}</span>
                                                        <span>•</span>
                                                        <span>{app.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}
                                                className={`uppercase tracking-wider font-bold ${app.status === 'approved' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                                                        app.status === 'rejected' ? 'bg-red-950/50 text-red-500 hover:bg-red-900/50' :
                                                            'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                                    }`}
                                            >
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                            <div>
                                                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Exchange</div>
                                                <div className="font-medium text-white">{app.exchange_name || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">UID</div>
                                                <div className="font-mono font-medium text-white">{app.exchange_uid || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Asset Volume</div>
                                                <div className="font-medium text-white text-lg">{app.asset_volume}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Telegram</div>
                                                <div className="font-medium text-blue-400">{app.telegram_id}</div>
                                            </div>
                                        </div>

                                        <div className="text-sm text-neutral-400">
                                            <span className="text-neutral-600 mr-2">Submitted:</span>
                                            {new Date(app.created_at).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="p-6 bg-neutral-950/50 flex flex-col justify-center gap-3 border-l border-white/5 min-w-[200px]">
                                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 text-center">Admin Actions</div>

                                        {app.status === 'new' && ( // Changed from 'pending' to 'new' to match existing status types
                                            <>
                                                <Button
                                                    className="w-full bg-white text-black hover:bg-neutral-200 font-bold"
                                                    disabled={processingId === app.id}
                                                    onClick={() => handleAction(app.id, 'approve')}
                                                >
                                                    <Check className="h-4 w-4 mr-2" /> Approve VIP
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400"
                                                    disabled={processingId === app.id}
                                                    onClick={() => handleAction(app.id, 'reject')}
                                                >
                                                    <X className="h-4 w-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}

                                        {app.status !== 'new' && ( // Changed from 'pending' to 'new'
                                            <div className="text-center text-sm text-neutral-500 py-2 italic">
                                                processed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
```
