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

function RichMenuManager() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean, error?: string } | null>(null)

    const handleDeploy = async () => {
        if (!confirm('此操作將覆蓋所有用戶目前的圖文選單。確定要繼續嗎？')) return
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/admin/rich-menu', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                setResult({ success: true })
                alert('圖文選單部署成功！')
            } else {
                setResult({ error: data.error })
                alert('部署失敗: ' + data.error)
            }
        } catch (e: any) {
            setResult({ error: e.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-neutral-950 border-white/5">
            <div className="space-y-1">
                <div className="font-medium text-white">部署預設選單 (Deploy Default Menu)</div>
                <div className="text-xs text-neutral-500">
                    讀取 <code>/public/richmenu.png</code> (2500x1686) 並套用至 LINE 官方帳號。
                </div>
                {result?.error && <div className="text-xs text-red-500 pt-1">Error: {result.error}</div>}
                {result?.success && <div className="text-xs text-green-500 pt-1">部署成功 (Deployed successfully).</div>}
            </div>
            <Button
                onClick={handleDeploy}
                disabled={loading}
                className="bg-white text-black hover:bg-neutral-200 font-bold"
            >
                {loading ? (
                    <UploadCloud className="h-4 w-4 animate-bounce mr-2" />
                ) : (
                    <UploadCloud className="h-4 w-4 mr-2" />
                )}
                {loading ? '部署中...' : '部署至 LINE'}
            </Button>
        </div>
    )
}

function AnnouncementManager() {
    const [message, setMessage] = useState('')
    const [level, setLevel] = useState('info')
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [currentAnnouncements, setCurrentAnnouncements] = useState<any[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)

    const fetchAnnouncements = async () => {
        const res = await fetch('/api/admin/announcements')
        const data = await res.json()
        if (data.announcements) setCurrentAnnouncements(data.announcements)
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const handleSave = async () => {
        if (!message) return
        setLoading(true)
        try {
            const method = editingId ? 'PUT' : 'POST'
            const body = { message, level, is_active: isActive, id: editingId }

            await fetch('/api/admin/announcements', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            setMessage('')
            setEditingId(null)
            setIsActive(true) // Reset to default
            fetchAnnouncements()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const customEdit = (a: any) => {
        setEditingId(a.id)
        setMessage(a.message)
        setLevel(a.level)
        setIsActive(a.is_active)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setMessage('')
        setIsActive(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此公告嗎？')) return
        try {
            await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
            fetchAnnouncements()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 p-4 border border-white/5 rounded-lg bg-neutral-900/50">
                <h3 className="font-semibold text-white">{editingId ? '編輯公告 (Edit)' : '新增公告 (New)'}</h3>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="grid gap-2 flex-1 w-full">
                        <Label>公告內容 (Message)</Label>
                        <Textarea
                            placeholder="輸入公告內容..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="bg-neutral-800 border-white/10"
                        />
                    </div>
                    <div className="grid gap-2 w-full md:w-[180px]">
                        <Label>等級 (Level)</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger className="bg-neutral-800 border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">一般通知 (Info)</SelectItem>
                                <SelectItem value="warning">重要提醒 (Warning)</SelectItem>
                                <SelectItem value="alert">緊急快訊 (Alert)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                        <Label>啟用公告 (Active)</Label>
                    </div>
                    <div className="flex gap-2">
                        {editingId && (
                            <Button variant="ghost" onClick={cancelEdit}>取消</Button>
                        )}
                        <Button onClick={handleSave} disabled={loading} className="bg-white text-black hover:bg-neutral-200">
                            <Megaphone className="h-4 w-4 mr-2" /> {editingId ? '更新' : '發布'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-sm text-neutral-400">近期公告列表 (Recent)</h3>
                {currentAnnouncements.length === 0 && <p className="text-neutral-500 text-sm">尚無公告</p>}
                {currentAnnouncements.map((a: any) => (
                    <div key={a.id} className={`p-4 rounded border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${a.is_active ? 'bg-green-950/10 border-green-900/30' : 'bg-neutral-950 border-white/5'}`}>
                        <div className="flex items-start gap-3">
                            {a.level === 'alert' && <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />}
                            {a.level === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />}
                            {a.level === 'info' && <Info className="h-5 w-5 text-blue-500 mt-1" />}
                            <div>
                                <div className="font-medium text-white">{a.message}</div>
                                <div className="text-xs text-neutral-500">{new Date(a.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            {a.is_active && <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30">Active</Badge>}
                            <Button variant="ghost" size="sm" onClick={() => customEdit(a)}>
                                編輯 (Edit)
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

interface Exchange {
    id: string
    slug: string
    name: string
    referral_link: string
    is_active: boolean
    sort_order: number
}

function ExchangeManager() {
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
            // Feedback usually
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
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">設定 (Settings)</h1>
                <p className="text-neutral-400 mt-2">管理推薦連結、系統公告與 LINE 選單。</p>
            </div>

            <div className="grid gap-8">
                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">系統公告 (System Announcement)</CardTitle>
                        <CardDescription className="text-neutral-400">發送全站廣播訊息 (例如：維護通知、Pro 緊急快訊)。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementManager />
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">交易所推薦連結 (Referrals)</CardTitle>
                        <CardDescription className="text-neutral-400">管理動態推薦連結。變更將即時反映於註冊頁面。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExchangeManager />
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">LINE 圖文選單 (Rich Menu)</CardTitle>
                        <CardDescription className="text-neutral-400">部署 <code>public/richmenu.png</code> 為所有用戶的預設選單。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RichMenuManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
