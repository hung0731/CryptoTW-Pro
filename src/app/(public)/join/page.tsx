'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/components/LiffProvider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, ExternalLink, Loader2, ChevronRight, ArrowRight, Sparkles, Info, Bell } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
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

    const [selectedExchange, setSelectedExchange] = useState<'okx' | 'lbank'>('okx')

    // Track join_view on first render
    useEffect(() => {
        if (!hasTrackedView.current) {
            trackEvent('join_view')
            hasTrackedView.current = true
        }
    }, [])

    // Check membership status
    useEffect(() => {
        if (isLoading) return

        const status = dbUser?.membership_status
        const isPro = status === 'pro' || status === 'lifetime'
        const isPending = status === 'pending'

        if (isPro) {
            toast({
                title: "✅ 你已經是 Pro 會員",
                description: "歡迎回來！享受完整的 Pro 功能。",
            })
            router.replace('/')
        }

        if (isPending) {
            setSubmitted(true)
            setResponseMessage('您的 UID 審核正在進行中，通常在 24 小時內完成。開通後我們將透過 LINE 通知您！')
            setAutoVerified(false)
        }
    }, [dbUser, isLoading, router, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedUid = uid.trim()

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
                    exchange: selectedExchange,
                    uid: trimmedUid
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSubmitted(true)
                if (selectedExchange === 'lbank') {
                    setResponseMessage('LBank 數據通常有 24 小時延遲。系統將在每日更新後自動為您開通 Pro 權限，請耐心等候！')
                } else {
                    setResponseMessage(data.message || '提交成功')
                }
                setAutoVerified(data.autoVerified || false)

                if (data.autoVerified) {
                    trackEvent('pro_complete')
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
    const isPro = dbUser?.membership_status === 'pro' || dbUser?.membership_status === 'lifetime'
    if (isPro) return <GlobalLoader />

    // Summary Success/Pending State
    if (submitted) {
        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-6", autoVerified ? "bg-white" : "bg-neutral-900 border border-white/10")}>
                    {autoVerified ? <Check className="w-8 h-8 text-black" /> : <Loader2 className="w-8 h-8 text-white animate-spin" />}
                </div>
                <h1 className="text-xl font-bold mb-2">{autoVerified ? 'Pro 會員已開通' : '已提交審核'}</h1>
                <p className="text-sm text-neutral-500 mb-8 max-w-[280px] leading-relaxed">{responseMessage}</p>
                <Link href="/">
                    <Button className="bg-white text-black hover:bg-neutral-200 rounded-full px-8 h-11 font-bold">回到首頁</Button>
                </Link>
            </main>
        )
    }

    const EXCHANGE_CONFIG = {
        okx: {
            name: 'OKX',
            desc: '全球前三大交易所',
            code: 'CTWPRO',
            link: 'https://www.okx.com/join/CTWPRO',
            icon: '/exchange/OKX.svg',
            badges: ['系統自動開通', '官方合作'],
            bg: 'bg-black'
        },
        lbank: {
            name: 'LBANK',
            desc: '新興潛力交易所',
            code: 'CTWPRO',
            link: 'https://www.lbank.com/login/?icode=CTWPRO',
            icon: '/exchange/LBANK.svg',
            badges: ['系統自動開通', '限時加碼'],
            bg: 'bg-[#1A1A1A]' // Fallback if logo needs contrast
        }
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-white/10 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-neutral-900/20 to-transparent pointer-events-none" />

            {/* Header Area */}
            <div className="relative px-5 pt-8 pb-4 max-w-lg mx-auto z-10">
                <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600 hover:text-neutral-400 mb-8 uppercase tracking-widest font-bold">
                    ← Back to Home
                </Link>

                {/* HERO FEATURE MATRIX */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-2" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">All-in-One Pro Access</span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                        免費解鎖全站功能
                    </h1>
                    <p className="text-sm text-neutral-400 mb-8">
                        無需付費，僅需綁定 UID 即刻享有機構級數據
                    </p>

                    {/* Feature Grid - The "Wow" Factor */}
                    <div className="grid grid-cols-2 gap-2 text-left mb-8">
                        {[
                            { icon: "🐋", title: "巨鯨追蹤", desc: "頂級交易員持倉與多空動向" },
                            { icon: "🌊", title: "ETF 資金流", desc: "美國比特幣現貨 ETF 即時數據" },
                            { icon: "💰", title: "Coinbase 溢價", desc: "識別美資機構買賣盤力道" },
                            { icon: "📊", title: "合約數據盤", desc: "爆倉量、持倉量、資金費率" },
                            { icon: "🤖", title: "AI 每日判斷", desc: "多空趨勢一針見血解讀" },
                            { icon: "🔔", title: "盤口速讀", desc: "每日早報 LINE 自動推播" },
                            { icon: "🗓️", title: "財經日曆", desc: "CPI/FOMC 重大事件勝率回測" },
                            { icon: "📚", title: "深度復盤", desc: "歷史重大行情完整覆盤報告" }
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-white/5 bg-neutral-900/20 hover:bg-neutral-900/40 transition-colors">
                                <span className="text-base leading-none mt-0.5">{f.icon}</span>
                                <div>
                                    <h4 className="text-[11px] font-bold text-white leading-tight mb-0.5">{f.title}</h4>
                                    <p className="text-[9px] text-neutral-500 leading-tight">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                    <h2 className="text-sm font-bold text-white mb-6 flex items-center justify-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/50" />
                        簡單三步驟免費開通
                        <span className="w-1 h-1 rounded-full bg-white/50" />
                    </h2>
                </div>

                {/* Exchange Tabs - Refined for "Minimal" aesthetic */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {(['okx', 'lbank'] as const).map((ex) => (
                        <button
                            key={ex}
                            onClick={() => setSelectedExchange(ex)}
                            className={cn(
                                "group relative flex flex-col items-center justify-center py-6 rounded-2xl border transition-all duration-300",
                                selectedExchange === ex
                                    ? "bg-[#0A0A0A] border-white/20 shadow-2xl"
                                    : "bg-transparent border-white/5 hover:bg-[#0A0A0A] hover:border-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 opacity-0 transition-opacity duration-300 rounded-2xl",
                                selectedExchange === ex ? "opacity-100" : "group-hover:opacity-30",
                                "bg-gradient-to-b from-white/[0.03] to-transparent"
                            )} />

                            {/* Icon - Smaller with more whitespace */}
                            <div className="relative z-10 h-5 mb-3 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">

                                <img
                                    src={EXCHANGE_CONFIG[ex].icon}
                                    alt={EXCHANGE_CONFIG[ex].name}
                                    className="h-full w-auto object-contain"
                                />
                            </div>

                            <span className={cn(
                                "relative z-10 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors",
                                selectedExchange === ex ? "text-white" : "text-neutral-600"
                            )}>
                                {EXCHANGE_CONFIG[ex].name}
                            </span>

                            {/* Active Indicator Pilled */}
                            {selectedExchange === ex && (
                                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white shadow-[0_-2px_8px_rgba(255,255,255,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Unified Step Card */}
                <div className="space-y-6">
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none" />

                        <div className="relative z-10 space-y-7">
                            {/* Step 1: Register */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-lg shadow-white/20">1</div>
                                    <div className="w-px flex-1 bg-white/10" />
                                </div>
                                <div className="flex-1 pb-1">
                                    <h3 className="text-xs font-bold text-neutral-200 mb-1.5">完成註冊與入金</h3>
                                    <p className="text-[10px] text-neutral-500 mb-3 leading-relaxed">
                                        使用邀請碼 <span className="text-white font-mono font-bold mx-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">{EXCHANGE_CONFIG[selectedExchange].code}</span> 並入金 $1 啟用。
                                    </p>
                                    <a
                                        href={EXCHANGE_CONFIG[selectedExchange].link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-[10px] font-bold hover:brightness-90 active:scale-95 transition-all"
                                    >
                                        前往 {EXCHANGE_CONFIG[selectedExchange].name} 註冊
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* Step 2: KYC Check */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border border-white/20 text-neutral-400 text-[10px] font-bold flex items-center justify-center">2</div>
                                    <div className="w-px flex-1 bg-white/10" />
                                </div>
                                <div className="flex-1 pb-1">
                                    <h3 className="text-xs font-bold text-neutral-200 mb-1.5">完成身分驗證</h3>
                                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                                        於交易所 APP 內完成 KYC 認證，確保為真實用戶以獲得 Pro 資格。
                                    </p>
                                </div>
                            </div>

                            {/* Step 3: Submission */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-5 h-5 rounded-full border border-white/20 text-neutral-400 text-[10px] font-bold flex items-center justify-center">3</div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold text-neutral-200 mb-3">提交 UID 即時開通</h3>
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div className="relative group">
                                            <Input
                                                type="text"
                                                placeholder={`輸入 ${EXCHANGE_CONFIG[selectedExchange].name} UID`}
                                                value={uid}
                                                onChange={(e) => setUid(e.target.value)}
                                                disabled={submitting}
                                                className="h-10 bg-black border-white/10 text-xs font-mono placeholder:text-neutral-700 rounded-lg focus:border-white/30 transition-all pl-3"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={!uid.trim() || submitting}
                                            className="w-full h-10 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-700 rounded-lg font-bold text-[10px] tracking-wide"
                                        >
                                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spinish" /> : '立即驗證並解鎖 PRO'}
                                        </Button>
                                    </form>
                                    <p className="text-[9px] text-neutral-600 mt-3 text-center flex items-center justify-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        系統自動驗證中，符合資格者將即時開通
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OKX Existing User Rebind Program */}
                    <div className="mt-6 bg-gradient-to-br from-neutral-900/80 to-neutral-950 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                        {/* Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white mb-1">已有 OKX 帳號？</h3>
                                <p className="text-[10px] text-neutral-500 leading-relaxed">
                                    現有用戶可透過「換綁計劃」綁定至 CryptoTW Pro 節點，同樣享有 Pro 權益！
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-[10px] text-neutral-400 mb-4">
                            <div className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-neutral-500">1</span>
                                <span>點擊下方連結，登入你的 OKX 帳號</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-neutral-500">2</span>
                                <span>輸入邀請碼 <span className="font-mono text-white bg-white/10 px-1 py-0.5 rounded">CTWPRO</span> 並填寫換綁原因</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-neutral-500">3</span>
                                <span>審核通過後（約 1 工作日），回來提交 UID 即可開通</span>
                            </div>
                        </div>

                        <a
                            href="https://okx.com/ul/J6l2R5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <img src="/exchange/OKX.svg" alt="OKX" className="h-4 opacity-80" />
                                <span className="text-[11px] font-bold text-amber-200">現有用戶換綁申請</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                        </a>

                        <p className="text-[9px] text-neutral-600 mt-3 flex items-center gap-1.5">
                            <Info className="w-3 h-3" />
                            符合條件：180 天內無其他節點綁定紀錄
                        </p>
                    </div>

                    {/* Business Model / Why Free? */}
                    <div className="pt-8 pb-4 border-t border-white/5">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-[10px] font-bold text-white uppercase tracking-wider mb-3">為什麼免費？</h3>
                                <p className="text-[10px] text-neutral-500 leading-relaxed mb-3">
                                    我們的營運模式很簡單：您使用我們的邀請碼註冊交易所，交易所會根據交易量支付行銷費用給我們。
                                </p>
                                <p className="text-[10px] text-neutral-500 leading-relaxed">
                                    我們會將這筆收入 100% 投入開發更多強大的數據功能與網站維護。這是一個正向循環：<span className="text-neutral-300">您獲得免費的高級工具，我們獲得開發資源。</span>
                                </p>
                            </div>

                            {/* Policy Link */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <Link href="/disclosure" className="text-[9px] text-neutral-600 hover:text-neutral-400 underline decoration-neutral-800 underline-offset-2 transition-colors">
                                    網站政策與利益公開申明
                                </Link>
                                <span className="text-[9px] text-neutral-700">© CryptoTW Pro</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
