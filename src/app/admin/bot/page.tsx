'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Plus, Trash, Save, Edit } from 'lucide-react'

export default function BotAdminPage() {
    const [triggers, setTriggers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<any>({
        id: null,
        keywords: '',
        reply_type: 'text',
        reply_content: '',
        is_active: true
    })

    const fetchTriggers = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/bot/triggers')
            if (res.ok) {
                setTriggers(await res.json())
            }
        } catch (e) { console.error(e) }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        fetchTriggers()
    }, [fetchTriggers])

    async function handleSave() {
        const keywordsArray = editData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
        let contentJson = null

        try {
            // Try parsing if it looks like JSON/Flex, otherwise treat as simple text object
            if (editData.reply_type === 'flex') {
                contentJson = JSON.parse(editData.reply_content)
            } else {
                contentJson = { type: 'text', text: editData.reply_content }
            }
        } catch (e) {
            alert('JSON 格式錯誤！請檢查 Flex Message JSON')
            return
        }

        const payload = {
            id: editData.id,
            keywords: keywordsArray,
            reply_type: editData.reply_type,
            reply_content: contentJson,
            is_active: editData.is_active
        }

        const method = editData.id ? 'PUT' : 'POST'
        await fetch('/api/admin/bot/triggers', {
            method,
            body: JSON.stringify(payload)
        })

        setIsEditing(false)
        fetchTriggers()
    }

    async function handleDelete(id: string) {
        if (!confirm('確定刪除此規則？')) return
        await fetch(`/api/admin/bot/triggers?id=${id}`, { method: 'DELETE' })
        fetchTriggers()
    }

    function openEdit(trigger?: any) {
        if (trigger) {
            let contentStr = ''
            if (trigger.reply_type === 'text') {
                contentStr = trigger.reply_content.text
            } else {
                contentStr = JSON.stringify(trigger.reply_content, null, 2)
            }

            setEditData({
                id: trigger.id,
                keywords: trigger.keywords.join(', '),
                reply_type: trigger.reply_type,
                reply_content: contentStr,
                is_active: trigger.is_active
            })
        } else {
            setEditData({
                id: null,
                keywords: '',
                reply_type: 'text',
                reply_content: '',
                is_active: true
            })
        }
        setIsEditing(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bot 關鍵字管理</h1>
                    <p className="text-neutral-400 text-sm">設定關鍵字自動回覆 (如: 教學, 換算)</p>
                </div>
                <button
                    onClick={() => openEdit()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                    <Plus size={16} /> 新增規則
                </button>
            </div>

            {isEditing && (
                <Card className="bg-neutral-900 border-white/10 mb-6">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">編輯回應規則</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm text-neutral-400 block mb-1">關鍵字 (用逗號隔開)</label>
                            <input
                                type="text"
                                value={editData.keywords}
                                onChange={e => setEditData({ ...editData, keywords: e.target.value })}
                                placeholder="例如: 換算, 匯率, 計算"
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 block mb-1">回覆類型</label>
                            <select
                                value={editData.reply_type}
                                onChange={e => setEditData({ ...editData, reply_type: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            >
                                <option value="text">純文字 (Text)</option>
                                <option value="flex">Flex Message (JSON)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 block mb-1">回覆內容</label>
                            <textarea
                                value={editData.reply_content}
                                onChange={e => setEditData({ ...editData, reply_content: e.target.value })}
                                rows={6}
                                placeholder={editData.reply_type === 'flex' ? '{ "type": "bubble", ... }' : '請輸入回覆文字...'}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-2 justify-end mt-4">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-neutral-400 hover:text-white">取消</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 flex items-center gap-2">
                                <Save size={16} /> 儲存
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {triggers.map(trigger => (
                    <Card key={trigger.id} className="bg-neutral-900/50 border-white/10 relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(trigger)} className="p-2 bg-neutral-800 rounded text-white hover:bg-neutral-700"><Edit size={14} /></button>
                            <button onClick={() => handleDelete(trigger.id)} className="p-2 bg-red-900/50 rounded text-red-400 hover:bg-red-900"><Trash size={14} /></button>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${trigger.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {trigger.is_active ? 'Active' : 'Disabled'}
                                </span>
                                <span className="text-xs text-neutral-500 uppercase">{trigger.reply_type}</span>
                            </div>
                            <h3 className="text-white font-bold mb-2 flex flex-wrap gap-1">
                                {trigger.keywords.map((k: string) => (
                                    <span key={k} className="bg-white/10 px-2 py-1 rounded text-sm">#{k}</span>
                                ))}
                            </h3>
                            <p className="text-neutral-500 text-sm line-clamp-3 font-mono bg-black/30 p-2 rounded">
                                {trigger.reply_type === 'text'
                                    ? trigger.reply_content.text
                                    : JSON.stringify(trigger.reply_content)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

// ... (previous code)

            setIsEditing(false)
            fetchTriggers()
    }

            // ... (handleDelete, openEdit, etc.)

            return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bot 關鍵字管理</h1>
                        <p className="text-neutral-400 text-sm">設定關鍵字自動回覆 (如: 教學, 換算)</p>
                    </div>
                    <button
                        onClick={() => openEdit()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                        <Plus size={16} /> 新增規則
                    </button>
                </div>

                {isEditing && (
                    <Card className="bg-neutral-900 border-white/10 mb-6">
                        {/* ... Edit Form ... */}
                        <CardHeader>
                            <CardTitle className="text-white text-lg">編輯回應規則</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm text-neutral-400 block mb-1">關鍵字 (用逗號隔開)</label>
                                <input
                                    type="text"
                                    value={editData.keywords}
                                    onChange={e => setEditData({ ...editData, keywords: e.target.value })}
                                    placeholder="例如: 換算, 匯率, 計算"
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-neutral-400 block mb-1">回覆類型</label>
                                <select
                                    value={editData.reply_type}
                                    onChange={e => setEditData({ ...editData, reply_type: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                                >
                                    <option value="text">純文字 (Text)</option>
                                    <option value="flex">Flex Message (JSON)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-neutral-400 block mb-1">回覆內容</label>
                                <textarea
                                    value={editData.reply_content}
                                    onChange={e => setEditData({ ...editData, reply_content: e.target.value })}
                                    rows={6}
                                    placeholder={editData.reply_type === 'flex' ? '{ "type": "bubble", ... }' : '請輸入回覆文字...'}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono text-sm"
                                />
                            </div>

                            <div className="flex gap-2 justify-end mt-4">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-neutral-400 hover:text-white">取消</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 flex items-center gap-2">
                                    <Save size={16} /> 儲存
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {triggers.map(trigger => (
                        <Card key={trigger.id} className="bg-neutral-900/50 border-white/10 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(trigger)} className="p-2 bg-neutral-800 rounded text-white hover:bg-neutral-700"><Edit size={14} /></button>
                                <button onClick={() => handleDelete(trigger.id)} className="p-2 bg-red-900/50 rounded text-red-400 hover:bg-red-900"><Trash size={14} /></button>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${trigger.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {trigger.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                    <span className="text-xs text-neutral-500 uppercase">{trigger.reply_type}</span>
                                </div>
                                <h3 className="text-white font-bold mb-2 flex flex-wrap gap-1">
                                    {trigger.keywords.map((k: string) => (
                                        <span key={k} className="bg-white/10 px-2 py-1 rounded text-sm">#{k}</span>
                                    ))}
                                </h3>
                                <p className="text-neutral-500 text-sm line-clamp-3 font-mono bg-black/30 p-2 rounded">
                                    {trigger.reply_type === 'text'
                                        ? trigger.reply_content.text
                                        : JSON.stringify(trigger.reply_content)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            )
}
