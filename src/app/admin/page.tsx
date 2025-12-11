'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Crown, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        pendingBindings: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (e) {
                console.error('Failed to fetch stats', e)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-neutral-400 mt-2">歡迎回到 CryptoTW Pro 管理後台。</p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between Space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">總用戶數</CardTitle>
                        <Users className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {loading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-600" /> : stats.totalUsers}
                        </div>
                        <p className="text-xs text-neutral-500">Active Members</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between Space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Pro 會員</CardTitle>
                        <Crown className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {loading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-600" /> : stats.verifiedUsers}
                        </div>
                        <p className="text-xs text-neutral-500">Verified Users</p>
                    </CardContent>
                </Card>

                <Link href="/admin/bindings">
                    <Card className="bg-neutral-900 border-white/5 hover:bg-neutral-800/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between Space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">待審核綁定</CardTitle>
                            <CreditCard className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white text-yellow-500">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-600" /> : stats.pendingBindings}
                            </div>
                            <p className="text-xs text-neutral-500">Pending Requests</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="rounded-lg border border-white/5 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-500">請從左側選單選擇功能開始管理。</p>
            </div>
        </div>
    )
}
