'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import GlobalLoader from './GlobalLoader'
import { logger } from '@/lib/logger'

// ============================================
// Type Definitions
// ============================================

type DBUser = Database['public']['Tables']['users']['Row']

/** LIFF Profile from LINE */
interface LiffProfile {
    userId: string
    displayName: string
    pictureUrl?: string
    statusMessage?: string
}

/** Minimal LIFF interface for type safety */
interface LiffObject {
    init: (config: { liffId: string }) => Promise<void>
    isLoggedIn: () => boolean
    isInClient: () => boolean
    login: (config?: { redirectUri?: string }) => void
    logout: () => void
    getAccessToken: () => string | null
    getProfile: () => Promise<LiffProfile>
    getOS: () => 'ios' | 'android' | 'web'
    getLanguage: () => string
    getVersion: () => string
}

/** Cached user data structure */
interface CachedUser {
    id: string
    line_user_id: string
    display_name: string | null
    picture_url: string | null
    membership_status: string
    updated_at: string
}

interface LiffContextType {
    liffObject: LiffObject | null
    isLoggedIn: boolean
    profile: LiffProfile | null
    dbUser: DBUser | null
    error: Error | null
    isLoading: boolean
    login: () => void
    logout: () => void
    retry: () => void
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
    retry: () => { },
})

export const useLiff = () => useContext(LiffContext)

interface LiffProviderProps {
    liffId: string
    children: ReactNode
}

// ============================================
// Constants
// ============================================

const CACHE_KEY = 'dbUser'
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours
const SDK_WAIT_INTERVAL = 50 // ms
const SDK_MAX_WAIT = 3000 // 3 seconds max (reduced from 10s for better UX)

// ============================================
// Helper Functions
// ============================================

function isCacheValid(cached: CachedUser): boolean {
    if (!cached.updated_at) return false
    const updatedAt = new Date(cached.updated_at).getTime()
    const now = Date.now()
    return (now - updatedAt) < CACHE_EXPIRY_MS
}

async function waitForLiffSDK(): Promise<LiffObject | null> {
    const startTime = Date.now()

    while (!(window as any).liff) {
        if (Date.now() - startTime > SDK_MAX_WAIT) {
            // SDK timeout - return null instead of throwing
            // This allows the app to continue in guest mode
            logger.warn('LIFF SDK timeout after 10s - continuing as guest', { feature: 'liff-provider' })
            return null
        }
        await new Promise(resolve => setTimeout(resolve, SDK_WAIT_INTERVAL))
    }

    return (window as any).liff as LiffObject
}

// ============================================
// Provider Component
// ============================================

export const LiffProvider = ({ liffId, children }: LiffProviderProps) => {
    const [liffObject, setLiffObject] = useState<LiffObject | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState<LiffProfile | null>(null)
    const [dbUser, setDbUser] = useState<DBUser | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const liffInitRef = useRef(false)
    const retryCountRef = useRef(0)

    // Manual login trigger
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

    // Logout and clear all state
    const logout = useCallback(() => {
        setProfile(null)
        setDbUser(null)
        localStorage.removeItem(CACHE_KEY)
        setIsLoggedIn(false)

        if (liffObject?.isLoggedIn()) {
            liffObject.logout()
        }
        window.location.reload()
    }, [liffObject])

    // Retry initialization
    const retry = useCallback(() => {
        if (retryCountRef.current >= 3) {
            logger.warn('Max retry attempts reached', { feature: 'liff-provider' })
            return
        }
        retryCountRef.current++
        liffInitRef.current = false
        setError(null)
        setIsLoading(true)
        // Re-trigger useEffect by changing a dependency would be complex,
        // so we just reload the page for now
        window.location.reload()
    }, [])

    useEffect(() => {
        if (!liffId) {
            const err = new Error('LIFF ID is missing')
            logger.error('LIFF Init Error', err, { feature: 'liff-provider' })
            setError(err)
            setIsLoading(false)
            return
        }

        if (liffInitRef.current) return
        liffInitRef.current = true

        const initLiff = async () => {
            try {
                // 1. Optimistic Load from Cache
                const cachedRaw = localStorage.getItem(CACHE_KEY)
                if (cachedRaw) {
                    try {
                        const cached: CachedUser = JSON.parse(cachedRaw)

                        if (isCacheValid(cached)) {
                            // Valid cache - use it immediately
                            setDbUser(cached as unknown as DBUser)
                            setIsLoggedIn(true)
                            setIsLoading(false)
                            logger.info('Optimistic load from valid cache', {
                                feature: 'liff-provider',
                                userId: cached.id,
                                cacheAge: Math.round((Date.now() - new Date(cached.updated_at).getTime()) / 1000 / 60) + 'min'
                            })
                        } else {
                            // Expired cache - clear it
                            logger.info('Cache expired, will refresh', { feature: 'liff-provider' })
                            localStorage.removeItem(CACHE_KEY)
                        }
                    } catch (e) {
                        logger.error('Cache parse error', e as Error, { feature: 'liff-provider' })
                        localStorage.removeItem(CACHE_KEY)
                    }
                }

                // 2. Wait for LIFF SDK
                const liff = await waitForLiffSDK()

                // If SDK failed to load, continue in guest mode
                if (!liff) {
                    logger.warn('LIFF SDK unavailable - continuing in guest mode', { feature: 'liff-provider' })
                    // Keep any cached data but mark as not logged in
                    setIsLoading(false)
                    return
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
                            const res = await fetch('/api/auth/line', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ accessToken })
                            })

                            if (res.ok) {
                                const data = await res.json()
                                setDbUser(data.user)

                                // Update Cache with timestamp
                                const newCache: CachedUser = {
                                    id: data.user.id,
                                    line_user_id: data.user.line_user_id,
                                    display_name: data.user.display_name,
                                    picture_url: data.user.picture_url,
                                    membership_status: data.user.membership_status,
                                    updated_at: new Date().toISOString()
                                }
                                localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))

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
                    }
                } else {
                    // Not Logged In
                    logger.info('LIFF not logged in.', { feature: 'liff-provider', isInClient: liff.isInClient() })

                    if (liff.isInClient()) {
                        const url = new URL(window.location.href)
                        if (url.searchParams.has('error')) {
                            logger.warn('Login failed previously, not retrying auto-login', { feature: 'liff-provider' })
                            return
                        }

                        logger.info('In LINE client. Executing Auto Login...', { feature: 'liff-provider' })
                        liff.login({ redirectUri: window.location.href })
                        return
                    } else {
                        // External Browser - clear stale optimistic state
                        if (localStorage.getItem(CACHE_KEY)) {
                            logger.info('Clearing stale cache - LIFF confirmed not logged in', { feature: 'liff-provider' })
                            setDbUser(null)
                            setIsLoggedIn(false)
                            localStorage.removeItem(CACHE_KEY)
                        }
                    }
                }
            } catch (e) {
                const initError = e as Error
                logger.error('LIFF Critical Init Error', initError, { feature: 'liff-provider' })
                setError(initError)
            } finally {
                setIsLoading(false)
            }
        }

        void initLiff()
    }, [liffId])

    // Show loader only after a delay to prevent flash
    const [showLoader, setShowLoader] = React.useState(false)

    React.useEffect(() => {
        if (isLoading && !dbUser) {
            const timer = setTimeout(() => setShowLoader(true), 800)
            return () => clearTimeout(timer)
        } else {
            setShowLoader(false)
        }
    }, [isLoading, dbUser])

    return (
        <LiffContext.Provider value={{ liffObject, isLoggedIn, profile, dbUser, error, isLoading, login, logout, retry }}>
            {showLoader && <GlobalLoader />}
            {children}
        </LiffContext.Provider>
    )
}
