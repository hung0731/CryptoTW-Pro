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
            setError('User not identified. Please reopen in LINE.')
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
                setError(data.error || 'Failed to submit')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!exchange) return <div className="p-8 text-center text-red-500">Exchange not found</div>

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <CardTitle>Submission Successful!</CardTitle>
                        <CardDescription>
                            Your {exchange.name} UID has been submitted for verification.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 mb-4">
                            We will verify your registration within 24 hours. You will receive a notification once unlocked.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/" className="w-full">
                            <Button className="w-full">Return to Dashboard</Button>
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
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <h1 className="text-xl font-bold">Bind {exchange.name}</h1>
                </div>

                {/* Step 1: Register */}
                <Card>
                    <CardHeader className="pb-3">
                        <Badge className="w-fit mb-2">Step 1</Badge>
                        <CardTitle className="text-base">Register Account</CardTitle>
                        <CardDescription>Use our link to qualify for Alpha access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-slate-900">{exchange.bonus}</div>
                                <div className="text-xs text-slate-500">Exclusive Benefit</div>
                            </div>
                            <a href={exchange.link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="default" className="gap-2">
                                    Register <ExternalLink className="h-3 w-3" />
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Submit UID */}
                <Card>
                    <CardHeader className="pb-3">
                        <Badge variant="outline" className="w-fit mb-2 border-primary text-primary">Step 2</Badge>
                        <CardTitle className="text-base">Submit UID</CardTitle>
                        <CardDescription>Enter your {exchange.name} User ID below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="uid">UID</Label>
                                <Input
                                    id="uid"
                                    placeholder="e.g. 12345678"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Usually found in your profile menu
                                </p>
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</div>
                            )}

                            <Button type="submit" className="w-full" disabled={isSubmitting || !uid}>
                                {isSubmitting ? 'Submitting...' : 'Verify Binding'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
