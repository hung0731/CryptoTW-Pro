'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/components/LiffProvider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, ExternalLink, Loader2, ChevronRight, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import GlobalLoader from '@/components/GlobalLoader'
import { trackEvent } from '@/lib/analytics'

export default function JoinPage() {
    const { dbUser, profile, isLoading, liffObject } = useLiff()
    const router = useRouter()
    const { toast } = useToast()

    const [uid, setUid] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')
    const [autoVerified, setAutoVerified] = useState(false)
    const hasTrackedView = useRef(false)

    // Track join_view on first render
    useEffect(() => {
        if (!hasTrackedView.current) {
            trackEvent('join_view')
            hasTrackedView.current = true
        }
    }, [])

    // Check if user is already Pro
    useEffect(() => {
        if (isLoading) return

        const status = dbUser?.membership_status
        const isPro = status === 'pro' || status === 'lifetime'

        if (isPro) {
            toast({
                title: "✅ 你已經是 Pro 會員",
                description: "歡迎回來！享受完整的 Pro 功能。",
            })
            router.replace('/')
        }
    }, [dbUser, isLoading, router, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedUid = uid.trim()

        // Validate UID format: must be numeric, 5-20 digits
        if (!trimmedUid || !profile?.userId) return
        if (!/^\d{5,20}$/.test(trimmedUid)) {
            toast({
                title: "UID 格式錯誤",
                description: "請輸入 5-20 位的數字 UID",
                variant: "destructive"
            })
            return
        }

        setSubmitting(true)
        try {
            // Get access token from LIFF for secure API call
            const accessToken = liffObject?.getAccessToken()
            if (!accessToken) {
                toast({
                    title: "認證錯誤",
                    description: "請重新登入 LINE",
                    variant: "destructive"
                })
                return
            }

            const res = await fetch('/api/binding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    exchange: 'okx',
                    uid: trimmedUid
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSubmitted(true)
                setResponseMessage(data.message || '提交成功')
                setAutoVerified(data.autoVerified || false)

                if (data.autoVerified) {
                    // Track successful Pro completion
                    trackEvent('pro_complete')
                    // Auto redirect after success
                    setTimeout(() => router.push('/'), 3000)
                }
            } else {
                toast({
                    title: "提交失敗",
                    description: data.error || '請稍後再試',
                    variant: "destructive"
                })
            }
        } catch (e) {
            toast({
                title: "網路錯誤",
                description: "請檢查網路連線",
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (isLoading) return <GlobalLoader />

    // Check if already Pro
    const status = dbUser?.membership_status
    const isPro = status === 'pro' || status === 'lifetime'
    if (isPro) return <GlobalLoader />

    // Success State
    if (submitted) {
        return (
            <main className="min-h-screen bg-black text-white font-sans">
                <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${autoVerified ? 'bg-white' : 'bg-white/10 border border-white/20'
                        }`}>
                        {autoVerified ? (
                            <Check className="w-10 h-10 text-black" />
                        ) : (
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold mb-3">
                        {autoVerified ? '🎉 Pro 會員已開通' : '📝 已提交審核'}
                    </h1>

                    <p className="text-neutral-400 mb-8 max-w-sm leading-relaxed">
                        {responseMessage}
                    </p>

                    <Link href="/">
                        <Button className="bg-white text-black hover:bg-neutral-200 rounded-full px-8 h-12 font-bold">
                            {autoVerified ? '開始使用' : '返回首頁'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

                <div className="relative px-6 pt-12 pb-8">
                    {/* Back to Home */}
                    <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 mb-6">
                        ← 返回首頁
                    </Link>

                    {/* Time Estimate Badge */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            約 3 分鐘完成
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-2xl font-bold text-center mb-3 tracking-tight">
                        免費解鎖 Pro｜3 分鐘完成
                    </h1>

                    <p className="text-neutral-400 text-center text-sm max-w-xs mx-auto leading-relaxed">
                        不影響交易，OKX 通過驗證後永久免費享有 Pro 會員權益
                    </p>
                </div>
            </section>

            {/* Progress Indicator */}
            <section className="px-6 pb-4">
                <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full w-0 bg-white rounded-full" />
                        </div>
                    ))}
                </div>
                <p className="text-center text-[10px] text-neutral-600 mt-2">完成以下 4 步驟</p>
            </section>

            {/* Requirements Section */}
            <section className="px-6 pb-8">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
                    <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
                        開通條件
                    </h2>

                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center shrink-0">
                            1
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">使用推薦碼註冊 OKX</h3>
                            <p className="text-sm text-neutral-500 mb-3">
                                確保邀請碼為 <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">CTW20</span>
                            </p>
                            <a
                                href="https://www.okx.com/join/CTW20"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('join_click')}
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-[#E0E0E0]"
                            >
                                前往 OKX 註冊
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            {/* Partner Badge */}
                            <p className="text-[10px] text-neutral-600 mt-2">
                                🤝 OKX 官方聯盟合作夥伴
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-white/5" />

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            2
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">完成 KYC 身份驗證</h3>
                            <p className="text-sm text-neutral-500">
                                在 OKX App 內完成 KYC2 等級的身份驗證
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-white/5" />

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            3
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">入金至少 $1 USDT</h3>
                            <p className="text-sm text-neutral-500">
                                完成首次入金以啟用交易功能
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-white/5" />

                    {/* Step 4 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            4
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">提交 UID 自動開通</h3>
                            <p className="text-sm text-neutral-500">
                                填寫下方表單，系統將自動驗證並開通權限
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* UID Form Section */}
            <section className="px-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="uid" className="text-sm font-bold text-neutral-400">
                            OKX UID
                        </Label>
                        <Input
                            id="uid"
                            type="text"
                            placeholder="例如：123456789"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            disabled={submitting}
                            className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600 text-lg font-mono rounded-xl focus:border-white/30 focus:ring-0"
                        />
                        <p className="text-xs text-neutral-600">
                            在 OKX App 內點選「個人中心」即可查看 UID
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={!uid.trim() || submitting}
                        className="w-full h-14 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl font-bold text-base"
                    >
                        {submitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                提交驗證
                                <ChevronRight className="ml-1 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            </section>

            {/* Pro Benefits Section */}
            <section className="px-6 pb-8">
                <div className="border-t border-white/5 pt-6">
                    <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        解鎖後你可以...
                    </h2>

                    {/* Top Features - Highlighted */}
                    <div className="space-y-3 mb-4">
                        {[
                            { emoji: '🎯', title: 'AI 每日判斷', desc: '一句話告訴你今天偏多還是偏空' },
                            { emoji: '📊', title: '市場快照', desc: '5 秒掃完槓桿、情緒、大戶動向' },
                            { emoji: '🐋', title: '巨鯨追蹤', desc: '頂級交易員多空持倉即時更新' },
                            { emoji: '📅', title: '財經日曆', desc: 'CPI/FOMC/非農，附帶歷史勝率' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-xl">{f.emoji}</span>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{f.title}</h4>
                                    <p className="text-xs text-neutral-500">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Secondary Features */}
                    <div className="space-y-2 mb-4">
                        {[
                            { emoji: '💹', title: '合約數據', desc: '爆倉量、資金費率、多空比' },
                            { emoji: '📰', title: '盤面脈絡', desc: 'AI 整理今日影響行情的關鍵事件' },
                            { emoji: '📚', title: '歷史復盤', desc: '過去重大事件的市場反應分析' },
                            { emoji: '🔔', title: 'LINE 推播', desc: '每日早報 + 重大事件即時通知' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 py-2">
                                <span className="text-base">{f.emoji}</span>
                                <div className="flex-1">
                                    <span className="text-sm text-neutral-300">{f.title}</span>
                                    <span className="text-xs text-neutral-600 ml-2">{f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Features Tags */}
                    <div className="flex flex-wrap gap-2">
                        {['Coinbase 溢價', 'ETF 資金流', '穩定幣供應', '恐懼指數', '價格預測', 'VIP 社群'].map((name, i) => (
                            <span key={i} className="text-xs text-neutral-500 bg-white/5 px-2.5 py-1 rounded-full">
                                + {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Back to Home Link */}
            <section className="px-6 pb-8">
                <Link href="/" className="block text-center text-sm text-[#525252] hover:text-[#808080]">
                    ← 返回首頁
                </Link>
            </section>
        </main>
    )
}
