'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useLiff } from '@/components/LiffProvider'
import { Sparkles, Crown, Diamond, ShieldCheck, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VipPage() {
    const { isLoggedIn, dbUser } = useLiff()
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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-white mb-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">申請已提交</h2>
                        <p className="text-slate-400">
                            感謝您的申請。我們的 VIP 專屬顧問將會在 24 小時內透過您指定的聯絡方式與您聯繫，為您開通 Pro Prime 權限。
                        </p>
                        <Link href="/">
                            <Button className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white">
                                返回首頁
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-slate-100 selection:bg-amber-500/30">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-slate-800/50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-80" />
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                <div className="container relative py-20 px-4 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-amber-500/20 text-amber-500 text-xs font-medium uppercase tracking-wider mb-4 animate-fade-in-up">
                        <Crown className="w-3 h-3" /> Pro Prime
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                        專為 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">高淨值交易者</span> 打造
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        解鎖機構級費率、專屬客戶經理與線下私密聚會。
                        <br className="hidden md:block" />
                        加入 Pro Prime，體驗真正的頂級服務。
                    </p>
                </div>
            </div>

            <div className="container px-4 py-16 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* Left Column: Benefits */}
                <div className="space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-amber-500" />
                            尊榮權益
                        </h2>

                        <div className="grid gap-6">
                            {[
                                {
                                    icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
                                    title: "機構級費率優惠",
                                    desc: "直接對接交易所大客戶部門，享有 VIP 手續費等級，大幅降低交易成本。"
                                },
                                {
                                    icon: <Diamond className="w-6 h-6 text-amber-400" />,
                                    title: "專屬客戶經理",
                                    desc: "1 對 1 專屬服務窗口，解決出入金問題、帳戶解封與各類疑難雜症。"
                                },
                                {
                                    icon: <Crown className="w-6 h-6 text-amber-400" />,
                                    title: "Pro Prime 私密聚會",
                                    desc: "受邀參加僅限高淨值會員的線下晚宴、遊艇派對與行業交流會。"
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/20 transition-colors">
                                    <div className="shrink-0 pt-1">{item.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-200 mb-1">{item.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Crown className="w-40 h-40 rotate-12" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">💎 資格門檻</h3>
                        <ul className="space-y-3 text-slate-300 relative z-10">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                總資產 (AUM) &gt; <span className="text-white font-mono font-bold">$50,000 USD</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold uppercase mx-1">OR</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                月交易量 &gt; <span className="text-white font-mono font-bold">$1,000,000 USD</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Application Form */}
                <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
                    <CardHeader>
                        <CardTitle className="text-xl text-white">立即申請 Pro Prime</CardTitle>
                        <CardDescription className="text-slate-400">
                            填寫以下資訊，我們將盡快評估您的資格。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">稱呼 / 姓名</Label>
                                <Input required id="name" name="name" placeholder="E.g. Mr. Chen" className="bg-slate-950 border-slate-800 focus:border-amber-500/50 text-white" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_method" className="text-slate-300">聯絡方式</Label>
                                    <Select name="contact_method" required defaultValue="line">
                                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                            <SelectValue placeholder="選擇方式" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="line">LINE ID</SelectItem>
                                            <SelectItem value="telegram">Telegram</SelectItem>
                                            <SelectItem value="phone">電話</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_handle" className="text-slate-300">ID / 號碼</Label>
                                    <Input required id="contact_handle" name="contact_handle" placeholder="@username" className="bg-slate-950 border-slate-800 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="asset_tier" className="text-slate-300">預估資產規模 (USDT equivalent)</Label>
                                <Select name="asset_tier" required>
                                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                        <SelectValue placeholder="請選擇級距" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                        <SelectItem value=">50k">$50,000 - $200,000</SelectItem>
                                        <SelectItem value=">200k">$200,000 - $1,000,000</SelectItem>
                                        <SelectItem value=">1M">$1,000,000 +</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="trading_volume_monthly" className="text-slate-300">月平均交易量 (選填)</Label>
                                <Input id="trading_volume_monthly" name="trading_volume_monthly" placeholder="E.g. $5M / Month" className="bg-slate-950 border-slate-800 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preferred_exchange" className="text-slate-300">慣用交易所 (選填)</Label>
                                <Input id="preferred_exchange" name="preferred_exchange" placeholder="E.g. Binance, OKX" className="bg-slate-950 border-slate-800 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-slate-300">備註 / 特殊需求</Label>
                                <Textarea id="notes" name="notes" placeholder="告訴我們您需要的協助..." className="bg-slate-950 border-slate-800 text-white min-h-[100px]" />
                            </div>

                            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold h-12 text-lg shadow-lg shadow-amber-500/20 border-0" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '提交申請 🚀'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-slate-950/30 border-t border-slate-800 py-4">
                        <p className="text-xs text-slate-500 text-center w-full">
                            您的資訊將嚴格保密，僅用於審核資格與聯繫使用。
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
