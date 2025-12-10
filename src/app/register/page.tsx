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
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-white/50 rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            選擇交易所 ⚡️
                        </h1>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-2">解鎖 Alpha 會員資格 🔓</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        為了獲取 Pro 級別的市場洞察與空投機會，請註冊我們合作的交易所並綁定 UID。
                        <br /><span className="font-semibold text-primary mt-1 inline-block">通過後立即開通權限 🚀</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:gap-6">
                    {loadingExchanges ? (
                        <>
                            <Skeleton className="h-20 w-full rounded-md" />
                            <Skeleton className="h-20 w-full rounded-md" />
                            <Skeleton className="h-20 w-full rounded-md" />
                        </>
                    ) : exchanges.map((ex) => (
                        <Link href={`/register/${ex.slug}`} key={ex.id} className="block w-full">
                            <Card className="flex flex-row w-full gap-0 rounded-md shadow-sm overflow-hidden py-0 border-slate-200 cursor-pointer group hover:shadow-md transition-all">
                                <div className="flex w-16 shrink-0 items-center justify-center bg-slate-50 text-sm font-medium border-r border-slate-100">
                                    {ex.logo_url ? (
                                        <img src={ex.logo_url} alt={ex.name} className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
                                    ) : (
                                        <span className="text-xl text-slate-300 group-hover:text-primary transition-colors">{ex.name[0]}</span>
                                    )}
                                </div>
                                <CardContent className="flex flex-1 items-center justify-between truncate p-0 bg-white">
                                    <div className="flex-1 truncate px-4 py-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-900 group-hover:text-primary transition-colors text-base">{ex.name}</span>
                                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold bg-primary/5 text-primary border-primary/10">
                                                獨家優惠
                                            </Badge>
                                        </div>
                                        <p className="text-slate-500 text-xs truncate flex items-center gap-1">
                                            推薦碼 <span className="font-mono text-slate-900">{ex.referral_link}</span>
                                        </p>
                                    </div>
                                    <div className="shrink-0 pr-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white" />
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
