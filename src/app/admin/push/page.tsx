'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Send, Users, Clock, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
    const { toast } = useToast()

    const fetchHistory = async () => {
        setLoadingHistory(true)
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

        const confirmMsg = audience === 'all'
            ? '確定要發送給所有用戶嗎？\n\n⚠️ 警告：這將通知所有人！'
            : `確定要發送給 ${getAudienceLabel(audience)} 嗎？`

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
                toast({ title: `訊息已發送給 ${data.count} 位用戶` })
                setMessage('')
                fetchHistory()
            } else {
                toast({ title: '發送失敗：' + data.error, variant: 'destructive' })
            }
        } catch (e: any) {
            toast({ title: '發送錯誤', variant: 'destructive' })
        } finally {
            setIsSending(false)
        }
    }

    const getAudienceLabel = (aud: string) => {
        switch (aud) {
            case 'all': return '所有用戶'
            case 'pro': return 'Pro 會員'
            case 'free': return '免費用戶'
            default: return aud
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">推播訊息</h1>
                    <p className="text-neutral-400 mt-1">發送 LINE 推播訊息給用戶</p>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchHistory} className="text-neutral-400 hover:text-white">
                    <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_350px]">
                <div className="space-y-6">
                    {/* 發送表單 */}
                    <Card className="bg-neutral-900/50 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">發送新訊息</CardTitle>
                            <CardDescription className="text-neutral-400">請謹慎使用以避免帳號被封鎖</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-neutral-400">接收對象</Label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="bg-black border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10">
                                        <SelectItem value="all">所有用戶</SelectItem>
                                        <SelectItem value="pro">Pro 會員</SelectItem>
                                        <SelectItem value="free">免費用戶</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-neutral-400">訊息內容</Label>
                                <Textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="輸入要發送的文字訊息..."
                                    className="min-h-[200px] bg-black border-white/10 text-white"
                                />
                                <p className="text-xs text-neutral-500">目前僅支援純文字格式</p>
                            </div>

                            <Button
                                className="w-full bg-white text-black hover:bg-neutral-200"
                                size="lg"
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                            >
                                {isSending ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 發送中...</>
                                ) : (
                                    <><Send className="h-4 w-4 mr-2" /> 立即發送</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 發送歷史 */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">發送紀錄</h2>

                        {loadingHistory ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-neutral-500 text-center py-8 border border-dashed border-white/10 rounded-lg">
                                尚無發送紀錄
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map(msg => (
                                    <Card key={msg.id} className="bg-neutral-900/50 border-white/5">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-neutral-400 border-white/10">
                                                            {getAudienceLabel(msg.target_audience)}
                                                        </Badge>
                                                        <span className="text-xs text-neutral-500 flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {new Date(msg.created_at).toLocaleString('zh-TW')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-300 line-clamp-2">{msg.message_content}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-white">{msg.recipient_count}</div>
                                                    <div className="text-xs text-neutral-500">人已收到</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 使用說明 */}
                <div className="space-y-4">
                    <Card className="bg-neutral-900/50 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-base text-white flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                發送規則說明
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-neutral-400 space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                                <p>訊息將透過 LINE Messaging API 發送</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                                <p>系統會自動分批發送（每批 500 人）以符合 API 限制</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
                                <p>若用戶封鎖了官方帳號，將無法收到訊息</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                                <p>請勿發送垃圾訊息，以免官方帳號被停權</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-neutral-900/50 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-base text-white">用戶統計</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400">總發送次數</span>
                                <span className="text-white font-bold">{history.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400">總觸及人數</span>
                                <span className="text-white font-bold">
                                    {history.reduce((sum, m) => sum + m.recipient_count, 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
