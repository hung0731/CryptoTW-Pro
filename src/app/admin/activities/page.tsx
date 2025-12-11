'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash2, Activity, CalendarClock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// TODO: Move to shared types
interface ActivityItem {
    id: string
    title: string
    exchange_name: string
    description: string
    content: string
    url: string
    is_active: boolean
    end_date: string
    created_at: string
}

export default function ActivitiesAdminPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<ActivityItem>>({
        title: '',
        exchange_name: 'all',
        description: '',
        content: '',
        url: '',
        end_date: '',
        is_active: true
    })

    const fetchActivities = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/activities')
            const data = await res.json()
            if (data.activities) setActivities(data.activities)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchActivities()
    }, [])

    const handleEdit = (item: ActivityItem) => {
        setEditingId(item.id)
        setFormData({
            title: item.title,
            exchange_name: item.exchange_name,
            description: item.description,
            content: item.content || '',
            url: item.url,
            end_date: item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : '',
            is_active: item.is_active
        })
        setIsOpen(true)
    }

    const handleCreate = () => {
        setEditingId(null)
        setFormData({
            title: '',
            exchange_name: 'all',
            description: '',
            content: '',
            url: '',
            end_date: '',
            is_active: true
        })
        setIsOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this activity?')) return
        try {
            await fetch(`/api/admin/activities?id=${id}`, { method: 'DELETE' })
            setActivities(prev => prev.filter(a => a.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    const [isAiLoading, setIsAiLoading] = useState(false)
    const [importUrl, setImportUrl] = useState('')

    const handleAiImport = async () => {
        if (!importUrl) return
        setIsAiLoading(true)
        try {
            const res = await fetch('/api/admin/ai-activity-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: importUrl })
            })
            const data = await res.json()

            if (data.success && data.data) {
                const { title, description, content, exchange_name, end_date, url } = data.data
                setFormData(prev => ({
                    ...prev,
                    title,
                    description,
                    content,
                    exchange_name: exchange_name || 'all',
                    url: url || importUrl,
                    end_date: end_date ? new Date(end_date).toISOString().slice(0, 16) : ''
                }))
            } else {
                alert('AI Import Failed: ' + (data.error || 'Unknown error'))
            }
        } catch (e) {
            console.error(e)
            alert('AI Import Error')
        } finally {
            setIsAiLoading(false)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const method = editingId ? 'PUT' : 'POST'
            // Convert datetime-local string back to ISO if needed, or just send as string
            const body = editingId ? { ...formData, id: editingId } : formData

            const res = await fetch('/api/admin/activities', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setIsOpen(false)
                fetchActivities()
            } else {
                alert('Failed to save activity')
            }
        } catch (e) {
            console.error(e)
            alert('Error saving activity')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">活動管理 (Events)</h1>
                    <p className="text-neutral-400 mt-2">管理交易所活動、受眾投放與倒數計時。</p>
                </div>
                <Button onClick={handleCreate} className="bg-white text-black hover:bg-neutral-200">
                    <Plus className="h-4 w-4 mr-2" /> 新增活動
                </Button>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-12 text-neutral-500">載入中...</div>
                ) : activities.length === 0 ? (
                    <Card className="bg-neutral-900 border-white/5 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                            <Activity className="h-12 w-12 mb-4 opacity-50" />
                            <p>尚未建立任何活動</p>
                        </CardContent>
                    </Card>
                ) : (
                    activities.map((item) => (
                        <Card key={item.id} className="bg-neutral-900 border-white/5 hover:border-white/10 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-white/10 text-neutral-400 capitalize">
                                            {item.exchange_name}
                                        </Badge>
                                        <CardTitle className="text-base font-medium text-white">{item.title}</CardTitle>
                                        {!item.is_active && <Badge variant="secondary" className="text-xs bg-red-900/20 text-red-500">停用</Badge>}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span>ID: {item.id.slice(0, 8)}...</span>
                                        {item.end_date && (
                                            <span className="flex items-center gap-1 text-orange-400">
                                                <CalendarClock className="w-3 h-3" />
                                                結束於: {new Date(item.end_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="hover:bg-red-900/20 text-red-500" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-400 line-clamp-1">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '編輯活動' : '新增活動'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* AI Import Section */}
                        {!editingId && (
                            <div className="bg-neutral-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                                <Label className="text-blue-400 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> AI 智慧導入 (貼上網址自動填寫)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://announcement.binance.com/..."
                                        className="bg-neutral-900 border-white/10"
                                        value={importUrl}
                                        onChange={(e) => setImportUrl(e.target.value)}
                                    />
                                    <Button
                                        onClick={handleAiImport}
                                        disabled={isAiLoading || !importUrl}
                                        className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px]"
                                    >
                                        {isAiLoading ? '分析中...' : '自動填寫'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>活動名稱 (Title)</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-neutral-800 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>受眾/交易所 (Audience)</Label>
                                <Select
                                    value={formData.exchange_name}
                                    onValueChange={(val) => setFormData({ ...formData, exchange_name: val })}
                                >
                                    <SelectTrigger className="bg-neutral-800 border-white/10">
                                        <SelectValue placeholder="選擇受眾" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-white/10 text-white">
                                        <SelectItem value="all">全部用戶 (All)</SelectItem>
                                        <SelectItem value="vip">大客戶 (VIP)</SelectItem>
                                        <SelectItem value="pro">Pro 用戶</SelectItem>
                                        <SelectItem value="binance">Binance</SelectItem>
                                        <SelectItem value="okx">OKX</SelectItem>
                                        <SelectItem value="bybit">Bybit</SelectItem>
                                        <SelectItem value="bitget">Bitget</SelectItem>
                                        <SelectItem value="bingx">BingX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>簡短描述 (Summary)</Label>
                            <Input
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="bg-neutral-800 border-white/10"
                                placeholder="顯示在卡片上的簡短說明"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>詳細內容 (Markdown)</Label>
                            <Textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="bg-neutral-800 border-white/10 font-mono text-sm min-h-[150px]"
                                placeholder="# 活動詳情&#10;&#10;在這裡輸入詳細內容..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>結束時間 (End Date)</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="bg-neutral-800 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>外部連結 (Optional URL)</Label>
                                <Input
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="bg-neutral-800 border-white/10"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                            />
                            <Label>啟用此活動</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 hover:bg-white/10">
                            取消
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-white text-black hover:bg-neutral-200">
                            {isSubmitting ? '儲存中...' : '儲存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
