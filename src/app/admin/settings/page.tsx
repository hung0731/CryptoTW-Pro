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

// ... imports

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
                <h3 className="font-semibold text-sm text-muted-foreground">Recent Announcements</h3>
                {currentAnnouncements.map((a: any) => (
                    <div key={a.id} className={`p-4 rounded border flex items-center justify-between ${a.is_active ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
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

export default function SettingsPage() {
    const [exchanges, setExchanges] = useState<Exchange[]>([])
    const [isLoading, setIsLoading] = useState(true)
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
                setIsLoading(false)
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

    if (isLoading) return <div className="p-8"><Skeleton className="h-60 w-full" /></div>

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Platform Settings</h1>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>System Announcement</CardTitle>
                        <p className="text-sm text-muted-foreground">Broadcast a global message to all users (e.g. Maintenance, Urgent Alpha).</p>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementManager />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Exchange Referral Links</CardTitle>
                        <p className="text-sm text-muted-foreground">Manage your dynamic referral links. Changes reflect instantly on the Register page.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {exchanges.map((ex) => (
                            <div key={ex.id} className="flex items-start gap-4 p-4 border rounded-lg bg-white">
                                <div className="grid gap-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="grid gap-1.5 w-1/4">
                                            <Label>Exchange Name</Label>
                                            <Input
                                                value={ex.name}
                                                onChange={e => handleChange(ex.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1.5 w-1/4">
                                            <Label>Slug (System ID)</Label>
                                            <Input disabled value={ex.slug} className="bg-slate-50" />
                                        </div>
                                        <div className="grid gap-1.5 w-1/4">
                                            <Label>Sort Order</Label>
                                            <Input
                                                type="number"
                                                value={ex.sort_order}
                                                onChange={e => handleChange(ex.id, 'sort_order', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-6">
                                            <Switch
                                                checked={ex.is_active}
                                                onCheckedChange={checked => handleChange(ex.id, 'is_active', checked)}
                                            />
                                            <Label>Active</Label>
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label>Referral Link</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={ex.referral_link}
                                                onChange={e => handleChange(ex.id, 'referral_link', e.target.value)}
                                            />
                                            <a href={ex.referral_link} target="_blank" rel="noreferrer">
                                                <Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="mt-6"
                                    onClick={() => handleUpdate(ex)}
                                    disabled={savingId === ex.id}
                                >
                                    {savingId === ex.id ? 'Saving...' : <Save className="h-4 w-4" />}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
