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

                // 2. LIFF Inspector (Dev Only)
                if (process.env.NODE_ENV === 'development') {
                    try {
                        const inspectorModule = await import('@line/liff-inspector') as any
                        const LiffInspector = inspectorModule.LiffInspector || inspectorModule.default
                        if (LiffInspector) {
                            liff.use(new LiffInspector())
                        }
                    } catch (err) {
                        logger.warn('Failed to load LIFF Inspector', err as Error, { feature: 'liff-provider' })
                    }
                }

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
            {/* Show error context if strictly necessary, or let children handle it via useLiff().error */}
            {error && (
                <div className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-red-900/90 text-white text-xs rounded shadow-lg backdrop-blur safe-area-bottom">
                    <p className="font-bold mb-1">Login System Error</p>
                    <p>{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}
            {children}
        </LiffContext.Provider>
    )
}
