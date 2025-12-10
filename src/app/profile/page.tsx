'use client'

import React, { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { User, LogOut, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

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

    const handleToggle = async (key: string) => {
        if (!dbUser || !profile) return

        const currentSettings = dbUser.notification_preferences || {
            market_signals: true,
            airdrops: true,
            news: true
        }

        const newSettings = {
            ...currentSettings,
            [key]: !currentSettings[key as keyof typeof currentSettings]
        }

        // Optimistic update (need to update local dbUser state ideally, but simpler to just call API)
        // For now, we rely on re-fetching or handling local state if we had a setDbUser
        // Since we don't expose setDbUser from useLiff, we might just call API and force reload or just wait for next fetch
        // To make UI responsive, we really should have local state or update the context.
        // Let's assume we trigger an update via API and maybe reload.

        try {
            await fetch('/api/user/settings', {
                method: 'POST',
                body: JSON.stringify({
                    lineUserId: profile.userId,
                    settings: newSettings
                })
            })
            // Force reload to reflect changes for now since we don't have setDbUser in context
            window.location.reload()
        } catch (e) {
            console.error(e)
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
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
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
                    <Card className="relative bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-slate-100/50" />
                        <CardContent className="pt-12 flex flex-col items-center relative z-10">
                            <Avatar className="h-24 w-24 mb-4 ring-4 ring-white shadow-sm bg-white">
                                <AvatarImage src={profile?.pictureUrl} />
                                <AvatarFallback><User className="h-10 w-10 text-slate-300" /></AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.displayName}</h2>
                            <div className="mt-2 flex items-center gap-2">
                                {dbUser?.membership_status === 'pro' ? (
                                    <Badge className="bg-primary text-primary-foreground border-0 shadow-sm px-3 py-1 text-sm bg-primary hover:bg-primary/90">Alpha 指揮官 💎</Badge>
                                ) : dbUser?.membership_status === 'pending' ? (
                                    <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50">審核中 ⏳</Badge>
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
                            <Skeleton className="h-20 w-full rounded-md" />
                            <Skeleton className="h-20 w-full rounded-md" />
                        </div>
                    ) : bindings.length === 0 ? (
                        <Card className="border-2 border-dashed bg-white border-slate-200 shadow-none">
                            <CardContent className="py-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-50 rounded-full">
                                    <AlertCircle className="h-8 w-8 text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-medium">尚未綁定任何交易所</p>
                                    <p className="text-xs mt-1">綁定交易所即可解鎖 Alpha 權限</p>
                                </div>
                                <Link href="/register">
                                    <Button size="sm" className="rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800">立即綁定</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5">
                            {bindings.map(b => (
                                <Card key={b.id} className="flex flex-row w-full gap-0 rounded-md shadow-sm overflow-hidden py-0 border-slate-200">
                                    <div className="flex w-16 shrink-0 items-center justify-center bg-slate-50 text-sm font-medium border-r border-slate-100 uppercase text-slate-500">
                                        {b.exchange_name.slice(0, 3)}
                                    </div>
                                    <CardContent className="flex flex-1 items-center justify-between truncate p-0 bg-white">
                                        <div className="flex-1 truncate px-4 py-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-slate-900 text-base">{b.exchange_name}</span>
                                                <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">UID: {b.exchange_uid}</span>
                                            </div>
                                            {b.status === 'rejected' ? (
                                                <p className="text-xs text-red-500 truncate font-medium">
                                                    驗證失敗: {b.rejection_reason || '請重新檢查'}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-500 truncate">
                                                    提交於 {new Date(b.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="shrink-0 pr-4">
                                            {b.status === 'verified' && (
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                            {b.status === 'pending' && (
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 animate-pulse">
                                                    <RefreshCw className="h-4 w-4" />
                                                </div>
                                            )}
                                            {b.status === 'rejected' && (
                                                <Link href={`/register/${b.exchange_name}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                                                        <ChevronRight className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Add Exchange Button */}
                    {bindings.length > 0 && (
                        <Link href="/register">
                            <Button variant="outline" className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                                + 綁定其他交易所
                            </Button>
                        </Link>
                    )}

                    {/* Notification Settings */}
                    <div className="pt-6">
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">推播設定 🔔</h3>
                        <Card className="border border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-0 divide-y divide-slate-100">
                                <NotificationToggle
                                    label="關鍵交易信號"
                                    desc="接收高勝率買賣點位通知"
                                    checked={dbUser?.notification_preferences?.market_signals ?? true}
                                    onToggle={() => handleToggle('market_signals')}
                                />
                                <NotificationToggle
                                    label="精選空投機會"
                                    desc="即時獲取代幣空投活動資訊"
                                    checked={dbUser?.notification_preferences?.airdrops ?? true}
                                    onToggle={() => handleToggle('airdrops')}
                                />
                                <NotificationToggle
                                    label="市場快訊"
                                    desc="每日重點新聞與市場動向"
                                    checked={dbUser?.notification_preferences?.news ?? true}
                                    onToggle={() => handleToggle('news')}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NotificationToggle({ label, desc, checked, onToggle }: { label: string, desc: string, checked: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="space-y-0.5">
                <div className="font-medium text-slate-900">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <div
                onClick={onToggle}
                className={`w-11 h-6 rounded-full flex items-center transition-colors cursor-pointer px-0.5 ${checked ? 'bg-primary' : 'bg-slate-300'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-[20px]' : ''}`} />
            </div>
        </div>
    )
}
