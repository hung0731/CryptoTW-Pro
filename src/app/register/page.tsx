'use client'

import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

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

    if (authLoading) return <div className="p-8 text-center"><Skeleton className="h-10 w-full rounded-2xl" /></div>

    return (
        <div className="min-h-screen bg-black p-4 pb-20 text-white">
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400 hover:text-white rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            選擇交易所
                        </h1>
                    </div>
                    <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
                </div>
            </header>

            <div className="max-w-md mx-auto p-4 space-y-6">

                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-2 text-white">解鎖 Pro 會員資格 🔓</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        為了獲取 Pro 級別的市場洞察與空投機會，請註冊我們合作的交易所並綁定 UID。
                        <br /><span className="font-semibold text-white mt-1 inline-block">通過後立即開通權限 🚀</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:gap-6">
                    {loadingExchanges ? (
                        <>
                            <Skeleton className="h-20 w-full rounded-md bg-neutral-900" />
                            <Skeleton className="h-20 w-full rounded-md bg-neutral-900" />
                            <Skeleton className="h-20 w-full rounded-md bg-neutral-900" />
                        </>
                    ) : exchanges.map((ex) => (
                        <Link href={`/register/${ex.slug}`} key={ex.id} className="block w-full">
                            <Card className="flex flex-row w-full gap-0 rounded-md shadow-sm overflow-hidden py-0 border-white/5 bg-neutral-900 cursor-pointer group hover:bg-neutral-800 transition-all">
                                <div className="flex w-16 shrink-0 items-center justify-center bg-neutral-950 text-sm font-medium border-r border-white/5">
                                    {ex.logo_url ? (
                                        <img src={ex.logo_url} alt={ex.name} className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
                                    ) : (
                                        <span className="text-xl text-neutral-500 group-hover:text-white transition-colors">{ex.name[0]}</span>
                                    )}
                                </div>
                                <CardContent className="flex flex-1 items-center justify-between truncate p-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                    <div className="flex-1 truncate px-4 py-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-white transition-colors text-base">{ex.name}</span>
                                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold bg-white/10 text-white border-white/5">
                                                獨家優惠
                                            </Badge>
                                        </div>
                                        <p className="text-neutral-500 text-xs truncate flex items-center gap-1">
                                            推薦碼 <span className="font-mono text-white">{ex.referral_link}</span>
                                        </p>
                                    </div>
                                    <div className="shrink-0 pr-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-neutral-950 text-neutral-400 group-hover:bg-white group-hover:text-black transition-colors">
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
