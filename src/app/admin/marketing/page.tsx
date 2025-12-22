'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, History, Zap, Play, Eye } from "lucide-react"

export default function MarketingPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [audience, setAudience] = useState('all')
    const [message, setMessage] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [actionLink, setActionLink] = useState('')

    // Preview State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewCount, setPreviewCount] = useState<number | null>(null)

    // Automation State
    const [isTesting, setIsTesting] = useState(false)

    // Estimate Audience Size (Mock for now, normally would be an API call)
    const getAudienceLabel = (val: string) => {
        switch (val) {
            case 'all': return '所有用戶 (All Users)'
            case 'vip': return 'VIP 會員'
            case 'pending_vip': return '待審核 VIP'
            case 'testers': return '測試人員 (Admin)'
            default: return val
        }
    }

    const handlePreview = async () => {
        if (!message && !imageUrl) {
            toast({
                title: "錯誤 (Error)",
                description: "請輸入訊息內容或圖片網址",
                variant: "destructive"
            })
            return
        }

        // Mock checking count
        setIsLoading(true)
        setTimeout(() => {
            setPreviewCount(audience === 'all' ? 1250 : audience === 'vip' ? 35 : 5)
            setIsLoading(false)
            setIsPreviewOpen(true)
        }, 500)
    }

    const handleConfirmSend = async () => {
        setIsLoading(true)
        setIsPreviewOpen(false) // Close modal

        try {
            const res = await fetch('/api/admin/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_audience: audience,
                    message_content: message,
                    image_url: imageUrl,
                    action_link: actionLink
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || '發送失敗')

            toast({
                title: "發送成功 (Success)",
                description: `已成功推播給 ${data.count} 位用戶。`
            })

            // Reset
            setMessage('')
            setImageUrl('')
            setActionLink('')

        } catch (error: any) {
            toast({
                title: "發送失敗 (Failed)",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleTestAutomation = async (taskName: string) => {
        setIsTesting(true)
        try {
            const res = await fetch('/api/admin/tasks/trigger-hourly-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: 'admin' })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast({
                title: "測試成功",
                description: `已觸發 ${taskName}，發送對象: ${data.count} (Admin)，最新BTC價格: $${data.data.price}`,
            })
        } catch (e: any) {
            toast({
                title: "測試失敗",
                description: e.message,
                variant: "destructive"
            })
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                行銷推播控制台 (Marketing Console)
            </h1>

            <Tabs defaultValue="campaign" className="w-full">
                <TabsList className="bg-neutral-900 border-neutral-800 text-neutral-400 mb-6">
                    <TabsTrigger value="campaign">手動推播 (Campaign)</TabsTrigger>
                    <TabsTrigger value="automation">自動化測試 (Automation)</TabsTrigger>
                </TabsList>

                {/* TAB 1: Manual Campaign */}
                <TabsContent value="campaign">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Composer */}
                        <Card className="bg-neutral-900 border-neutral-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="w-5 h-5 text-blue-400" />
                                    建立新推播
                                </CardTitle>
                                <CardDescription>發送即時訊息給用戶</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">推播對象 (Target Audience)</label>
                                    <Select value={audience} onValueChange={setAudience}>
                                        <SelectTrigger className="bg-neutral-950 border-neutral-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                            <SelectItem value="all">所有用戶 (All Users)</SelectItem>
                                            <SelectItem value="vip">VIP 會員 (Generic VIPs)</SelectItem>
                                            <SelectItem value="pending_vip">待審核 VIP (Pending)</SelectItem>
                                            <SelectItem value="testers">內部測試 (Admin Only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">訊息內容 (Message)</label>
                                    <Textarea
                                        placeholder="輸入您想發送的內容..."
                                        className="bg-neutral-950 border-neutral-800 min-h-[120px]"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">圖片連結 (Image URL - 選填)</label>
                                    <Input
                                        placeholder="https://..."
                                        className="bg-neutral-950 border-neutral-800"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">行動呼籲連結 (Action Link - 選填)</label>
                                    <Input
                                        placeholder="https://..."
                                        className="bg-neutral-950 border-neutral-800"
                                        value={actionLink}
                                        onChange={(e) => setActionLink(e.target.value)}
                                    />
                                </div>

                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6"
                                    onClick={handlePreview}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                        <span className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" /> 預覽並發送 (Preview & Send)
                                        </span>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview / History */}
                        <Card className="bg-neutral-900 border-neutral-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-purple-400" />
                                    歷史紀錄
                                </CardTitle>
                                <CardDescription>即將推出...</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-neutral-950/50 border border-dashed border-neutral-800 flex items-center justify-center h-[200px] text-neutral-500">
                                    尚無近期紀錄
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: Automation Testing */}
                <TabsContent value="automation">
                    <Card className="bg-neutral-900 border-neutral-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                自動化觸發測試
                            </CardTitle>
                            <CardDescription>手動觸發排程任務以測試功能是否正常。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                                <div>
                                    <div className="font-medium text-white">每小時 BTC 報價 (Hourly Quote)</div>
                                    <div className="text-sm text-neutral-500">從 Binance 抓取價格 -&gt; 產生 Flex Message -&gt; 發送給管理員</div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-neutral-700 hover:bg-neutral-800 text-green-400"
                                    onClick={() => handleTestAutomation('BTC Hourly')}
                                    disabled={isTesting}
                                >
                                    {isTesting ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 mr-2" />}
                                    立即執行
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-950 border border-neutral-800 opacity-50 cursor-not-allowed">
                                <div>
                                    <div className="font-medium text-white">每日 AI 市場報告 (Daily Report)</div>
                                    <div className="text-sm text-neutral-500">生成市場摘要與策略分析 (開發中)</div>
                                </div>
                                <Button variant="outline" disabled className="border-neutral-700 text-neutral-500">
                                    <Play className="w-4 h-4 mr-2" />
                                    立即執行
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <DialogHeader>
                        <DialogTitle>確認發送推播？</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            請確認以下訊息內容無誤。此操作將無法撤回。
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="bg-[#1f2937] p-4 rounded-xl max-w-sm mx-auto shadow-lg border border-neutral-800">
                            {/* Simulator Header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black">C</div>
                                <span className="text-xs font-bold text-amber-500">CryptoTW Pro</span>
                                <span className="text-[10px] text-gray-400 ml-auto">剛剛</span>
                            </div>

                            {/* Simulator Body */}
                            {imageUrl && (
                                <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-lg mb-3 object-cover aspect-video" />
                            )}

                            <div className="space-y-1">
                                <div className="text-white font-bold text-lg">{message || '無文字內容'}</div>
                                {actionLink && (
                                    <div className="text-neutral-400 text-sm truncate">🔗 {actionLink}</div>
                                )}
                            </div>

                            {/* Simulator Footer */}
                            {actionLink && (
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                    <div className="text-center text-blue-400 text-sm font-bold">查看詳情</div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 rounded-lg">
                            <span className="text-neutral-400">預計發送對象：</span>
                            <span className="text-white font-bold">{getAudienceLabel(audience)}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 rounded-lg">
                            <span className="text-neutral-400">預計人數：</span>
                            <span className="text-white font-bold">~{previewCount} 人</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="border-neutral-700">返回修改</Button>
                        <Button onClick={handleConfirmSend} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            確認並發送
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
