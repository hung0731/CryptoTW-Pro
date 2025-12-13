'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, RefreshCw, Settings, Shield, DollarSign, UserCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

export default function AdminSettings() {
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
            console.error('Failed to fetch config:', e)
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">系統設定</h1>
                    <p className="text-neutral-400 mt-1">管理 OKX 整合與驗證規則</p>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchConfig} className="text-neutral-400 hover:text-white">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* OKX 驗證規則 */}
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
