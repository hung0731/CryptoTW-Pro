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

    if (authLoading) return <div className="p-8 text-center"><Skeleton className="h-10 w-full" /></div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <h1 className="text-xl font-bold">Choose Exchange</h1>
                </div>

                <p className="text-muted-foreground text-sm">
                    Select an exchange to register and bind your UID. You will unlock Alpha access immediately after verification.
                </p>

                <div className="grid gap-4">
                    {loadingExchanges ? (
                        <>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </>
                    ) : exchanges.map((ex) => (
                        <Card key={ex.id} className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                            <Link href={`/register/${ex.slug}`} className="block h-full">
                                <CardContent className="p-0 flex items-stretch h-24">
                                    {/* Logo/Brand Area */}
                                    <div className={`w-24 flex items-center justify-center font-bold text-lg bg-slate-900 text-white`}>
                                        {ex.logo_url ? (
                                            <img src={ex.logo_url} alt={ex.name} className="h-10 w-10 object-contain" />
                                        ) : (
                                            ex.name[0]
                                        )}
                                    </div>

                                    {/* Info Area */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold">{ex.name}</h3>
                                            <Badge variant="secondary" className="text-[10px] px-1">Special Offer</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center justify-between">
                                            <span className="truncate pr-4">{ex.referral_link}</span>
                                            <ChevronRight className="h-4 w-4 opacity-50" />
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
