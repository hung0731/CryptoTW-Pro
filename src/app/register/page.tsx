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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 pb-20">
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

                <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-2">解鎖 Alpha 會員資格 🔓</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        為了獲取 Pro 級別的市場洞察與空投機會，請註冊我們合作的交易所並綁定 UID。
                        <br /><span className="font-semibold text-primary mt-1 inline-block">通過後立即開通權限 🚀</span>
                    </p>
                </div>

                <div className="grid gap-4">
                    {loadingExchanges ? (
                        <>
                            <Skeleton className="h-28 w-full rounded-2xl" />
                            <Skeleton className="h-28 w-full rounded-2xl" />
                            <Skeleton className="h-28 w-full rounded-2xl" />
                        </>
                    ) : exchanges.map((ex) => (
                        <Card key={ex.id} className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md group bg-white/80">
                            <Link href={`/register/${ex.slug}`} className="block h-full">
                                <CardContent className="p-0 flex items-stretch h-28">
                                    {/* Logo/Brand Area */}
                                    <div className={`w-28 flex items-center justify-center font-bold text-lg bg-slate-900 text-white relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                        {ex.logo_url ? (
                                            <img src={ex.logo_url} alt={ex.name} className="h-12 w-12 object-contain relative z-10 transform group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <span className="text-2xl relative z-10">{ex.name[0]}</span>
                                        )}
                                    </div>

                                    {/* Info Area */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg">{ex.name}</h3>
                                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-yellow-100 text-yellow-700 border-yellow-200">
                                                獨家優惠 🎁
                                            </Badge>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="text-sm text-slate-500 font-medium">
                                                <span className="block text-xs text-slate-400 mb-0.5">推薦碼:</span>
                                                <span className="text-primary truncate block w-40">{ex.referral_link}</span>
                                            </div>
                                            <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
