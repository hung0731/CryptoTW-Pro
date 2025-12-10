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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash2, FileText, RefreshCw } from 'lucide-react'

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
        <div className="p-6 md:p-8 space-y-8 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">內容管理 (CMS)</h1>
                    <p className="text-neutral-400 mt-2">發布新聞、Pro 觀點與週報。</p>
                </div>
                <Button onClick={handleCreate} className="bg-white text-black hover:bg-neutral-200">
                    <Plus className="h-4 w-4 mr-2" /> 新增內容
                </Button>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-12 text-neutral-500">載入中...</div>
                ) : articles.length === 0 ? (
                    <Card className="bg-neutral-900 border-white/5 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                            <FileText className="h-12 w-12 mb-4 opacity-50" />
                            <p>尚未建立任何內容</p>
                            <Button variant="link" onClick={handleCreate} className="text-white mt-2">
                                立即建立第一篇
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    articles.map((item) => (
                        <Card key={item.id} className="bg-neutral-900 border-white/5 hover:border-white/10 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`
                                            ${item.type === 'alpha' ? 'text-purple-400 border-purple-400/20 bg-purple-400/10' :
                                                item.type === 'weekly' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                    'text-blue-400 border-blue-400/20 bg-blue-400/10'}
                                        `}>
                                            {item.type === 'alpha' ? 'Pro 觀點' : item.type === 'weekly' ? '週報' : '快訊'}
                                        </Badge>
                                        <CardTitle className="text-base font-medium text-white">{item.title}</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs text-neutral-500">
                                        發布於 {new Date(item.created_at).toLocaleDateString()}
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
                                <p className="text-sm text-neutral-400 line-clamp-2">{item.body}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? '編輯內容' : '新增內容'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>標題 (Title)</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="bg-neutral-800 border-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>類型 (Type)</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                                >
                                    <SelectTrigger className="bg-neutral-800 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="news">快訊 (News)</SelectItem>
                                        <SelectItem value="alpha">Pro 觀點 (Alpha)</SelectItem>
                                        <SelectItem value="weekly">週報 (Weekly)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>權限 (Access)</Label>
                                <Select
                                    value={formData.access_level}
                                    onValueChange={(v: any) => setFormData({ ...formData, access_level: v })}
                                >
                                    <SelectTrigger className="bg-neutral-800 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">免費 (Free)</SelectItem>
                                        <SelectItem value="pro">Pro 會員 (VIP)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>內容 (Content)</Label>
                            <Textarea
                                className="min-h-[200px] bg-neutral-800 border-white/10"
                                value={formData.body}
                                onChange={e => setFormData({ ...formData, body: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_published}
                                onCheckedChange={c => setFormData({ ...formData, is_published: c })}
                            />
                            <Label>立即發布 (Publish Immediately)</Label>
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
