'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Save, ExternalLink, Trash2, Megaphone, AlertTriangle, Info, Plus, UploadCloud } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// ... (previous imports)

// Removed: RichMenuManager, AnnouncementManager (Moved to /admin/operations)

interface Exchange {
    id: string
    slug: string
    name: string
    referral_link: string
    is_active: boolean
    sort_order: number
}

function ExchangeManager() {
    // ... (ExchangeManager implementation remains same)
    const [exchanges, setExchanges] = useState<Exchange[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newExchange, setNewExchange] = useState({ name: '', slug: '', referral_link: '', sort_order: 0 })

    const fetchExchanges = async () => {
        try {
            const res = await fetch('/api/admin/exchanges')
            const data = await res.json()
            if (data.exchanges) setExchanges(data.exchanges)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExchanges()
    }, [])

    const handleUpdate = async (ex: Exchange) => {
        setSavingId(ex.id)
        try {
            await fetch('/api/admin/exchanges', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ex)
            })
        } catch (e) {
            console.error(e)
        } finally {
            setSavingId(null)
        }
    }

    const handleChange = (id: string, field: keyof Exchange, value: any) => {
        setExchanges(prev => prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex))
    }

    const handleCreate = async () => {
        if (!newExchange.name || !newExchange.slug) return
        try {
            const res = await fetch('/api/admin/exchanges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExchange)
            })
            if (res.ok) {
                fetchExchanges()
                setIsAddOpen(false)
                setNewExchange({ name: '', slug: '', referral_link: '', sort_order: 0 })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此交易所嗎？此操作無法復原。')) return
        try {
            await fetch(`/api/admin/exchanges?id=${id}`, { method: 'DELETE' })
            setExchanges(prev => prev.filter(e => e.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return <Skeleton className="h-60 w-full" />

    // ... (Render ExchangeManager UI with same structure)
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-neutral-200">
                            <Plus className="h-4 w-4 mr-2" /> 新增交易所 (Add Exchange)
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>新增交易所</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                請輸入新交易所的資訊。Slug 必須是唯一的系統識別碼 (如: binance, bybit)。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">名稱 (Name)</Label>
                                <Input
                                    value={newExchange.name}
                                    onChange={e => setNewExchange({ ...newExchange, name: e.target.value })}
                                    className="col-span-3 bg-neutral-800 border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">系統 ID (Slug)</Label>
                                <Input
                                    value={newExchange.slug}
                                    onChange={e => setNewExchange({ ...newExchange, slug: e.target.value.toLowerCase() })}
                                    className="col-span-3 bg-neutral-800 border-white/10"
                                    placeholder="e.g. bybit"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">連結 (Link)</Label>
                                <Input
                                    value={newExchange.referral_link}
                                    onChange={e => setNewExchange({ ...newExchange, referral_link: e.target.value })}
                                    className="col-span-3 bg-neutral-800 border-white/10"
                                    placeholder="https://"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">排序 (Sort)</Label>
                                <Input
                                    type="number"
                                    value={newExchange.sort_order}
                                    onChange={e => setNewExchange({ ...newExchange, sort_order: parseInt(e.target.value) })}
                                    className="col-span-3 bg-neutral-800 border-white/10"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-white/10 bg-transparent hover:bg-white/10 text-white">取消</Button>
                            <Button onClick={handleCreate} className="bg-white text-black hover:bg-neutral-200">新增</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {exchanges.map((ex) => (
                <div key={ex.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg bg-neutral-950 border-white/5 group">
                    <div className="grid gap-4 flex-1 w-full">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="grid gap-1.5 w-full md:w-1/4">
                                <Label className="text-neutral-400">交易所名稱</Label>
                                <Input
                                    value={ex.name}
                                    onChange={e => handleChange(ex.id, 'name', e.target.value)}
                                    className="bg-neutral-900 border-white/10"
                                />
                            </div>
                            <div className="grid gap-1.5 w-full md:w-1/4">
                                <Label className="text-neutral-400">Slug (系統 ID)</Label>
                                <Input
                                    value={ex.slug}
                                    onChange={e => handleChange(ex.id, 'slug', e.target.value)}
                                    className="bg-neutral-800 border-white/5 text-neutral-300"
                                />
                            </div>
                            <div className="grid gap-1.5 w-full md:w-1/4">
                                <Label className="text-neutral-400">排序 (Sort)</Label>
                                <Input
                                    type="number"
                                    value={ex.sort_order}
                                    onChange={e => handleChange(ex.id, 'sort_order', parseInt(e.target.value))}
                                    className="bg-neutral-900 border-white/10"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-0 md:pt-6">
                                <Switch
                                    checked={ex.is_active}
                                    onCheckedChange={checked => handleChange(ex.id, 'is_active', checked)}
                                />
                                <Label className="text-neutral-400">啟用</Label>
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-neutral-400">推薦連結 (Referral Link)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={ex.referral_link}
                                    onChange={e => handleChange(ex.id, 'referral_link', e.target.value)}
                                    className="bg-neutral-900 border-white/10"
                                />
                                <a href={ex.referral_link} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="icon" className="bg-transparent border-white/10 hover:bg-white/10"><ExternalLink className="h-4 w-4" /></Button>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <Button
                            className="flex-1 md:flex-none bg-white text-black hover:bg-neutral-200"
                            onClick={() => handleUpdate(ex)}
                            disabled={savingId === ex.id}
                        >
                            {savingId === ex.id ? '儲存中...' : <Save className="h-4 w-4" />}
                        </Button>
                        <Button
                            className="flex-1 md:flex-none bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-950/50"
                            variant="outline"
                            onClick={() => handleDelete(ex.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function AdminSettings() {
    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">設定 (Settings)</h1>
                <p className="text-neutral-400 mt-2">管理交易所推薦連結與全站設定。</p>
            </div>

            <div className="grid gap-8">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">交易所推薦連結 (Referrals)</CardTitle>
                        <CardDescription className="text-neutral-400">管理動態推薦連結。變更將即時反映於註冊頁面。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExchangeManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
