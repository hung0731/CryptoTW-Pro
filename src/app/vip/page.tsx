'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useLiff } from '@/components/LiffProvider'
import { Sparkles, Crown, Diamond, ShieldCheck, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VipPage() {
    const { dbUser } = useLiff()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            contact_method: formData.get('contact_method'),
            contact_handle: formData.get('contact_handle'),
            asset_tier: formData.get('asset_tier'),
            trading_volume_monthly: formData.get('trading_volume_monthly'),
            preferred_exchange: formData.get('preferred_exchange'),
            notes: formData.get('notes'),
            user_id: dbUser?.id
        }

        try {
            const res = await fetch('/api/vip/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                setIsSuccess(true)
            } else {
                alert('申請提交失敗，請稍後再試。')
            }
        } catch (error) {
            console.error(error)
            alert('發生錯誤，請稍後再試。')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-neutral-900/50 border border-white/10 rounded-2xl p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-green-400 ring-1 ring-white/10">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
                        <p className="text-neutral-400">
                            感謝您的申請。專屬顧問將會在 24 小時內聯繫您，為您開通 大客戶計畫 權限。
                        </p>
                    </div>
                    <Link href="/">
                        <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white">
                            返回首頁
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center justify-start">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="CryptoTW" className="h-4 w-auto" />
                    </div>
                    <div className="w-8" /> {/* Spacer */}
                </div>
            </header>

            <div className="max-w-lg mx-auto p-6 space-y-12">

                {/* Hero */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs font-medium uppercase tracking-wider backdrop-blur-sm mx-auto">
                        <Crown className="w-3 h-3 text-white" />
                        <span>私人客戶</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white">
                        CryptoTW 大客戶計畫
                    </h1>
                    <p className="text-neutral-400 leading-relaxed">
                        專為高淨值交易者打造。<br />
                        享有機構級費率與專屬客戶經理。
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid gap-4">
                    {[
                        { title: "零手續費", desc: "機構級費率優惠 (Maker 0%)", icon: <Diamond className="w-4 h-4" /> },
                        { title: "專屬聯繫", desc: "專屬客戶經理 1 對 1 服務", icon: <ShieldCheck className="w-4 h-4" /> },
                        { title: "私密活動", desc: "受邀參加線下私密聚會", icon: <Sparkles className="w-4 h-4" /> },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/40 border border-white/5">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                                <p className="text-xs text-neutral-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div className="h-px bg-white/10" />
                    <h3 className="text-lg font-bold text-white">立即申請</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-neutral-400">稱呼 / 姓名</Label>
                            <Input required name="name" placeholder="E.g. Mr. Chen" className="bg-neutral-900 border-white/10 focus:border-white/30 text-white h-12" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-neutral-400">聯絡方式</Label>
                                <Select name="contact_method" required defaultValue="line">
                                    <SelectTrigger className="bg-neutral-900 border-white/10 text-white h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value="line">LINE ID</SelectItem>
                                        <SelectItem value="telegram">Telegram</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-400">ID / 號碼</Label>
                                <Input required name="contact_handle" className="bg-neutral-900 border-white/10 text-white h-12" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-neutral-400">總資產規模 (AUM)</Label>
                            <Select name="asset_tier" required>
                                <SelectTrigger className="bg-neutral-900 border-white/10 text-white h-12">
                                    <SelectValue placeholder="選擇等級" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                    <SelectItem value=">50k">$50k - $200k</SelectItem>
                                    <SelectItem value=">200k">$200k - $1M</SelectItem>
                                    <SelectItem value=">1M">$1M +</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-neutral-400">慣用交易所 (選填)</Label>
                            <Input name="preferred_exchange" placeholder="E.g. Binance" className="bg-neutral-900 border-white/10 text-white h-12" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-neutral-400">備註 (選填)</Label>
                            <Textarea name="notes" placeholder="..." className="bg-neutral-900 border-white/10 text-white min-h-[100px]" />
                        </div>

                        <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 font-bold h-12 rounded-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '提交申請'}
                        </Button>

                        <p className="text-[10px] text-center text-neutral-600">
                            提交即代表同意我們的隱私權條款與服務協議。
                        </p>
                    </form>
                </div>

            </div>
        </div>
    )
}
