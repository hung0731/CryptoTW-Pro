'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'

function LoginForm() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(
        searchParams.get('error') === 'unauthorized'
            ? 'Access Denied: Your email is not authorized for admin access.'
            : null
    )
    const [sent, setSent] = useState(false)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: typeof window !== 'undefined'
                        ? `${window.location.origin}/auth/callback?next=/admin`
                        : undefined
                }
            })

            if (error) {
                setError(error.message)
            } else {
                setSent(true)
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-neutral-900 border-white/10 text-center">
                    <CardHeader className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 ring-1 ring-green-500/30">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
                        <p className="text-neutral-400">
                            We've sent a magic link to <span className="text-white font-medium">{email}</span>.
                            <br />Click the link to sign in.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full border-white/10 text-white hover:bg-white/5"
                            onClick={() => setSent(false)}
                        >
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-neutral-900 border-white/10">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white ring-1 ring-white/10">
                        <Mail className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
                    <p className="text-sm text-neutral-400">Sign in via Magic Link</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black border-white/10 text-white"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded border border-red-900/50 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                            Send Magic Link
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
