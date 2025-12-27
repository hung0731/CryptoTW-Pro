'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/admin'

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
                },
            })

            if (error) {
                setError(error.message)
            } else {
                setSent(true)
            }
        } catch (e) {
            setError('發生未預期的錯誤')
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4400]/10 border border-[#FF4400]/20 mb-4">
                        <ArrowRight className="w-8 h-8 text-[#FF4400]" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Check Your Email</h1>
                    <p className="text-neutral-400">
                        我們已發送登入連結至 <span className="text-white">{email}</span>
                        <br />
                        請點擊信件中的連結以登入管理後台
                    </p>
                    <Button
                        variant="outline"
                        className="mt-8 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900"
                        onClick={() => setSent(false)}
                    >
                        返回登入頁面
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 mb-4 ring-1 ring-white/5">
                        <Lock className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Admin Access</h1>
                    <p className="text-sm text-neutral-400">請輸入 Email 以獲取 Magic Link</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-neutral-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-700 focus:ring-neutral-700"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="bg-neutral-900 border-[#333] text-[#FF4400]">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-white text-black hover:bg-neutral-200"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                        發送登入連結
                    </Button>
                </form>

                <div className="text-center text-xs text-neutral-600">
                    Protected Area · Authorized Personnel Only
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
