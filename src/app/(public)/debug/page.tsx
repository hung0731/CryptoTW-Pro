'use client'

import React, { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { UnifiedHeader } from '@/components/UnifiedHeader'

export default function DebugPage() {
    const { liffObject, isLoggedIn, dbUser, error, login, logout, isLoading } = useLiff()
    const [mounted, setMounted] = useState(false)
    const [logs, setLogs] = useState<string[]>([])

    useEffect(() => {
        setMounted(true)
        // Override console to capture logs
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn

        console.log = (...args) => {
            setLogs(prev => [...prev.slice(-19), `[LOG] ${args.join(' ')}`])
            originalLog(...args)
        }
        console.error = (...args) => {
            setLogs(prev => [...prev.slice(-19), `[ERR] ${args.join(' ')}`])
            originalError(...args)
        }
        console.warn = (...args) => {
            setLogs(prev => [...prev.slice(-19), `[WARN] ${args.join(' ')}`])
            originalWarn(...args)
        }

        return () => {
            console.log = originalLog
            console.error = originalError
            console.warn = originalWarn
        }
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <UnifiedHeader level="secondary" title="LIFF Debugger" showBack />

            <div className="p-4 space-y-6">
                <section className="space-y-2 border border-white/10 p-4 rounded-xl bg-neutral-900/50">
                    <h2 className="font-bold text-green-400">Status</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        <span className="text-neutral-400">LIFF Init:</span>
                        <span>{liffObject ? 'YES' : 'NO'}</span>

                        <span className="text-neutral-400">In Client:</span>
                        <span>{liffObject?.isInClient() ? 'YES' : 'NO'}</span>

                        <span className="text-neutral-400">Logged In:</span>
                        <span>{isLoggedIn ? 'YES' : 'NO'}</span>

                        <span className="text-neutral-400">Loading:</span>
                        <span>{isLoading ? 'YES' : 'NO'}</span>

                        <span className="text-neutral-400">DB User:</span>
                        <span>{dbUser ? 'YES' : 'NO'}</span>
                    </div>
                </section>

                <section className="space-y-4">
                    <button
                        onClick={() => login()}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all active:scale-95"
                    >
                        Force Login
                    </button>

                    <button
                        onClick={() => logout()}
                        className="w-full bg-red-900/50 hover:bg-red-800/50 py-3 rounded-xl text-red-200 text-sm"
                    >
                        Logout & Clear Cache
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full border border-white/20 py-3 rounded-xl text-sm"
                    >
                        Reload Page
                    </button>
                </section>

                <section className="space-y-2">
                    <h2 className="font-bold text-yellow-400">Environment</h2>
                    <div className="text-xs font-mono text-neutral-400 break-all bg-black/50 p-2 rounded border border-white/5">
                        <p>UA: {navigator.userAgent}</p>
                        <p className="mt-2">URL: {window.location.href}</p>
                        <p className="mt-2">LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID}</p>
                    </div>
                </section>

                {error && (
                    <section className="space-y-2">
                        <h2 className="font-bold text-red-500">Captured Error</h2>
                        <div className="text-xs font-mono bg-red-950/30 p-2 rounded text-red-200 break-all border border-red-900">
                            {error.message}
                            <br />
                            {error.stack}
                        </div>
                    </section>
                )}

                <section className="space-y-2">
                    <h2 className="font-bold text-neutral-400">Recent Logs</h2>
                    <div className="text-[10px] font-mono bg-black p-2 rounded border border-white/10 h-40 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-white/5 pb-1">{log}</div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
