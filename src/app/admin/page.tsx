'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Crown, CreditCard, Loader2, Play } from 'lucide-react'
import Link from 'next/link'
import { triggerMarketSummaryAction } from '@/app/actions/admin-actions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function TriggerSummaryButton() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleTrigger = async () => {
        setIsLoading(true)
        try {
            const res = await triggerMarketSummaryAction()
            if (res.success) {
                toast({ title: 'AI 分析報告已生成', description: '首頁數據已更新' })
            } else {
                toast({ title: '生成失敗', description: res.error, variant: 'destructive' })
            }
        } catch (e) {
            toast({ title: '錯誤', description: '未知錯誤', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleTrigger}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="mt-2 w-full border-white/10 hover:bg-white/5 text-xs h-8"
        >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            手動觸發報告
        </Button>
    )
}

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
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-neutral-400 text-sm">歡迎回到加密台灣 Pro 管理後台。這裡顯示您的平台即時概況。</p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-neutral-900/50 border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-400">總用戶數</span>
                        <Users className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {loading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-600" /> : stats.totalUsers}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Active Members</p>
                    </div>
                </Card>

                <Card className="bg-neutral-900/50 border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-400">Pro 會員</span>
                        <Crown className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {loading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-600" /> : stats.verifiedUsers}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Verified Users</p>
                    </div>
                </Card>

                <Link href="/admin/bindings" className="block group">
                    <Card className="bg-neutral-900/50 border-white/10 p-6 space-y-4 group-hover:border-yellow-500/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-400 group-hover:text-yellow-500 transition-colors">待審核綁定</span>
                            <CreditCard className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-500 tracking-tight">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin text-neutral-600" /> : stats.pendingBindings}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">Pending Requests</p>
                        </div>
                    </Card>
                </Link>

                {/* System Ops */}
                <Card className="bg-neutral-900/50 border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-400">系統操作</span>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white tracking-tight">AI</div>
                        <TriggerSummaryButton />
                    </div>
                </Card>
            </div>

            <div className="rounded-xl border border-white/5 bg-neutral-900/30 p-12 text-center">
                <div className="max-w-sm mx-auto space-y-4">
                    <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Activity className="h-6 w-6 text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white">更多數據即將推出</h3>
                    <p className="text-sm text-neutral-500">我們正在建構更詳細的分析報表，包含用戶留存率、內容閱讀量等指標。</p>
                </div>
            </div>
        </div>
    )
}
