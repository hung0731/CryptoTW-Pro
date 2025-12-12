'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useLiff } from '@/components/LiffProvider'
import { Sparkles, Crown, Diamond, ShieldCheck, CheckCircle, Loader2, ChevronRight, Gem, Zap, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { Badge } from '@/components/ui/badge'

export default function VipPage() {
    const { dbUser, isLoading: isAuthLoading } = useLiff()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    // Redirect if already Pro/Lifetime? 
    // User probably wants to see this page even if Pro, maybe to upgrade to VIP?
    // Let's keep it accessible but maybe show status.

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
            <div className="min-h-screen bg-black flex items-center justify-center p-6 pb-24 font-sans">
                <div className="w-full max-w-md bg-neutral-900 border border-white/5 rounded-xl p-8 text-center space-y-6 shadow-2xl">
                    <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 ring-1 ring-green-500/20">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Application Submitted</h2>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            感謝您的申請。專屬顧問將會在 24 小時內聯繫您，為您開通 大客戶計畫 權限。
                        </p>
                    </div>
                    <Link href="/">
                        <Button className="w-full bg-white text-black hover:bg-neutral-200 rounded-full font-bold">
                            返回首頁
                        </Button>
                    </Link>
                </div>
                <BottomNav />
            </div>
        )
    }

    const benefits = [
        { title: "Zero Fees", subtitle: "Maker 0% 機構級費率", icon: <Diamond className="w-4 h-4 text-blue-400" />, active: true },
        { title: "Private Manager", subtitle: "1 對 1 專屬客戶經理", icon: <ShieldCheck className="w-4 h-4 text-green-400" />, active: true },
        { title: "Exclusive Events", subtitle: "線下私密聚會邀請", icon: <Sparkles className="w-4 h-4 text-purple-400" />, active: true },
        { title: "Priority Support", subtitle: "24/7 優先技術支援", icon: <Zap className="w-4 h-4 text-yellow-400" />, active: true },
    ]

    return (
        <main className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="grid grid-cols-3 items-center px-4 h-14 max-w-lg mx-auto">
                    <div className="flex items-center justify-start">
                        {/* Empty left slot */}
                    </div>
                    <div className="flex items-center justify-center">
                        <img src="/logo.svg" alt="Logo" className="h-4 w-auto" />
                    </div>
                    <div className="flex items-center justify-end">
                        {/* Empty right slot */}
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto p-4 space-y-8">

                {/* Hero Section (Data Style) */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-1">
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            大客戶計畫
                        </h1>
                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-[10px] px-2 py-0.5 uppercase tracking-wider">
                            Invite Only
                        </Badge>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Crown className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10 space-y-2">
                            <p className="text-sm text-neutral-400 leading-relaxed font-light">
                                專為高淨值交易者打造的頂級服務體系。<br />
                                提供機構級費率、專屬顧問與私密權益。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits List (Data Grid Style) */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Privileges</h2>
                    <div className="grid gap-2">
                        {benefits.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-white/5 hover:bg-white/5 transition-all cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">{item.title}</h3>
                                        <p className="text-[10px] text-neutral-500 font-mono">{item.subtitle}</p>
                                    </div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Form */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-1">
                        <Lock className="w-3 h-3 text-neutral-500" />
                        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Application</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900/30 p-4 rounded-xl border border-white/5">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-neutral-500 uppercase tracking-wider ml-1">Full Name</Label>
                                <Input required name="name" placeholder="您的稱呼" className="bg-black/50 border-white/10 focus:border-white/30 text-white h-10 text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] text-neutral-500 uppercase tracking-wider ml-1">Contact Method</Label>
                                    <Select name="contact_method" required defaultValue="line">
                                        <SelectTrigger className="bg-black/50 border-white/10 text-white h-10 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                            <SelectItem value="line">LINE ID</SelectItem>
                                            <SelectItem value="telegram">Telegram</SelectItem>
                                            <SelectItem value="phone">Phone</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] text-neutral-500 uppercase tracking-wider ml-1">Handle / Number</Label>
                                    <Input required name="contact_handle" placeholder="ID" className="bg-black/50 border-white/10 text-white h-10 text-sm" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-neutral-500 uppercase tracking-wider ml-1">Asset Tier (AUM)</Label>
                                <Select name="asset_tier" required>
                                    <SelectTrigger className="bg-black/50 border-white/10 text-white h-10 text-sm">
                                        <SelectValue placeholder="選擇資產規模" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value=">50k">$50k - $200k</SelectItem>
                                        <SelectItem value=">200k">$200k - $1M</SelectItem>
                                        <SelectItem value=">1M">$1M +</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-neutral-500 uppercase tracking-wider ml-1">Preferred Exchange</Label>
                                <Input name="preferred_exchange" placeholder="慣用交易所" className="bg-black/50 border-white/10 text-white h-10 text-sm" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 font-bold h-10 mt-2 rounded-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Gem className="w-4 h-4 mr-2" />}
                            Submit Application
                        </Button>
                    </form>
                </div>

            </div>
            <BottomNav />
        </main>
    )
}
