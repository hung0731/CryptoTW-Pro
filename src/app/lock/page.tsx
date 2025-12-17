'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function LockPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/site-lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (res.ok) {
                // Determine redirect path from query param or default to home
                const params = new URLSearchParams(window.location.search)
                const next = params.get('next') || '/'
                router.replace(next as string)
                router.refresh()
            } else {
                setError('密碼錯誤')
            }
        } catch (e) {
            setError('發生錯誤，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 mb-4">
                        <Lock className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">網站已鎖定</h1>
                    <p className="text-sm text-neutral-400">目前網站處於搶先體驗階段<br />請輸入訪問密碼以繼續</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="輸入密碼..."
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F1AD9] focus:border-transparent transition-all text-center tracking-widest placeholder:tracking-normal"
                            autoFocus
                        />
                        {error && (
                            <div className="text-center text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full py-3 bg-[#1F1AD9] hover:bg-[#1512b0] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                        {loading ? '驗證中...' : '進入網站'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-xs text-neutral-600">CryptoTW Pro © 2025</p>
                </div>
            </div>
        </div>
    )
}
