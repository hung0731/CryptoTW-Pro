'use client'

import React from 'react'
import { logger } from '@/lib/logger'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Shield, Terminal } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Import original components (we will refactor them to be exported as components or inline them)
// For now, I will inline the logic from settings/page.tsx and logs/page.tsx
// To keep the file clean, I'll assume we can refactor the original pages into components.
// HOWEVER, since I can't effectively multi-file refactor without multiple steps, 
// I will copy-paste the logic for now and wrap them in components within this file.

// --- Settings Component (from admin/settings/page.tsx) ---
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, RefreshCw, DollarSign, UserCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, Info, ShieldAlert } from 'lucide-react'

// ... (Settings Logic)
interface VerificationConfig {
    okx_affiliate_code: string
    okx_min_deposit: number
    okx_require_kyc: boolean
    auto_verify_enabled: boolean
}

const DEFAULT_CONFIG: VerificationConfig = {
    okx_affiliate_code: 'CTW20',
    okx_min_deposit: 1,
    okx_require_kyc: true,
    auto_verify_enabled: true
}

function SettingsTab() {
    const [config, setConfig] = useState<VerificationConfig>(DEFAULT_CONFIG)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    const fetchConfig = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/verification-config')
            const data = await res.json()
            if (data.config) {
                setConfig({ ...DEFAULT_CONFIG, ...data.config })
            }
        } catch (e) {
            logger.error('Failed to fetch config:', e, { feature: 'admin-system' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/verification-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            if (res.ok) {
                toast({ title: '設定已儲存' })
            } else {
                toast({ title: '儲存失敗', variant: 'destructive' })
            }
        } catch (e) {
            toast({ title: '儲存錯誤', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white">OKX 驗證規則</CardTitle>
                    </div>
                    <CardDescription className="text-neutral-400">
                        設定用戶自動驗證的條件。符合所有條件的用戶會自動升級為 Pro 會員。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 自動驗證開關 */}
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-white font-medium">自動驗證</Label>
                            <p className="text-sm text-neutral-500">開啟後，符合條件的用戶會自動通過驗證</p>
                        </div>
                        <Switch
                            checked={config.auto_verify_enabled}
                            onCheckedChange={(checked) => setConfig({ ...config, auto_verify_enabled: checked })}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 推薦碼 */}
                        <div className="space-y-2">
                            <Label className="text-neutral-400 flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                推薦碼
                            </Label>
                            <Input
                                value={config.okx_affiliate_code}
                                onChange={(e) => setConfig({ ...config, okx_affiliate_code: e.target.value })}
                                className="bg-black border-white/10 text-white font-mono"
                                placeholder="CTW20"
                            />
                            <p className="text-xs text-neutral-500">用戶必須使用此推薦碼註冊 OKX</p>
                        </div>

                        {/* 最低入金 */}
                        <div className="space-y-2">
                            <Label className="text-neutral-400 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                最低入金金額 (USDT)
                            </Label>
                            <Input
                                type="number"
                                value={config.okx_min_deposit}
                                onChange={(e) => setConfig({ ...config, okx_min_deposit: parseFloat(e.target.value) || 0 })}
                                className="bg-black border-white/10 text-white font-mono"
                                placeholder="1"
                            />
                            <p className="text-xs text-neutral-500">用戶入金需達到此金額</p>
                        </div>
                    </div>

                    {/* KYC 要求 */}
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-white font-medium">要求 KYC 驗證</Label>
                            <p className="text-sm text-neutral-500">用戶必須完成 OKX KYC 驗證</p>
                        </div>
                        <Switch
                            checked={config.okx_require_kyc}
                            onCheckedChange={(checked) => setConfig({ ...config, okx_require_kyc: checked })}
                        />
                    </div>

                    {/* 儲存按鈕 */}
                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-neutral-200">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            儲存設定
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 驗證條件預覽 */}
            <Card className="bg-neutral-900/50 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white">目前驗證條件</CardTitle>
                    <CardDescription className="text-neutral-400">
                        用戶需同時符合以下條件才能通過自動驗證
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${config.auto_verify_enabled ? 'bg-green-500' : 'bg-neutral-600'}`} />
                            <span className="text-neutral-300">自動驗證：{config.auto_verify_enabled ? '開啟' : '關閉'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-neutral-300">推薦碼：<code className="bg-black/50 px-1 rounded">{config.okx_affiliate_code}</code></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-neutral-300">最低入金：${config.okx_min_deposit} USDT</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${config.okx_require_kyc ? 'bg-purple-500' : 'bg-neutral-600'}`} />
                            <span className="text-neutral-300">KYC 驗證：{config.okx_require_kyc ? '必須' : '不要求'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- Logs Tab (from admin/logs/page.tsx) ---
interface SystemLog {
    id: string
    level: 'info' | 'warning' | 'error' | 'success'
    module: string
    message: string
    metadata: any
    created_at: string
}

function LogsTab() {
    const [logs, setLogs] = useState<SystemLog[]>([])
    const [loading, setLoading] = useState(true)
    const [filterLevel, setFilterLevel] = useState('all')

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const url = filterLevel === 'all'
                ? '/api/admin/logs'
                : `/api/admin/logs?level=${filterLevel}`

            const res = await fetch(url)
            const data = await res.json()
            if (data.logs) {
                setLogs(data.logs)
            }
        } catch (e) {
            logger.error('Failed to fetch logs', e, { feature: 'admin-system' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [filterLevel])

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <ShieldAlert className="h-4 w-4 text-red-500" />
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20'
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <CardDescription>顯示最近 50 筆活動記錄</CardDescription>
                <div className="flex items-center gap-2">
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-[120px] bg-neutral-900 border-white/10 text-white h-8 text-xs">
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10">
                            <SelectItem value="all">所有層級</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={fetchLogs} className="h-8 w-8 text-neutral-400 hover:text-white">
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <Card className="bg-neutral-900/50 border-white/5">
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-neutral-500">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Loading logs...
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500">
                                    尚無日誌記錄
                                </div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="p-4 hover:bg-white/5 transition-colors font-mono text-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`uppercase text-[10px] ${getLevelBadge(log.level)}`}>
                                                        {log.level}
                                                    </Badge>
                                                    <span className="text-neutral-500 text-xs">
                                                        [{log.module}]
                                                    </span>
                                                    <span className="text-neutral-500 text-xs ml-auto">
                                                        {new Date(log.created_at).toLocaleString('zh-TW')}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-300 break-all">{log.message}</p>
                                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                    <pre className="text-[10px] text-neutral-500 mt-2 bg-black/30 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SystemPage() {
    return (
        <div className="p-6 md:p-8 space-y-8 w-full max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">系統設定 (System)</h1>
                <p className="text-neutral-400 mt-2">管理環境參數與查看系統日誌</p>
            </div>

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="bg-neutral-900 border border-white/10 text-neutral-400">
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        驗證規則
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <Terminal className="w-4 h-4 mr-2" />
                        系統日誌
                    </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="settings">
                        <SettingsTab />
                    </TabsContent>
                    <TabsContent value="logs">
                        <LogsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
