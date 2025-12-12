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
import { BottomNav } from '@/components/BottomNav'

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

        try {
            await fetch('/api/user/settings', {
                method: 'POST',
                body: JSON.stringify({
                    lineUserId: profile.userId,
                    settings: newSettings
                })
            })
            // Force reload to reflect changes for now
            window.location.reload()
        } catch (e) {
            console.error(e)
        }
    }

    if (authLoading) return <div className="p-8"><Skeleton className="h-20 w-full rounded-2xl" /></div>

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black p-4 flex items-center justify-center">
                <Card className="text-center p-8 bg-neutral-900 border-white/5 border shadow-lg">
                    <div className="bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="mb-6 text-neutral-400 font-medium">請登入以查看個人檔案。</p>
                    <Link href="/">
                        <Button className="w-full rounded-full bg-white text-black hover:bg-neutral-200">回到首頁</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black p-4 pb-24 text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 -mx-4 -mt-4 mb-4">
                <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto w-full">
                    <div className="flex items-center justify-start">
                        {/* Empty left slot for unification */}
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="Logo" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        {/* Right Slot */}
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto space-y-6">

                {/* Profile Section */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Identity</h2>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
                        <Avatar className="h-16 w-16 ring-2 ring-white/10 shadow-lg">
                            <AvatarImage src={profile?.pictureUrl} />
                            <AvatarFallback><User className="h-8 w-8 text-neutral-500" /></AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-white tracking-tight">{profile?.displayName}</h2>
                            <div className="flex items-center gap-2">
                                {dbUser?.membership_status === 'pro' ? (
                                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md transition-colors px-2 py-0.5 text-xs">
                                        💎 PRO COMMANDER
                                    </Badge>
                                ) : dbUser?.membership_status === 'pending' ? (
                                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs">
                                        ⏳ VERIFYING
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 border border-white/5 px-2 py-0.5 text-xs">
                                        🌱 EXPLORER
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Exchange Bindings</h3>
                        <Button variant="ghost" size="sm" onClick={() => profile?.userId && fetchBindings(profile.userId)} className="hover:bg-white/10 text-white rounded-full h-6 w-6 p-0">
                            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full rounded-lg bg-neutral-900" />
                            <Skeleton className="h-12 w-full rounded-lg bg-neutral-900" />
                        </div>
                    ) : bindings.length === 0 ? (
                        <div className="border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-white/5 rounded-full">
                                <AlertCircle className="h-5 w-5 text-neutral-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-300">No Exchange Bound</p>
                                <p className="text-[10px] text-neutral-500 mt-1">Bind an exchange to unlock Pro access.</p>
                            </div>
                            <Link href="/register">
                                <Button size="sm" className="rounded-full bg-white text-black hover:bg-neutral-200 font-bold px-6 h-8 text-xs mt-2">
                                    Bind Now
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {bindings.map(b => (
                                <div key={b.id} className="group flex items-center justify-between p-3 rounded-lg bg-neutral-900/40 border border-white/5 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/10 text-[10px] font-bold uppercase text-neutral-500">
                                            {b.exchange_name.slice(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">{b.exchange_name}</span>
                                                {b.status === 'verified' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                {b.status === 'pending' && <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />}
                                                {b.status === 'rejected' && <XCircle className="w-3 h-3 text-red-500" />}
                                            </div>
                                            <div className="text-[10px] text-neutral-500 font-mono truncate">
                                                UID: {b.exchange_uid}
                                            </div>
                                        </div>
                                    </div>

                                    {b.status === 'rejected' && (
                                        <Link href={`/register/${b.exchange_name}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Exchange Button */}
                    {bindings.length > 0 && (
                        <Link href="/register">
                            <Button variant="outline" className="w-full border-dashed border border-white/10 bg-transparent py-6 text-neutral-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
                                + 綁定其他交易所
                            </Button>
                        </Link>
                    )}

                    {/* Notification Settings */}
                    <div className="pt-6">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">Preferences</h3>
                        <Card className="border border-white/5 shadow-sm bg-neutral-900">
                            <CardContent className="p-0 divide-y divide-white/5">
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
            <BottomNav />
        </div>
    )
}

function NotificationToggle({ label, desc, checked, onToggle }: { label: string, desc: string, checked: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="space-y-0.5">
                <div className="font-medium text-white">{label}</div>
                <div className="text-xs text-neutral-500">{desc}</div>
            </div>
            <div
                onClick={onToggle}
                className={`w-11 h-6 rounded-full flex items-center transition-colors cursor-pointer px-0.5 ${checked ? 'bg-white' : 'bg-neutral-700'}`}
            >
                <div className={`w-5 h-5 bg-black rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-[20px]' : ''}`} />
            </div>
        </div>
    )
}
