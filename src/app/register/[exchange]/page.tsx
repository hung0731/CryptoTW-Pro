'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Info, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const EXCHANGE_INFO: Record<string, { name: string, link: string, bonus: string }> = {
    binance: { name: 'Binance', link: 'https://accounts.binance.com/register?ref=YOUR_REF', bonus: '20% Fee Discount' },
    okx: { name: 'OKX', link: 'https://www.okx.com/join/YOUR_REF', bonus: 'Mystery Box' },
    bybit: { name: 'Bybit', link: 'https://www.bybit.com/register?affiliate_id=YOUR_REF', bonus: '$30,000 Bonus' },
    bingx: { name: 'BingX', link: 'https://bingx.com/invite/YOUR_REF', bonus: '500+ USDT' },
    pionex: { name: 'Pionex', link: 'https://www.pionex.com/en/sign/ref/YOUR_REF', bonus: 'Trading Bots' },
}

export default function BindingPage() {
    const params = useParams()
    const router = useRouter()
    // Handle case insensitivity and potential undefined
    const rawExchangeId = params?.exchange as string || ''
    const exchangeId = rawExchangeId.toLowerCase()
    const exchange = EXCHANGE_INFO[exchangeId]

    const { isLoggedIn, profile, isLoading } = useLiff()
    const [uid, setUid] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Redirect if invalid exchange
    useEffect(() => {
        if (!isLoading && !exchange && rawExchangeId) {
            // Optional: Redirect or just show error state
            // router.push('/register')
        }
    }, [exchange, isLoading, rawExchangeId, router])

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
            setError('網路錯誤，請檢查連線')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Loading State
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>
    }

    // Error State
    if (!exchange) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center space-y-4">
                <p className="text-red-500">找不到該交易所 ({rawExchangeId})</p>
                <Link href="/register"><Button variant="outline">返回列表</Button></Link>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black p-4 flex items-center justify-center">
                <Card className="w-full max-w-md text-center bg-neutral-900 border-white/10">
                    <CardHeader>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 ring-1 ring-green-500/30">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">提交成功！</CardTitle>
                        <CardDescription className="text-neutral-400">
                            您的 {exchange.name} UID 已送出審核。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                            我們將在 24 小時內驗證您的註冊資訊。<br />
                            一旦權限開通，您將會收到 LINE 通知。
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/" className="w-full">
                            <Button className="w-full rounded-full bg-white text-black hover:bg-neutral-200 font-bold">回到首頁</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 font-sans">
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <Link href="/register">
                            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400 hover:text-white rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            綁定 {exchange.name}
                        </h1>
                    </div>
                    <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
                </div>
            </header>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {/* Step 1: Register */}
                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <Badge className="w-fit mb-2 bg-white text-black hover:bg-neutral-200">步驟 1</Badge>
                        <CardTitle className="text-base text-white">註冊帳號</CardTitle>
                        <CardDescription className="text-neutral-500">使用我們的連結註冊以符合 Pro 資格。</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="font-bold text-yellow-500">{exchange.bonus}</div>
                                <div className="text-xs text-neutral-400 font-medium">獨家福利 🎁</div>
                            </div>
                            <a href={exchange.link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-0 font-bold">
                                    前往註冊 <ExternalLink className="h-3 w-3" />
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Submit UID */}
                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader className="pb-3 border-b border-white/5">
                        <Badge variant="outline" className="w-fit mb-2 border-neutral-700 text-neutral-400">步驟 2</Badge>
                        <CardTitle className="text-base text-white">提交 UID</CardTitle>
                        <CardDescription className="text-neutral-500">請輸入您的 {exchange.name} 用戶 ID (UID)。</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="uid" className="font-medium text-neutral-400">UID</Label>
                                <Input
                                    id="uid"
                                    placeholder="例如： 12345678"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value)}
                                    disabled={isSubmitting}
                                    className="bg-black border-white/10 focus:border-white/30 text-white transition-colors h-12"
                                />
                                <p className="text-[10px] text-neutral-600 flex items-center gap-1">
                                    <Info className="h-3 w-3" /> 通常可以在個人中心或選單中找到
                                </p>
                            </div>

                            {error && (
                                <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/50 flex items-center gap-2">
                                    <Info className="h-4 w-4" /> {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full rounded-full font-bold h-12 bg-white text-black hover:bg-neutral-200" disabled={isSubmitting || !uid}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : '提交驗證'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
