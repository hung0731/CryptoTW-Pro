'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Crown, CreditCard } from 'lucide-react'

export default function AdminPage() {
    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-neutral-400 mt-2">歡迎回到 CryptoTW Pro 管理後台。</p>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between Space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">總用戶數</CardTitle>
                        <Users className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">-</div>
                        <p className="text-xs text-neutral-500">Active Members</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between Space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Pro 會員</CardTitle>
                        <Crown className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">-</div>
                        <p className="text-xs text-neutral-500">Verified Users</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between Space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">待審核綁定</CardTitle>
                        <CreditCard className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white text-yellow-500">View</div>
                        <p className="text-xs text-neutral-500">Go to Bindings Page</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg border border-white/5 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-500">請從左側選單選擇功能開始管理。</p>
            </div>
        </div>
    )
}
