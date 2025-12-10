'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, RefreshCw, User, Download, Settings, BarChart } from 'lucide-react'
import Link from 'next/link'

interface BindingRequest {
    id: string
    exchange_name: string
    exchange_uid: string
    created_at: string
    user: {
        id: string
        display_name: string
        picture_url: string
        line_user_id: string
    }
}

export default function AdminPage() {
    const [bindings, setBindings] = useState<BindingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchBindings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/bindings')
            const data = await res.json()
            if (data.bindings) {
                setBindings(data.bindings)
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

    const handleAction = async (id: string, action: 'verify' | 'reject') => {
        setProcessingId(id)
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                body: JSON.stringify({ bindingId: id, action })
            })
            if (res.ok) {
                setBindings(prev => prev.filter(b => b.id !== id))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setProcessingId(null)
        }
    }

    const handleExport = () => {
        window.open('/api/admin/export', '_blank')
    }

    return (
        <div className="min-h-screen bg-black p-4 text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <div className="flex gap-2">
                        <Link href="/admin/analytics">
                            <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                                <BarChart className="h-4 w-4 mr-2" /> Analytics
                            </Button>
                        </Link>
                        <Link href="/admin/settings">
                            <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={handleExport} className="border-white/20 bg-transparent text-white hover:bg-white/10">
                            <Download className="h-4 w-4 mr-2" /> Export CSV
                        </Button>
                        <Button variant="outline" size="icon" onClick={fetchBindings} className="border-white/20 bg-transparent text-white hover:bg-white/10">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {loading && <p className="text-neutral-500">Loading requests...</p>}
                    {!loading && bindings.length === 0 && (
                        <Card className="p-8 text-center text-neutral-500 bg-neutral-900/50 border-white/5">
                            <p>No pending verifications.</p>
                        </Card>
                    )}

                    {bindings.map(binding => (
                        <Card key={binding.id} className="bg-neutral-900/50 border-white/5">
                            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-1 ring-white/10">
                                        <AvatarImage src={binding.user.picture_url} />
                                        <AvatarFallback className="bg-neutral-800 text-neutral-400"><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-white">{binding.user.display_name || 'Unknown User'}</div>
                                        <div className="text-xs text-neutral-500 font-mono">{binding.user.line_user_id}</div>
                                    </div>
                                </div>

                                {/* Request Info */}
                                <div className="flex-1 md:px-8">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="uppercase border-white/20 text-neutral-300">{binding.exchange_name}</Badge>
                                            <span className="font-mono font-bold text-lg text-white">{binding.exchange_uid}</span>
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            Submitted: {new Date(binding.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1 md:flex-none border border-red-900/50 bg-red-950/50 text-red-400 hover:bg-red-900"
                                        disabled={processingId === binding.id}
                                        onClick={() => handleAction(binding.id, 'reject')}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none text-white"
                                        disabled={processingId === binding.id}
                                        onClick={() => handleAction(binding.id, 'verify')}
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Verify
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
