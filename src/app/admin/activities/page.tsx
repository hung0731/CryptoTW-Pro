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
import { Edit, Plus, Trash2, Activity } from 'lucide-react'

// TODO: Move to shared types
interface ActivityItem {
    id: string
    title: string
    exchange_name: string
    description: string
    url: string
    is_active: boolean
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
        exchange_name: 'binance',
        description: '',
        url: '',
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
            url: item.url,
            is_active: item.is_active
        })
        setIsOpen(true)
    }

    const handleCreate = () => {
        setEditingId(null)
        setFormData({
            title: '',
            exchange_name: 'binance',
            description: '',
            url: '',
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

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const method = editingId ? 'PUT' : 'POST'
            const body = editingId ? { ...formData, id: editingId } : formData

            const res = await fetch('/api/admin/activities', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setIsOpen(false)
                fetchActivities()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">活動管理 (Events)</h1>
                    <p className="text-neutral-400 mt-2">管理交易所活動與連結。</p>
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
                                        <Badge variant="outline" className="border-white/10 text-neutral-400">
                                            {item.exchange_name}
                                        </Badge>
                                        <CardTitle className="text-base font-medium text-white">{item.title}</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs text-neutral-500">
                                        ID: {item.id}
                                    </CardDescription>
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
                                <a href={item.url} target="_blank" className="text-xs text-blue-400 hover:underline mt-2 inline-block truncate max-w-md">
                                    {item.url}
                                </a>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '編輯活動' : '新增活動'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>活動名稱 (Title)</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="bg-neutral-800 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>交易所 (Exchange)</Label>
                            <Input
                                value={formData.exchange_name}
                                onChange={e => setFormData({ ...formData, exchange_name: e.target.value })}
                                placeholder="例如: binance, bybit"
                                className="bg-neutral-800 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>描述 (Description)</Label>
                            <Input
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="bg-neutral-800 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>連結 (URL)</Label>
                            <Input
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="bg-neutral-800 border-white/10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                            />
                            <Label>啟用 (Active)</Label>
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
