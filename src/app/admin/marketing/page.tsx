'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, History, Zap, Play } from "lucide-react"

interface PushLog {
    id: string
    message_content: string
    target_audience: string
    recipient_count: number
    status: string
    created_at: string
}

export default function MarketingPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [logs, setLogs] = useState<PushLog[]>([])

    // Form State
    const [audience, setAudience] = useState('all')
    const [message, setMessage] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [actionLink, setActionLink] = useState('')

    // Automation State
    const [isTesting, setIsTesting] = useState(false)

    useEffect(() => {
        // Fetch logs (skipped for now)
    }, [])

    const handleSend = async () => {
        if (!message && !imageUrl) {
            toast({
                title: "Error",
                description: "Message or Image is required",
                variant: "destructive"
            })
            return
        }

        if (confirm(`Are you sure you want to send this to '${audience}' users?`)) {
            setIsLoading(true)
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

                if (!res.ok) throw new Error(data.error || 'Failed to send')

                toast({
                    title: "Success",
                    description: `Sent to ${data.count} users successfully.`
                })

                // Reset
                setMessage('')
                setImageUrl('')
                setActionLink('')

            } catch (error: any) {
                toast({
                    title: "Failed",
                    description: error.message,
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleTestAutomation = async (taskName: string) => {
        setIsTesting(true)
        try {
            const res = await fetch('/api/admin/tasks/trigger-hourly-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: 'admin' }) // Only test on admin for safety
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast({
                title: "Automation Triggered",
                description: `Sent ${taskName} to ${data.count} admin(s). Price: $${data.data.price}`,
            })
        } catch (e: any) {
            toast({
                title: "Automation Failed",
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
                Marketing Console
            </h1>

            <Tabs defaultValue="campaign" className="w-full">
                <TabsList className="bg-neutral-900 border-neutral-800 text-neutral-400 mb-6">
                    <TabsTrigger value="campaign">Manual Campaign</TabsTrigger>
                    <TabsTrigger value="automation">Automation Testing</TabsTrigger>
                </TabsList>

                {/* TAB 1: Manual Campaign */}
                <TabsContent value="campaign">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Composer */}
                        <Card className="bg-neutral-900 border-neutral-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="w-5 h-5 text-blue-400" />
                                    New Campaign
                                </CardTitle>
                                <CardDescription>Send push notifications instantly</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Target Audience</label>
                                    <Select value={audience} onValueChange={setAudience}>
                                        <SelectTrigger className="bg-neutral-950 border-neutral-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="vip">Generic VIPs</SelectItem>
                                            <SelectItem value="pending_vip">Pending VIPs</SelectItem>
                                            <SelectItem value="testers">Testers (Admin Only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Message Content</label>
                                    <Textarea
                                        placeholder="Enter your marketing message..."
                                        className="bg-neutral-950 border-neutral-800 min-h-[120px]"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Image URL (Optional)</label>
                                    <Input
                                        placeholder="https://..."
                                        className="bg-neutral-950 border-neutral-800"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Action Link (Optional)</label>
                                    <Input
                                        placeholder="https://..."
                                        className="bg-neutral-950 border-neutral-800"
                                        value={actionLink}
                                        onChange={(e) => setActionLink(e.target.value)}
                                    />
                                </div>

                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6"
                                    onClick={handleSend}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Push Campaign'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card className="bg-neutral-900 border-neutral-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-purple-400" />
                                    Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-[#1f2937] p-4 rounded-xl max-w-sm mx-auto shadow-lg mt-10">
                                    {imageUrl && (
                                        <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-lg mb-3 object-cover" />
                                    )}
                                    <div className="bg-[#374151] p-3 rounded-lg rounded-tl-none inline-block text-white text-sm w-full">
                                        {message || <span className="text-neutral-500 italic">Message text will appear here...</span>}
                                        {actionLink && (
                                            <div className="mt-2 text-blue-300 underline text-xs break-all">
                                                👉 查看詳情: {actionLink}
                                            </div>
                                        )}
                                    </div>
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
                                Automation Triggers
                            </CardTitle>
                            <CardDescription>Manually trigger scheduled tasks for testing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                                <div>
                                    <div className="font-medium text-white">Hourly BTC Quote</div>
                                    <div className="text-sm text-neutral-500">Fetches price from Binance, generates Flex Message, sends to Admins.</div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-neutral-700 hover:bg-neutral-800 text-green-400"
                                    onClick={() => handleTestAutomation('BTC Hourly')}
                                    disabled={isTesting}
                                >
                                    {isTesting ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 mr-2" />}
                                    Run Now
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-950 border border-neutral-800 opacity-50 cursor-not-allowed">
                                <div>
                                    <div className="font-medium text-white">Daily AI Report</div>
                                    <div className="text-sm text-neutral-500">Generates market summary and strategy note. (Coming Soon)</div>
                                </div>
                                <Button variant="outline" disabled className="border-neutral-700 text-neutral-500">
                                    <Play className="w-4 h-4 mr-2" />
                                    Run Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
