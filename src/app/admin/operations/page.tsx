'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Play, UploadCloud, Megaphone, AlertTriangle, Info, Trash2, Smartphone, MessageSquare } from 'lucide-react'
import { triggerMarketSummaryAction } from '@/app/actions/admin-actions'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

// --- 1. AI Trigger System ---
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
            className="w-full bg-white text-black hover:bg-neutral-200"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            立即生成市場報告 (Generate Report)
        </Button>
    )
}

// --- 1b. Whale AI Trigger ---
function TriggerWhaleAIButton() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleTrigger = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/market/whales')
            const data = await res.json()
            if (data.whales?.summary) {
                toast({ title: '巨鯨 AI 分析已更新', description: data.whales.summary.slice(0, 50) + '...' })
            } else {
                toast({ title: '更新完成', description: '巨鯨數據已刷新' })
            }
        } catch (e) {
            toast({ title: '錯誤', description: '更新失敗', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleTrigger}
            disabled={isLoading}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            更新巨鯨 AI 分析
        </Button>
    )
}

// --- 2. Rich Menu Manager ---
function RichMenuManager() {
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('開啟選單')

    const handleDeploy = async () => {
        if (!confirm('此操作將覆蓋所有用戶目前的圖文選單。確定要繼續嗎？')) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/rich-menu', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                alert('圖文選單部署成功！')
            } else {
                alert('部署失敗: ' + data.error)
            }
        } catch (e: any) {
            alert('Error: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateText = async () => {
        if (!confirm(`確定要將選單文字更新為 "${text}" 嗎？`)) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/rich-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatBarText: text })
            })
            if (res.ok) alert('Rich Menu 文字更新成功！')
            else alert('更新失敗')
        } catch (e: any) {
            alert('Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Deploy Default */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg bg-neutral-950 border-white/5 gap-4">
                <div className="space-y-1 w-full">
                    <div className="font-medium text-white flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        部署預設選單 (Deploy Menu)
                    </div>
                    <div className="text-xs text-neutral-500">
                        讀取 <code>public/richmenu.png</code> 並套用至官方帳號。
                    </div>
                </div>
                <Button
                    onClick={handleDeploy}
                    disabled={loading}
                    className="bg-white text-black hover:bg-neutral-200 w-full md:w-auto"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                    部署
                </Button>
            </div>

            {/* Update Text */}
            <div className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg bg-neutral-950 border-white/5">
                <div className="flex-1 w-full">
                    <Label className="text-neutral-400 mb-1.5 block">選單列文字 (Chat Bar Text)</Label>
                    <Input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="例如: 開啟選單"
                        maxLength={14}
                        className="bg-neutral-900 border-white/10"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1 text-right">{text.length}/14</p>
                </div>
                <Button variant="outline" onClick={handleUpdateText} disabled={loading} className="w-full md:w-auto border-white/10 hover:bg-white/5">
                    更新文字
                </Button>
            </div>
        </div>
    )
}

// --- 3. Announcement Manager ---
function AnnouncementManager() {
    const [message, setMessage] = useState('')
    const [level, setLevel] = useState('info')
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)

    const fetchAnnouncements = async () => {
        const res = await fetch('/api/admin/announcements')
        const data = await res.json()
        if (data.announcements) setAnnouncements(data.announcements)
    }

    useEffect(() => { fetchAnnouncements() }, [])

    const handleSave = async () => {
        if (!message) return
        setLoading(true)
        try {
            const method = editingId ? 'PUT' : 'POST'
            await fetch('/api/admin/announcements', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, level, is_active: isActive, id: editingId })
            })
            setMessage('')
            setEditingId(null)
            setIsActive(true)
            fetchAnnouncements()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('刪除此公告？')) return
        await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
        fetchAnnouncements()
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4 p-4 border border-white/5 rounded-lg bg-neutral-900/50">
                <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                    <div className="space-y-2">
                        <Label>公告內容</Label>
                        <Input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="bg-neutral-800 border-white/10"
                            placeholder="輸入公告..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>等級</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger className="bg-neutral-800 border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">一般 (Blue)</SelectItem>
                                <SelectItem value="warning">重要 (Yellow)</SelectItem>
                                <SelectItem value="alert">緊急 (Red)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                        <Label className="text-xs text-neutral-400">啟用顯示</Label>
                    </div>
                    <div className="flex gap-2">
                        {editingId && <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setMessage('') }}>Cancel</Button>}
                        <Button size="sm" onClick={handleSave} disabled={loading} className="bg-white text-black hover:bg-neutral-200">
                            {editingId ? '更新' : '發布'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {announcements.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded bg-neutral-900 border border-white/5 text-sm">
                        <div className="flex items-center gap-3">
                            {a.level === 'alert' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {a.level === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            {a.level === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                            <span className={!a.is_active ? 'text-neutral-500 line-through' : 'text-white'}>{a.message}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingId(a.id); setMessage(a.message); setLevel(a.level); setIsActive(a.is_active) }}><MessageSquare className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={() => handleDelete(a.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function OperationsPage() {
    return (
        <div className="p-6 md:p-8 space-y-8 w-full max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">營運中心 (Operations)</h1>
                <p className="text-neutral-400 mt-2">系統核心操作、公告發送與介面部署。</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* AI Card */}
                <Card className="bg-neutral-900 border-white/5 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-500" />
                            AI 市場報告
                        </CardTitle>
                        <CardDescription>
                            手動觸發 AI 分析並更新首頁數據。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TriggerSummaryButton />
                        <TriggerWhaleAIButton />
                    </CardContent>
                </Card>

                {/* Rich Menu Card */}
                <Card className="bg-neutral-900 border-white/5 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-purple-500" />
                            LINE 介面管理 (Rich Menu)
                        </CardTitle>
                        <CardDescription>
                            更新 LINE 官方帳號的圖文選單。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RichMenuManager />
                    </CardContent>
                </Card>

                {/* Announcements - Full Width */}
                <Card className="bg-neutral-900 border-white/5 md:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-blue-500" />
                            系統公告 (Announcements)
                        </CardTitle>
                        <CardDescription>
                            管理全站頂部跑馬燈通知。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
