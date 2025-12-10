'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash, RefreshCw } from 'lucide-react'

// TODO: Move to shared types
interface Article {
    id: string
    title: string
    body: string
    type: 'news' | 'alpha' | 'weekly'
    access_level: 'free' | 'pro'
    is_published: boolean
    created_at: string
}

export default function ContentAdminPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        body: '',
        type: 'news',
        access_level: 'free',
        is_published: true
    })

    const fetchArticles = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/content')
            const data = await res.json()
            if (data.content) setArticles(data.content)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchArticles()
    }, [])

    const handleEdit = (article: Article) => {
        setEditingId(article.id)
        setFormData({
            title: article.title,
            body: article.body,
            type: article.type,
            access_level: article.access_level,
            is_published: article.is_published
        })
        setIsOpen(true)
    }

    const handleCreate = () => {
        setEditingId(null)
        setFormData({
            title: '',
            body: '',
            type: 'news',
            access_level: 'free',
            is_published: true
        })
        setIsOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return
        try {
            await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' })
            setArticles(prev => prev.filter(a => a.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const method = editingId ? 'PUT' : 'POST'
            const body = editingId ? { ...formData, id: editingId } : formData

            const res = await fetch('/api/admin/content', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setIsOpen(false)
                fetchArticles()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Content CMS</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={fetchArticles}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> New Article</Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {articles.map(article => (
                        <Card key={article.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={article.type === 'news' ? 'secondary' : 'default'}>{article.type}</Badge>
                                        <h3 className="font-semibold text-lg">{article.title}</h3>
                                        {article.access_level === 'pro' && <Badge variant="outline" className="text-yellow-600 border-yellow-600">PRO</Badge>}
                                        {!article.is_published && <Badge variant="destructive">Draft</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{article.body}</p>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        {new Date(article.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(article)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(article.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Article' : 'New Article'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="news">News (Brief)</SelectItem>
                                            <SelectItem value="alpha">Alpha (Deep Dive)</SelectItem>
                                            <SelectItem value="weekly">Weekly Report</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Access Level</Label>
                                    <Select
                                        value={formData.access_level}
                                        onValueChange={(v: any) => setFormData({ ...formData, access_level: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="pro">Pro Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Content</Label>
                                <Textarea
                                    className="min-h-[200px]"
                                    value={formData.body}
                                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_published}
                                    onCheckedChange={checked => setFormData({ ...formData, is_published: checked })}
                                />
                                <Label>Published</Label>
                            </div>
                            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Article'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
