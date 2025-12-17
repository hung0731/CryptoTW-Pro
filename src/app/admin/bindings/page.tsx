'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, RefreshCw, User, Loader2, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BindingRequest {
    id: string
    exchange_name: string
    exchange_uid: string
    status: string
    rejection_reason: string | null
    deposit_amount: number | null
    created_at: string
    user: {
        id: string
        line_user_id: string
        display_name: string
        picture_url: string
    }
}

export default function BindingsPage() {
    const [bindings, setBindings] = useState<BindingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const { toast } = useToast()

    const fetchBindings = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('status', 'pending')
            if (searchQuery) {
                params.set('query', searchQuery)
            }

            const res = await fetch(`/api/admin/bindings?${params.toString()}`)
            const data = await res.json()
            if (data.bindings) {
                setBindings(data.bindings)
            }
        } catch (e) {
            console.error(e)
            toast({ title: '載入失敗', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchBindings()
    }, [])

    const handleAction = async (id: string, action: 'verify' | 'reject') => {
        const reason = action === 'reject' ? prompt('請輸入拒絕原因（可選）：') : null
        setProcessingId(id)
        try {
            const res = await fetch('/api/admin/bindings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, rejection_reason: reason })
            })
            if (res.ok) {
                toast({ title: action === 'verify' ? '已通過驗證' : '已拒絕申請' })
                setBindings(prev => prev.filter(b => b.id !== id))
            } else {
                toast({ title: '操作失敗', variant: 'destructive' })
            }
        } catch (e) {
            toast({ title: '操作錯誤', variant: 'destructive' })
        } finally {
            setProcessingId(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">OKX 綁定審核</h1>
                    <p className="text-neutral-400 mt-1">審核用戶提交的 OKX UID 綁定申請</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="h-8 px-3 text-sm border-yellow-500/50 text-yellow-400">
                        待審核: {bindings.length}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={fetchBindings} className="text-neutral-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-neutral-900/50 p-4 rounded-lg border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="搜尋 UID..."
                        className="pl-9 bg-neutral-950/50 border-white/10 text-white placeholder:text-neutral-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchBindings()}
                    />
                </div>
                <Button variant="secondary" onClick={fetchBindings}>
                    搜尋
                </Button>
            </div>

            <div className="space-y-3">
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                    </div>
                )}

                {!loading && bindings.length === 0 && (
                    <Card className="bg-neutral-900/50 border-white/5 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="h-12 w-12 mb-4 text-green-500/50" />
                            <p className="text-neutral-400">目前沒有待審核的申請</p>
                            <p className="text-sm text-neutral-600 mt-1">新申請會自動出現在這裡</p>
                        </CardContent>
                    </Card>
                )}

                {bindings.map(binding => (
                    <Card key={binding.id} className="bg-neutral-900/50 border-white/5 hover:bg-neutral-900 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* 用戶資訊 */}
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-1 ring-white/10">
                                        <AvatarImage src={binding.user?.picture_url} />
                                        <AvatarFallback className="bg-neutral-800 text-neutral-400">
                                            <User className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-white">{binding.user?.display_name || '未知用戶'}</div>
                                        <div className="text-xs text-neutral-500 font-mono">{binding.user?.line_user_id?.slice(0, 12)}...</div>
                                    </div>
                                </div>

                                {/* OKX UID */}
                                <div className="flex-1 md:px-6">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white/10 text-white border-0">OKX</Badge>
                                        <span className="font-mono font-bold text-lg text-white">{binding.exchange_uid}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(binding.created_at)}
                                        </span>
                                        {binding.deposit_amount !== null && (
                                            <span>入金: ${binding.deposit_amount}</span>
                                        )}
                                    </div>
                                </div>

                                {/* 操作按鈕 */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        disabled={processingId === binding.id}
                                        onClick={() => handleAction(binding.id, 'reject')}
                                    >
                                        {processingId === binding.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                                        拒絕
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        disabled={processingId === binding.id}
                                        onClick={() => handleAction(binding.id, 'verify')}
                                    >
                                        {processingId === binding.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                        通過
                                    </Button>
                                </div>
                            </div>

                            {binding.rejection_reason && (
                                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-sm text-red-400">
                                        <AlertCircle className="inline w-4 h-4 mr-1" />
                                        {binding.rejection_reason}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
