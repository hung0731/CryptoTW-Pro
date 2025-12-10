'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash, Activity } from 'lucide-react'

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
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Activity Manager</h1>
                    <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> New Activity</Button>
                </div>

                <div className="grid gap-4">
                    {activities.map(item => (
                        <Card key={item.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-200`}>
                                        <Activity className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{item.exchange_name}</Badge>
                                            <h3 className="font-semibold">{item.title}</h3>
                                            {!item.is_active && <Badge variant="destructive">Inactive</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Activity' : 'New Activity'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Exchange</Label>
                                <Select
                                    value={formData.exchange_name}
                                    onValueChange={(v: any) => setFormData({ ...formData, exchange_name: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="binance">Binance</SelectItem>
                                        <SelectItem value="okx">OKX</SelectItem>
                                        <SelectItem value="bybit">Bybit</SelectItem>
                                        <SelectItem value="bingx">BingX</SelectItem>
                                        <SelectItem value="pionex">Pionex</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>URL</Label>
                                <Input
                                    value={formData.url || ''}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label>Active</Label>
                            </div>
                            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Activity'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
