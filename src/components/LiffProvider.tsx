'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import liff from '@line/liff'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import GlobalLoader from './GlobalLoader'
import { logger } from '@/lib/logger'

type DBUser = Database['public']['Tables']['users']['Row']

interface LiffContextType {
    liffObject: typeof liff | null
    isLoggedIn: boolean
    profile: any | null
    dbUser: DBUser | null
    error: Error | null
    isLoading: boolean
    login: () => void
    logout: () => void
}

const LiffContext = createContext<LiffContextType>({
    liffObject: null,
    isLoggedIn: false,
    profile: null,
    dbUser: null,
    error: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
})

export const useLiff = () => useContext(LiffContext)

interface LiffProviderProps {
    liffId: string
    children: ReactNode
}

export const LiffProvider = ({ liffId, children }: LiffProviderProps) => {
    const [liffObject, setLiffObject] = useState<typeof liff | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState<any | null>(null)
    const [dbUser, setDbUser] = useState<DBUser | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const liffInitRef = useRef(false)

    // Helper to manually trigger login
    const login = useCallback(() => {
        if (!liffObject) {
            logger.warn('Cannot login: LIFF object not ready', { feature: 'liff-provider' })
            return
        }
        if (!liffObject.isLoggedIn()) {
            const redirectUri = window.location.href
            logger.info('Triggering manual login', { feature: 'liff-provider', redirectUri })
            liffObject.login({ redirectUri })
        }
    }, [liffObject])

    const logout = useCallback(() => {
        if (liffObject && liffObject.isLoggedIn()) {
            liffObject.logout()
            setIsLoggedIn(false)
            setProfile(null)
            setDbUser(null)
            localStorage.removeItem('dbUser')
            window.location.reload()
        }
    }, [liffObject])

    useEffect(() => {
        if (!liffId) {
            const err = new Error('LIFF ID is missing')
            logger.error('LIFF Init Error', err, { feature: 'liff-provider' })
            setError(err)
            setIsLoading(false)
            return
        }

        // Prevent double initialization
        if (liffInitRef.current) return
        liffInitRef.current = true

        const initLiff = async () => {
            try {
                // 1. Optimistic Load from Cache (Immediate UI feedback)
                const cachedUser = localStorage.getItem('dbUser')
                if (cachedUser) {
                    try {
                        const parsed = JSON.parse(cachedUser)
                        setDbUser(parsed)
                        setIsLoggedIn(true) // Optimistically set true
                        // Don't disable loading yet, wait for real verification if possible, 
                        // OR disable it but seamlessly update background if auth fails.
                        // Let's keep isLoading true until we confirm with LIFF or timeout?
                        // Actually, for better UX, let's show content but update in background.
                        setIsLoading(false)
                        logger.info('Optimistic load success', { feature: 'liff-provider', userId: parsed.id })
                    } catch (e) {
                        logger.error('Cache parse error', e as Error, { feature: 'liff-provider' })
                        localStorage.removeItem('dbUser')
                    }
                }

                // 2. Login Check (Optimistic) already done above.

                // 3. Initialize LIFF
                logger.info('Starting LIFF Init...', { feature: 'liff-provider', liffId })
                await liff.init({ liffId })
                setLiffObject(liff)

                // 4. Handle Auth State
                if (liff.isLoggedIn()) {
                    logger.info('LIFF is logged in. Fetching profile...', { feature: 'liff-provider' })
                    setIsLoggedIn(true)

                    try {
                        const userProfile = await liff.getProfile()
                        setProfile(userProfile)

                        const accessToken = liff.getAccessToken()
                        if (accessToken) {
                            // Sync with backend
                            const res = await fetch('/api/auth/line', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ accessToken })
                            })

                            if (res.ok) {
                                const data = await res.json()
                                setDbUser(data.user)

                                // Update Cache
                                const safeCache = {
                                    id: data.user.id,
                                    line_user_id: data.user.line_user_id,
                                    display_name: data.user.display_name,
                                    avatar_url: data.user.avatar_url,
                                    membership_status: data.user.membership_status,
                                    updated_at: new Date().toISOString()
                                }
                                localStorage.setItem('dbUser', JSON.stringify(safeCache))

                                if (data.session) {
                                    const { error: sessionError } = await supabase.auth.setSession(data.session)
                                    if (sessionError) {
                                        logger.error('Supabase Session Error', sessionError, { feature: 'liff-provider' })
                                    }
                                }
                            } else {
                                const errorData = await res.json().catch(() => ({}))
                                throw new Error(errorData.error || 'Auth API failed')
                            }
                        }
                    } catch (err) {
                        logger.error('Profile/Auth Fetch Error', err as Error, { feature: 'liff-provider' })
                        // Consider invalidating optimistic login if real verification fails?
                        // For now, just log valid error.
                    }
                } else {
                    // Not Logged In
                    logger.info('LIFF not logged in.', { feature: 'liff-provider', isInClient: liff.isInClient() })

                    if (liff.isInClient()) {
                        // In LINE App: Auto Login
                        // CHECK: prevent infinite loops if login fails repeatedly
                        // We can check for a specific query param or just trust liff.login behavior
                        const url = new URL(window.location.href)
                        // If we have an error code, don't loop
                        if (url.searchParams.has('error')) {
                            logger.warn('Login failed previously, not retrying auto-login', { feature: 'liff-provider' })
                            return
                        }

                        logger.info('In LINE client. Executing Auto Login...', { feature: 'liff-provider' })
                        // Clean URL before redirecting to avoid carrying over old params
                        // But keep intended destination path
                        liff.login({ redirectUri: window.location.href })
                        return
                    } else {
                        // External Browser: Stay logged out, clear sensitive cache
                        if (isLoggedIn) { // using the stale state variable from closure, but we can check if we set it optimistically
                            // If we were optimistic but LIFF says no, we must clear it clearly.
                            // However, `isLoggedIn` in this scope is the initial state (false). 
                            // We need to check if we just did an optimistic load that needs reverting.
                            if (localStorage.getItem('dbUser')) {
                                logger.info('Clearing stale cache - LIFF confirmed not logged in', { feature: 'liff-provider' })
                                setDbUser(null)
                                setIsLoggedIn(false)
                                localStorage.removeItem('dbUser')
                            }
                        }
                    }
                }
            } catch (e) {
                const initError = e as Error
                logger.error('LIFF Critical Init Error', initError, { feature: 'liff-provider' })
                setError(initError)
            } finally {
                // Ensure loading is dismissed eventually
                setIsLoading(false)
            }
        }

        void initLiff()
    }, [liffId]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <LiffContext.Provider value={{ liffObject, isLoggedIn, profile, dbUser, error, isLoading, login, logout }}>
            {isLoading && !dbUser && <GlobalLoader />}

            {error && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-sm p-6 bg-red-950/95 border border-red-500/50 text-white rounded-xl shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                            <h3 className="font-bold text-lg">Login System Error</h3>
                        </div>

                        <div className="bg-black/40 p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all border border-white/10">
                            {error.message}
                            {error.stack && `\n\nStack: ${error.stack.slice(0, 150)}...`}
                        </div>

                        <details className="text-xs text-white/60 mt-2">
                            <summary className="cursor-pointer hover:text-white mb-2">Show Debug Details</summary>
                            <div className="space-y-1 font-mono bg-black/20 p-2 rounded">
                                <p>LIFF ID: {liffId ? `${liffId.slice(0, 4)}...${liffId.slice(-4)}` : 'MISSING'}</p>
                                <p>UA: {typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : 'N/A'}...</p>
                                <p>URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
                                <p>Time: {new Date().toLocaleTimeString()}</p>
                            </div>
                        </details>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition-colors"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => setError(null)}
                                className="flex-1 bg-white/10 text-white py-2 rounded hover:bg-white/20 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </LiffContext.Provider>
    )
}
