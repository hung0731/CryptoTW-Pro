'use client'

import React, { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowLeft, User, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Binding {
    id: string
    exchange_name: string
    exchange_uid: string
    status: 'pending' | 'verified' | 'rejected'
    rejection_reason?: string
    created_at: string
}

export default function ProfilePage() {
    const { isLoggedIn, profile, dbUser, isLoading: authLoading } = useLiff()
    const [bindings, setBindings] = useState<Binding[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profile?.userId) {
            fetchBindings(profile.userId)
        }
    }, [profile])

    const fetchBindings = async (lineUserId: string) => {
        setLoading(true)
        try {
            const res = await fetch('/api/user/bindings', {
                method: 'POST',
                body: JSON.stringify({ lineUserId })
            })
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

    if (authLoading) return <div className="p-8"><Skeleton className="h-20 w-full rounded-2xl" /></div>

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 flex items-center justify-center">
                <Card className="text-center p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="mb-6 text-slate-600 font-medium">請登入以查看個人檔案。</p>
                    <Link href="/">
                        <Button className="w-full rounded-xl">回到首頁</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-white/50 rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <h1 className="text-xl font-bold">個人檔案 👤</h1>
                </div>

                {/* Profile Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-xl transform scale-95" />
                    <Card className="relative bg-white/80 backdrop-blur-xl border-white/50 shadow-lg overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-100 to-slate-200/50" />
                        <CardContent className="pt-12 flex flex-col items-center relative z-10">
                            <Avatar className="h-24 w-24 mb-4 ring-4 ring-white shadow-md">
                                <AvatarImage src={profile?.pictureUrl} />
                                <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.displayName}</h2>
                            <div className="mt-2 flex items-center gap-2">
                                {dbUser?.membership_status === 'pro' ? (
                                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 border-0 shadow-sm px-3 py-1 text-sm">Alpha 指揮官 💎</Badge>
                                ) : dbUser?.membership_status === 'pending' ? (
                                    <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-50">審核中 ⏳</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">探索者 🌱</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bindings List */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold text-lg flex items-center gap-2">綁定狀態 🔗</h3>
                        <Button variant="ghost" size="sm" onClick={() => profile?.userId && fetchBindings(profile.userId)} className="hover:bg-white/50 rounded-full">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full rounded-2xl" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    ) : bindings.length === 0 ? (
                        <Card className="border-2 border-dashed bg-white/50 border-slate-200">
                            <CardContent className="py-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-100 rounded-full">
                                    <AlertCircle className="h-8 w-8 text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-medium">尚未綁定任何交易所</p>
                                    <p className="text-xs mt-1">綁定交易所即可解鎖 Alpha 權限</p>
                                </div>
                                <Link href="/register">
                                    <Button size="sm" className="rounded-full px-6">立即綁定</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        bindings.map(b => (
                            <Card key={b.id} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white/90 group">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="uppercase font-bold bg-slate-50 border-slate-200 text-slate-700 tracking-wider">
                                                    {b.exchange_name}
                                                </Badge>
                                                <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                    {b.exchange_uid}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-wide">
                                                提交於 {new Date(b.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            {b.status === 'verified' && (
                                                <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                            {b.status === 'pending' && (
                                                <div className="bg-orange-100 text-orange-600 p-1.5 rounded-full animate-pulse">
                                                    <RefreshCw className="h-5 w-5" />
                                                </div>
                                            )}
                                            {b.status === 'rejected' && (
                                                <div className="bg-red-100 text-red-600 p-1.5 rounded-full">
                                                    <XCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {b.status === 'rejected' && (
                                        <div className="mt-4 bg-red-50 p-3 rounded-lg text-xs text-red-600 border border-red-100 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-bold block mb-1">驗證失敗</span>
                                                原因: {b.rejection_reason || '資訊不正確。'}
                                                <Link href={`/register/${b.exchange_name}`} className="underline font-bold mt-2 block hover:text-red-800">
                                                    更新資訊 →
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}

                    {/* Add Exchange Button */}
                    {bindings.length > 0 && (
                        <Link href="/register">
                            <Button variant="outline" className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                                + 綁定其他交易所
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
