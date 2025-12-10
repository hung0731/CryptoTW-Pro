'use client'

import React, { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowLeft, User, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

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

    if (authLoading) return <div className="p-8"><Skeleton className="h-10 w-full" /></div>

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
                <Card className="text-center p-6">
                    <p className="mb-4">Please login to view profile.</p>
                    <Link href="/">
                        <Button>Go to Home</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <h1 className="text-xl font-bold">My Profile</h1>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                        <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={profile?.pictureUrl} />
                            <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{profile?.displayName}</h2>
                        <div className="mt-2 flex items-center gap-2">
                            {dbUser?.membership_status === 'pro' ? (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">Alpha Member</Badge>
                            ) : dbUser?.membership_status === 'pending' ? (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">Verification Pending</Badge>
                            ) : (
                                <Badge variant="secondary">Free Member</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bindings List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Exchange Bindings</h3>
                        <Button variant="ghost" size="sm" onClick={() => profile?.userId && fetchBindings(profile.userId)}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : bindings.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-8 text-center text-muted-foreground">
                                <p className="mb-4 text-sm">No exchanges linked yet.</p>
                                <Link href="/register">
                                    <Button size="sm">Link Exchange</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        bindings.map(b => (
                            <Card key={b.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="uppercase font-bold">{b.exchange_name}</Badge>
                                                <span className="font-mono text-sm">{b.exchange_uid}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(b.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            {b.status === 'verified' && <div className="text-green-600 flex items-center text-xs font-semibold"><CheckCircle className="h-4 w-4 mr-1" /> Verified</div>}
                                            {b.status === 'pending' && <div className="text-orange-500 flex items-center text-xs font-semibold"><RefreshCw className="h-4 w-4 mr-1" /> Pending</div>}
                                            {b.status === 'rejected' && <div className="text-red-500 flex items-center text-xs font-semibold"><XCircle className="h-4 w-4 mr-1" /> Rejected</div>}
                                        </div>
                                    </div>
                                    {b.status === 'rejected' && (
                                        <div className="mt-3 bg-red-50 p-2 rounded text-xs text-red-600 border border-red-100">
                                            Reason: {b.rejection_reason || 'Information incorrect.'} <br />
                                            <Link href={`/register/${b.exchange_name}`} className="underline font-bold mt-1 block">
                                                Submit Again
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}

                    {/* Add Exchange Button */}
                    {bindings.length > 0 && (
                        <Link href="/register">
                            <Button variant="outline" className="w-full border-dashed">
                                + Link Another Exchange
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
