'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, RefreshCw, User, Download, Settings, BarChart, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface BindingRequest {
    id: string
    exchange_name: string
    exchange_uid: string
    created_at: string
    user: {
        id: string
        line_user_id: string
        display_name: string
        picture_url: string
    }
}

export default function AdminPage() {
    const [bindings, setBindings] = useState<BindingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchBindings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/verify')
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
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">總覽 (Overview)</h1>
                    <p className="text-neutral-400 mt-2">待處理的交易所綁定申請。</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} className="border-white/20 bg-transparent text-white hover:bg-white/10 hidden md:flex">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchBindings} className="border-white/20 bg-transparent text-white hover:bg-white/10">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading && <div className="text-center py-12 text-neutral-500">載入中...</div>}

                {!loading && bindings.length === 0 && (
                    <Card className="bg-neutral-900 border-white/5 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                            <Check className="h-12 w-12 mb-4 opacity-50" />
                            <p>沒有待處理的申請</p>
                        </CardContent>
                    </Card>
                )}

                {bindings.map(binding => (
                    <Card key={binding.id} className="bg-neutral-900 border-white/5">
                        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <Avatar className="h-10 w-10 ring-1 ring-white/10">
                                    <AvatarImage src={binding.user?.picture_url} />
                                    <AvatarFallback className="bg-neutral-800 text-neutral-400"><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-white">{binding.user?.display_name || 'Unknown User'}</div>
                                    <div className="text-xs text-neutral-500 font-mono truncate max-w-[150px]">{binding.user?.line_user_id}</div>
                                </div>
                            </div>

                            {/* Request Info */}
                            <div className="flex-1 md:px-8 w-full">
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
                            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1 md:flex-none border border-red-900/50 bg-red-950/50 text-red-400 hover:bg-red-900"
                                    disabled={processingId === binding.id}
                                    onClick={() => handleAction(binding.id, 'reject')}
                                >
                                    <X className="h-4 w-4 mr-1" /> 拒絕
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none text-white"
                                    disabled={processingId === binding.id}
                                    onClick={() => handleAction(binding.id, 'verify')}
                                >
                                    <Check className="h-4 w-4 mr-1" /> 通過
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
