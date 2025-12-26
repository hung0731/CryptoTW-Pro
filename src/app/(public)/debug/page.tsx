'use client'

import React, { useEffect, useState } from 'react'
import { useLiff } from '@/components/LiffProvider'
import { UnifiedHeader } from '@/components/UnifiedHeader'

export default function DebugPage() {
    const { liffObject, isLoggedIn, dbUser, error, login, logout, isLoading } = useLiff()
    const [mounted, setMounted] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [networkStatus, setNetworkStatus] = useState<'checking' | 'ok' | 'fail'>('checking')
    const [cdnCheck, setCdnCheck] = useState<'checking' | 'ok' | 'fail'>('checking')

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    useEffect(() => {
        setMounted(true)
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn

        console.log = (...args) => {
            addLog(`[LOG] ${args.join(' ')}`)
            originalLog(...args)
        }
        console.error = (...args) => {
            addLog(`[ERR] ${args.join(' ')}`)
            originalError(...args)
        }
        console.warn = (...args) => {
            addLog(`[WARN] ${args.join(' ')}`)
            originalWarn(...args)
        }

        // Network Checks
        checkConnectivity()

        return () => {
            console.log = originalLog
            console.error = originalError
            console.warn = originalWarn
        }
    }, [])

    const checkConnectivity = async () => {
        try {
            await fetch('/icon.png', { method: 'HEAD' })
            setNetworkStatus('ok')
            addLog('Self connectivity: OK')
        } catch (e) {
            setNetworkStatus('fail')
            addLog(`Self connectivity: FAIL`)
        }

        try {
            // Check LIFF CDN reachability by loading it as text (proxy might block, but useful to try)
            // Or just check if window.liff exists implies it loaded.
            if ((window as any).liff) {
                setCdnCheck('ok')
                addLog('LIFF Global Object: FOUND')
            } else {
                setCdnCheck('fail')
                addLog('LIFF Global Object: MISSING')
            }
        } catch (e) {
            setCdnCheck('fail')
            addLog(`CDN check error: ${e}`)
        }
    }

    const testInit = async () => {
        addLog('Testing Manual Init...')
        try {
            if (!(window as any).liff) throw new Error('window.liff is missing')
            await (window as any).liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
            addLog('Manual Init Success')
        } catch (e) {
            addLog(`Manual Init Failed: ${e}`)
        }
    }

    const dumpLiff = () => {
        if (!(window as any).liff) {
            addLog('window.liff is undefined')
            return
        }
        const l = (window as any).liff
        addLog(`ID: ${l.id}`)
        addLog(`Ready: ${l.ready}`)
        addLog(`OS: ${l.getOS()}`)
        addLog(`Ver: ${l.getVersion()}`)
        addLog(`Lang: ${l.getLanguage()}`)
        addLog(`InClient: ${l.isInClient()}`)
        addLog(`LoggedIn: ${l.isLoggedIn()}`)
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-black text-white pb-20 font-mono text-sm">
            <UnifiedHeader level="secondary" title="Advanced Debugger" showBack />

            <div className="p-4 space-y-6">
                {/* 1. Health Checks */}
                <section className="space-y-2 border border-white/10 p-4 rounded-xl bg-neutral-900/50">
                    <h2 className="font-bold text-blue-400">Health Check</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <span className="text-neutral-400">Self Network:</span>
                        <span className={networkStatus === 'ok' ? 'text-green-500' : 'text-red-500'}>{networkStatus.toUpperCase()}</span>

                        <span className="text-neutral-400">LIFF Global:</span>
                        <span className={cdnCheck === 'ok' ? 'text-green-500' : 'text-red-500'}>{cdnCheck.toUpperCase()}</span>

                        <span className="text-neutral-400">Provider Loading:</span>
                        <span>{isLoading ? 'YES' : 'NO'}</span>

                        <span className="text-neutral-400">Local Cache:</span>
                        <span>{localStorage.getItem('dbUser') ? 'PRESENT' : 'EMPTY'}</span>
                    </div>
                </section>

                {/* 2. Actions */}
                <section className="grid grid-cols-2 gap-3">
                    <button onClick={() => login()} className="bg-blue-600 py-3 rounded text-white font-bold">
                        Provider Login
                    </button>
                    <button onClick={() => logout()} className="bg-red-900/60 py-3 rounded text-red-200">
                        Reset App
                    </button>
                    <button onClick={testInit} className="bg-neutral-800 border border-white/20 py-3 rounded text-white">
                        Test Init
                    </button>
                    <button onClick={dumpLiff} className="bg-neutral-800 border border-white/20 py-3 rounded text-white">
                        Dump Info
                    </button>
                    <button onClick={() => window.location.reload()} className="col-span-2 border border-white/20 py-3 rounded">
                        Force Reload
                    </button>
                </section>

                {/* 3. Provider State */}
                <section className="space-y-2 border border-white/10 p-4 rounded-xl bg-neutral-900/50">
                    <h2 className="font-bold text-green-400">Context State</h2>
                    <pre className="text-[10px] overflow-auto max-h-40 bg-black p-2 rounded">
                        {JSON.stringify({
                            liffObject: !!liffObject,
                            isLoggedIn,
                            dbUser: dbUser ? 'Found' : 'Null',
                            error: error ? error.message : 'None'
                        }, null, 2)}
                    </pre>
                </section>

                {/* 4. Logs */}
                <section className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-yellow-400">Live Logs</h2>
                        <button onClick={() => setLogs([])} className="text-xs text-neutral-500">Clear</button>
                    </div>
                    <div className="text-[10px] font-mono bg-black p-2 rounded border border-white/10 h-64 overflow-y-auto whitespace-pre-wrap">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-white/5 pb-1">{log}</div>
                        ))}
                    </div>
                </section>

                <div className="text-xs text-center text-neutral-600 pt-10">
                    LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID}
                </div>
            </div>
        </div>
    )
}
