'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const EXCHANGE_INFO: any = {
    binance: { name: 'Binance', link: 'https://accounts.binance.com/register?ref=YOUR_REF', bonus: '20% Fee Discount' },
    okx: { name: 'OKX', link: 'https://www.okx.com/join/YOUR_REF', bonus: 'Mystery Box' },
    bybit: { name: 'Bybit', link: 'https://www.bybit.com/register?affiliate_id=YOUR_REF', bonus: '$30,000 Bonus' },
    bingx: { name: 'BingX', link: 'https://bingx.com/invite/YOUR_REF', bonus: '500+ USDT' },
    pionex: { name: 'Pionex', link: 'https://www.pionex.com/en/sign/ref/YOUR_REF', bonus: 'Trading Bots' },
}

export default function BindingPage() {
    const params = useParams()
    const router = useRouter()
    const exchangeId = params.exchange as string
    const exchange = EXCHANGE_INFO[exchangeId]

    const { isLoggedIn, profile, isLoading } = useLiff()
    const [uid, setUid] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Redirect if invalid exchange (simple check)
    useEffect(() => {
        if (!exchange && !isLoading) {
            // router.push('/register') 
        }
    }, [exchange, isLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uid) return
        if (!profile?.userId) {
            setError('無法識別用戶，請在 LINE 中重新開啟。')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/binding', {
                method: 'POST',
                body: JSON.stringify({
                    lineUserId: profile.userId,
                    exchange: exchangeId,
                    uid
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
            } else {
                setError(data.error || '提交失敗')
            }
        } catch (err) {
            setError('網路錯誤')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!exchange) return <div className="p-8 text-center text-red-500">找不到該交易所</div>

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 flex items-center justify-center">
                <Card className="w-full max-w-md text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">提交成功！</CardTitle>
                        <CardDescription className="text-base text-slate-600">
                            您的 {exchange.name} UID 已送出審核。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            我們將在 24 小時內驗證您的註冊資訊。<br />
                            一旦權限開通，您將會收到 LINE 通知。
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/" className="w-full">
                            <Button className="w-full rounded-xl shadow-lg shadow-primary/20 bg-slate-900 hover:bg-slate-800">回到首頁</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Link href="/register">
                        <Button variant="ghost" size="icon" className="hover:bg-white/50 rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <h1 className="text-xl font-bold">綁定 {exchange.name} 🔗</h1>
                </div>

                {/* Step 1: Register */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 bg-slate-50/50">
                        <Badge className="w-fit mb-2 bg-slate-900">步驟 1</Badge>
                        <CardTitle className="text-base">註冊帳號</CardTitle>
                        <CardDescription>使用我們的連結註冊以符合 Pro 資格。</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="font-bold text-slate-900">{exchange.bonus}</div>
                                <div className="text-xs text-orange-600 font-medium">獨家福利 🎁</div>
                            </div>
                            <a href={exchange.link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-md">
                                    前往註冊 <ExternalLink className="h-3 w-3" />
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Submit UID */}
                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-3">
                        <Badge variant="outline" className="w-fit mb-2 border-primary text-primary bg-primary/5">步驟 2</Badge>
                        <CardTitle className="text-base">提交 UID</CardTitle>
                        <CardDescription>請輸入您的 {exchange.name} 用戶 ID (UID)。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="uid" className="font-medium text-slate-700">UID</Label>
                                <Input
                                    id="uid"
                                    placeholder="例如： 12345678"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Info className="h-3 w-3" /> 通常可以在個人中心或選單中找到
                                </p>
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                    <Info className="h-4 w-4" /> {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isSubmitting || !uid}>
                                {isSubmitting ? '提交中...' : '提交驗證 ✅'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
