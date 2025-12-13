'use client'

import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { BottomNav } from '@/components/BottomNav'

export default function RegisterPage() {
    const { isLoggedIn, isLoading: authLoading } = useLiff()
    const [exchanges, setExchanges] = useState<any[]>([])
    const [loadingExchanges, setLoadingExchanges] = useState(true)

    useEffect(() => {
        const fetchExchanges = async () => {
            try {
                const res = await fetch('/api/admin/exchanges')
                const data = await res.json()
                if (data.exchanges) {
                    setExchanges(data.exchanges.filter((e: any) => e.is_active))
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingExchanges(false)
            }
        }
        fetchExchanges()
    }, [])

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black p-4">
                <Skeleton className="h-14 w-full rounded-xl mb-4" />
                <Skeleton className="h-24 w-full rounded-xl mb-4" />
                <Skeleton className="h-20 w-full rounded-xl mb-2" />
                <Skeleton className="h-20 w-full rounded-xl mb-2" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            <UnifiedHeader level="secondary" title="交易所綁定" backHref="/profile/bindings" />

            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

                {/* Info Card */}
                <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-5">
                    <h2 className="text-base font-bold mb-2 text-white">解鎖 Pro 會員資格 🔓</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        選擇下方交易所完成註冊綁定，即可立即開通 Pro 會員權限，享受獨家市場洞察與空投機會。
                    </p>
                </div>

                {/* Exchange List */}
                <section>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 px-1">選擇交易所</h3>

                    {loadingExchanges ? (
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full rounded-xl bg-neutral-900" />
                            <Skeleton className="h-20 w-full rounded-xl bg-neutral-900" />
                            <Skeleton className="h-20 w-full rounded-xl bg-neutral-900" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {exchanges.map((ex) => (
                                <Link href={`/register/${ex.slug}`} key={ex.id}>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-white/5 hover:bg-white/5 transition-all group">
                                        {/* Logo */}
                                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-white/10 shrink-0">
                                            {ex.logo_url ? (
                                                <img src={ex.logo_url} alt={ex.name} className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" />
                                            ) : (
                                                <span className="text-xl font-bold text-neutral-500">{ex.name[0]}</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-medium text-white text-sm">{ex.name}</span>
                                                <Badge className="px-1.5 py-0 text-[9px] font-bold bg-green-500/10 text-green-400 border-green-500/20">
                                                    獨家優惠
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-neutral-500 truncate">
                                                推薦碼 <span className="font-mono text-neutral-300">{ex.referral_link}</span>
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Help Text */}
                <div className="bg-neutral-900/30 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        💡 選擇交易所後將引導您完成註冊流程。完成後綁定 UID 即可開通權限。
                    </p>
                </div>

            </div>

            <BottomNav />
        </div>
    )
}
