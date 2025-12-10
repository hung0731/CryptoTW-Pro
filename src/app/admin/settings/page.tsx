'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Save, ExternalLink } from 'lucide-react'

import { Trash2, Megaphone, AlertTriangle, Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { UploadCloud } from 'lucide-react'

function RichMenuManager() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean, error?: string } | null>(null)

    const handleDeploy = async () => {
        if (!confirm('This will overwrite the current active Rich Menu for ALL users. Continue?')) return
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/admin/rich-menu', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                setResult({ success: true })
                alert('Rich Menu deployed successfully!')
            } else {
                setResult({ error: data.error })
                alert('Deployment failed: ' + data.error)
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
                <div className="font-medium text-white">Deploy Default Menu</div>
                <div className="text-xs text-neutral-500">
                    Reads <code>/public/richmenu.png</code> (2500x1686) and applies "App Launcher" layout.
                </div>
                {result?.error && <div className="text-xs text-red-500 pt-1">Error: {result.error}</div>}
                {result?.success && <div className="text-xs text-green-500 pt-1">Deployed successfully.</div>}
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
                {loading ? 'Deploying...' : 'Deploy to LINE'}
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

    const fetchAnnouncements = async () => {
        const res = await fetch('/api/admin/announcements')
        const data = await res.json()
        if (data.announcements) setCurrentAnnouncements(data.announcements)
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const handlePost = async () => {
        if (!message) return
        setLoading(true)
        try {
            await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, level, is_active: isActive })
            })
            setMessage('')
            fetchAnnouncements()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return
        try {
            await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
            fetchAnnouncements()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-start">
                <div className="grid gap-2 flex-1">
                    <Label>New Announcement</Label>
                    <Textarea
                        placeholder="Enter message..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                </div>
                <div className="grid gap-2 w-[150px]">
                    <Label>Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="info">Info (Blue)</SelectItem>
                            <SelectItem value="warning">Warning (Yellow)</SelectItem>
                            <SelectItem value="alert">Alert (Red)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2 pt-8">
                    <div className="flex items-center gap-2">
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                        <Label>Active</Label>
                    </div>
                </div>
                <Button className="mt-8" onClick={handlePost} disabled={loading}>
                    <Megaphone className="h-4 w-4 mr-2" /> Post
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-sm text-neutral-400">Recent Announcements</h3>
                {currentAnnouncements.map((a: any) => (
                    <div key={a.id} className={`p-4 rounded border flex items-center justify-between ${a.is_active ? 'bg-green-950/30 border-green-900' : 'bg-neutral-950 border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            {a.level === 'alert' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            {a.level === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {a.level === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                            <div>
                                <div className="font-medium">{a.message}</div>
                                <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {a.is_active && <Badge className="bg-green-600">Active</Badge>}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
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

export function useExchanges() {
    const [exchanges, setExchanges] = useState<Exchange[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)

    useEffect(() => {
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

    return {
        exchanges,
        loading,
        savingId,
        handleChange,
        handleUpdate
    }
}

export default function AdminSettings() {
    const { exchanges, loading, savingId, handleChange, handleUpdate } = useExchanges()

    if (loading) return <div className="p-8"><Skeleton className="h-60 w-full" /></div>

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
                        <p className="text-sm text-neutral-400">發送全站廣播訊息 (例如：維護通知、Pro 緊急快訊)。</p>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementManager />
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">交易所推薦連結 (Referrals)</CardTitle>
                        <p className="text-sm text-neutral-400">管理動態推薦連結。變更將即時反映於註冊頁面。</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {exchanges.map((ex) => (
                            <div key={ex.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg bg-neutral-950 border-white/5">
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
                                            <Input disabled value={ex.slug} className="bg-neutral-800 border-white/5 text-neutral-500" />
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
                                <Button
                                    className="mt-6 w-full md:w-auto bg-white text-black hover:bg-neutral-200"
                                    onClick={() => handleUpdate(ex)}
                                    disabled={savingId === ex.id}
                                >
                                    {savingId === ex.id ? '儲存中...' : <Save className="h-4 w-4" />}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">LINE 圖文選單 (Rich Menu)</CardTitle>
                        <p className="text-sm text-neutral-400">部署 <code>public/richmenu.png</code> 為所有用戶的預設選單。</p>
                    </CardHeader>
                    <CardContent>
                        <RichMenuManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
