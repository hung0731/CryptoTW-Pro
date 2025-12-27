'use client'

import React, { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { useLiff } from '@/components/LiffProvider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Link2, RefreshCw, AlertCircle, CheckCircle, XCircle, ChevronRight, Plus } from 'lucide-react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { SingleColumnLayout } from '@/components/layout/PageLayout'
import { SectionHeaderCard } from '@/components/ui/SectionHeaderCard'
import { UniversalCard, CardContent } from '@/components/ui/UniversalCard'
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface Binding {
    id: string
    exchange_name: string
    exchange_uid: string
    status: 'pending' | 'verified' | 'rejected'
    rejection_reason?: string
    created_at: string
}

export default function BindingsPage() {
    const { profile, isLoading: authLoading } = useLiff()
    const [bindings, setBindings] = useState<Binding[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profile?.userId) {
            void fetchBindings(profile.userId)
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
            logger.error('Failed to fetch bindings', e, { feature: 'profile-bindings' })
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black p-4">
                <Skeleton className="h-14 w-full rounded-xl mb-4" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header with Back Button */}
            <UnifiedHeader
                level="secondary"
                title="交易所綁定"
                backHref="/profile"
                leftIcon={<Link2 className="w-4 h-4 text-neutral-400" />}
                rightAction={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { if (profile?.userId) void fetchBindings(profile.userId) }}
                        className="hover:bg-white/10 text-white rounded-full h-8 w-8 p-0"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                }
            />

            <SingleColumnLayout className="max-w-lg py-6 space-y-6">
                {/* Bindings List */}
                <div>
                    <SectionHeaderCard title="已綁定帳戶" className="px-0 mb-3" />

                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full rounded-xl bg-neutral-900" />
                            <Skeleton className="h-16 w-full rounded-xl bg-neutral-900" />
                        </div>
                    ) : bindings.length === 0 ? (
                        <UniversalCard variant="luma" size="L" className="border-dashed border-white/10 flex flex-col items-center text-center gap-3 py-8">
                            <div className="p-3 bg-white/5 rounded-full">
                                <AlertCircle className="h-6 w-6 text-neutral-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-300">尚未綁定任何交易所</p>
                                <p className="text-xs text-neutral-500 mt-1">綁定交易所以解鎖 Pro 會員資格</p>
                            </div>
                            <Link href="/join">
                                <Button size="sm" className="rounded-full bg-white text-black hover:bg-neutral-200 font-bold px-6 h-9 text-xs mt-2">
                                    立即綁定
                                </Button>
                            </Link>
                        </UniversalCard>
                    ) : (
                        <div className="space-y-2">
                            {bindings.map(b => (
                                <UniversalCard key={b.id} variant="luma" size="M" className="p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center border border-white/10 text-xs font-bold uppercase text-neutral-400">
                                            {b.exchange_name.slice(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">{b.exchange_name}</span>
                                                {b.status === 'verified' && (
                                                    <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                                                        <CheckCircle className="w-3 h-3" /> 已驗證
                                                    </span>
                                                )}
                                                {b.status === 'pending' && (
                                                    <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full border border-yellow-500/20">
                                                        <RefreshCw className="w-3 h-3 animate-spin" /> 審核中
                                                    </span>
                                                )}
                                                {b.status === 'rejected' && (
                                                    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
                                                        <XCircle className="w-3 h-3" /> 已拒絕
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-neutral-500 font-mono truncate mt-0.5">
                                                UID: {b.exchange_uid}
                                            </div>
                                            {b.status === 'rejected' && b.rejection_reason && (
                                                <div className="text-[10px] text-red-400 mt-1 bg-red-900/10 px-2 py-1 rounded">
                                                    原因: {b.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {b.status === 'rejected' && (
                                        <Link href="/join">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </UniversalCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add New Binding Button */}
                <Link href="/join" className="block">
                    <Button variant="outline" className="w-full border-dashed border border-[#1A1A1A] bg-transparent py-6 text-[#808080] hover:text-white hover:border-[#2A2A2A] hover:bg-[#0E0E0F] rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        綁定其他交易所
                    </Button>
                </Link>

                {/* Info */}
                <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        💡 綁定交易所可以解鎖 VIP 專屬優惠，享受最高返佣。每個交易所只能綁定一個帳戶。
                    </p>
                </div>
            </SingleColumnLayout>

        </div>
    )
}
