'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Send, Users, CheckCircle, Clock } from 'lucide-react'

interface PushMessage {
    id: string
    message_content: string
    target_audience: string
    recipient_count: number
    status: string
    created_at: string
    sent_at: string
}

export default function PushAdminPage() {
    const [message, setMessage] = useState('')
    const [audience, setAudience] = useState('all')
    const [isSending, setIsSending] = useState(false)
    const [history, setHistory] = useState<PushMessage[]>([])
    const [loadingHistory, setLoadingHistory] = useState(true)

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/admin/push')
            const data = await res.json()
            if (data.history) setHistory(data.history)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingHistory(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleSend = async () => {
        if (!message.trim()) return

        let confirmMsg = `Are you sure you want to send this message to ${audience === 'all' ? 'ALL USERS' : audience}?`
        if (audience === 'all') confirmMsg += '\n\n⚠️ WARNING: This will notify everyone!'

        if (!confirm(confirmMsg)) return

        setIsSending(true)
        try {
            const res = await fetch('/api/admin/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, audience })
            })
            const data = await res.json()

            if (res.ok) {
                alert(`Message sent successfully to ${data.count} users!`)
                setMessage('')
                fetchHistory()
            } else {
                alert('Failed to send message: ' + data.error)
            }
        } catch (e: any) {
            alert('Error: ' + e.message)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">推播訊息 (Push Notification)</h1>
                <p className="text-neutral-400 mt-2">發送 LINE 推播訊息給用戶。請謹慎使用以避免被封鎖。</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
                <div className="space-y-8">
                    <Card className="bg-neutral-900 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">發送新訊息 (Compose)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label className="text-neutral-400">接收對象 (Target Audience)</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="bg-neutral-800 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有用戶 (All Users)</SelectItem>
                                        <SelectItem value="vip">僅限 VIP (Pro Only)</SelectItem>
                                        <SelectItem value="pending_vip">待審核 VIP (Pending)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-neutral-400">訊息內容 (Message)</Label>
                                <Textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="輸入要發送的文字訊息..."
                                    className="min-h-[200px] bg-neutral-800 border-white/10 font-sans"
                                />
                                <p className="text-xs text-neutral-500">目前僅支援純文字格式。</p>
                            </div>

                            <Button
                                className="w-full bg-white text-black hover:bg-neutral-200"
                                size="lg"
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                            >
                                {isSending ? (
                                    '發送中 (Sending)...'
                                ) : (
                                    <><Send className="h-4 w-4 mr-2" /> 立即發送 (Send Now)</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">近期發送紀錄 (History)</h2>

                        {loadingHistory ? (
                            <div className="text-neutral-500 text-center py-8">載入中...</div>
                        ) : history.length === 0 ? (
                            <div className="text-neutral-500 text-center py-8 border border-dashed border-white/5 rounded-lg">尚無發送紀錄</div>
                        ) : (
                            <div className="grid gap-4">
                                {history.map(msg => (
                                    <Card key={msg.id} className="bg-neutral-900 border-white/5">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-neutral-400 border-white/10">
                                                            {msg.target_audience === 'all' ? 'All Users' : msg.target_audience}
                                                        </Badge>
                                                        <span className="text-xs text-neutral-500 flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-300 line-clamp-2">{msg.message_content}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-white">{msg.recipient_count}</div>
                                                    <div className="text-xs text-neutral-500">Recipients</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-neutral-900 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-base text-white">發送規則說明</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-neutral-400 space-y-2">
                            <p>• 訊息將透過 LINE Messaging API 發送。</p>
                            <p>• 系統會自動分批發送 (每批 500 人) 以符合 API 限制。</p>
                            <p>• 若用戶封鎖了官方帳號，將無法收到訊息。</p>
                            <p>• 請勿發送垃圾訊息，以免官方帳號被停權。</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
