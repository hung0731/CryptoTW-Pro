'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Crown, TrendingUp, DollarSign, RefreshCw, Loader2, User, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VipUser {
    id: string
    user_id: string
    display_name: string
    picture_url: string
    exchange_uid: string
    monthly_volume: number
    total_commission: number
    okx_level: string
    rebate_rate: number
}

// VIP 門檻設定
const VIP_TIERS = [
    { name: '白金', minVolume: 1000000, color: 'bg-gradient-to-r from-neutral-300 to-neutral-100', textColor: 'text-neutral-900' },
    { name: '黃金', minVolume: 500000, color: 'bg-gradient-to-r from-yellow-500 to-amber-400', textColor: 'text-black' },
    { name: '白銀', minVolume: 100000, color: 'bg-gradient-to-r from-neutral-400 to-neutral-300', textColor: 'text-neutral-900' },
    { name: '青銅', minVolume: 10000, color: 'bg-gradient-to-r from-orange-700 to-orange-500', textColor: 'text-white' },
]

function getTier(volume: number) {
    for (const tier of VIP_TIERS) {
        if (volume >= tier.minVolume) return tier
    }
    return null
}

export default function AdminVipPage() {
    const [users, setUsers] = useState<VipUser[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchVipUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/bindings?status=verified&exchange=okx')
            const data = await res.json()

            if (data.bindings) {
                // 只取有交易量的用戶，按交易量排序
                const vipList: VipUser[] = data.bindings
                    .filter((b: any) => b.monthly_volume && b.monthly_volume > 0)
                    .map((b: any) => ({
                        id: b.id,
                        user_id: b.user?.id,
                        display_name: b.user?.display_name || '未知用戶',
                        picture_url: b.user?.picture_url || '',
                        exchange_uid: b.exchange_uid,
                        monthly_volume: b.monthly_volume || 0,
                        total_commission: b.total_commission || 0,
                        okx_level: b.okx_level || '-',
                        rebate_rate: b.rebate_rate || 0
                    }))
                    .sort((a: VipUser, b: VipUser) => b.monthly_volume - a.monthly_volume)

                setUsers(vipList)
            }
        } catch (e) {
            console.error(e)
            toast({ title: '載入失敗', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVipUsers()
    }, [])

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
        return `$${val.toFixed(0)}`
    }

    // 統計各等級人數
    const tierCounts = VIP_TIERS.map(tier => ({
        ...tier,
        count: users.filter(u => {
            const userTier = getTier(u.monthly_volume)
            return userTier?.name === tier.name
        }).length
    }))

    const totalVolume = users.reduce((sum, u) => sum + u.monthly_volume, 0)
    const totalCommission = users.reduce((sum, u) => sum + u.total_commission, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Crown className="h-8 w-8 text-yellow-500" />
                        VIP 大戶排行
                    </h1>
                    <p className="text-neutral-400 mt-1">追蹤高交易量用戶</p>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchVipUsers} className="text-neutral-400 hover:text-white">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* VIP 等級統計 */}
            <div className="grid gap-4 md:grid-cols-4">
                {tierCounts.map(tier => (
                    <Card key={tier.name} className="bg-neutral-900/50 border-white/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className={`${tier.color} ${tier.textColor} border-0`}>{tier.name}</Badge>
                                    <p className="text-xs text-neutral-500 mt-1">≥ {formatCurrency(tier.minVolume)}</p>
                                </div>
                                <div className="text-2xl font-bold text-white">{tier.count}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 總計 */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">VIP 用戶總交易量</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(totalVolume)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">VIP 用戶總返佣</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(totalCommission)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 排行榜 */}
            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        交易量排行榜
                    </CardTitle>
                    <CardDescription className="text-neutral-400">依當月交易量排序</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-center py-12 text-neutral-500">目前沒有交易數據</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-neutral-400 w-12">排名</TableHead>
                                    <TableHead className="text-neutral-400">用戶</TableHead>
                                    <TableHead className="text-neutral-400">OKX UID</TableHead>
                                    <TableHead className="text-neutral-400 text-right">當月交易量</TableHead>
                                    <TableHead className="text-neutral-400 text-right">累計返佣</TableHead>
                                    <TableHead className="text-neutral-400 text-center">等級</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.slice(0, 50).map((user, index) => {
                                    const tier = getTier(user.monthly_volume)
                                    return (
                                        <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                                            <TableCell className="font-bold text-neutral-400">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.picture_url} />
                                                        <AvatarFallback className="bg-neutral-800 text-neutral-400">
                                                            <User className="w-4 h-4" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-white">{user.display_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-neutral-400">{user.exchange_uid}</TableCell>
                                            <TableCell className="text-right font-mono font-bold text-white">
                                                {formatCurrency(user.monthly_volume)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-green-400">
                                                {formatCurrency(user.total_commission)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {tier ? (
                                                    <Badge className={`${tier.color} ${tier.textColor} border-0`}>{tier.name}</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-white/20 text-neutral-500">一般</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
