'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { Database } from '@/types/database'
import { logger } from '@/lib/logger'
import { useLiffInit, LiffInstance } from '@/hooks/useLiffInit'
import { AuthService } from '@/lib/services/auth'

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
    liffObject: LiffInstance | null
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

// ============================================
// Helper Functions
// ============================================

function isCacheValid(cached: CachedUser): boolean {
    if (!cached.updated_at) return false
    const updatedAt = new Date(cached.updated_at).getTime()
    const now = Date.now()
    return (now - updatedAt) < CACHE_EXPIRY_MS
}

// ============================================
// Provider Component
// ============================================

export const LiffProvider = ({ liffId, children }: LiffProviderProps) => {
    // 1. Hook Initialization
    const { liffObject, error: initError, isSdkLoading } = useLiffInit(liffId)

    // 2. Local State
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState<LiffProfile | null>(null)
    const [dbUser, setDbUser] = useState<DBUser | null>(null)
    const [syncError, setSyncError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Combine errors
    const error = initError || syncError

    // 3. Methods
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
        setProfile(null)
        setDbUser(null)
        localStorage.removeItem(CACHE_KEY)
        setIsLoggedIn(false)

        if (liffObject?.isLoggedIn()) {
            liffObject.logout()
        }
        window.location.reload()
    }, [liffObject])

    const retry = useCallback(() => {
        window.location.reload()
    }, [])

    // 4. Optimistic Cache Load (Run once on mount)
    useEffect(() => {
        const loadCache = () => {
            try {
                const cachedRaw = localStorage.getItem(CACHE_KEY)
                if (!cachedRaw) return

                const cached: CachedUser = JSON.parse(cachedRaw)
                if (isCacheValid(cached)) {
                    setDbUser(cached as unknown as DBUser)
                    setIsLoggedIn(true)
                    // If we have cache, we can stop "loading" visually immediately
                    // The real sync will happen in background
                    setIsLoading(false)
                    logger.info('Optimistic load from valid cache', {
                        feature: 'liff-provider',
                        userId: cached.id
                    })
                } else {
                    localStorage.removeItem(CACHE_KEY)
                }
            } catch (e) {
                logger.error('Cache parse error', e as Error, { feature: 'liff-provider' })
                localStorage.removeItem(CACHE_KEY)
            }
        }
        loadCache()
    }, [])

    // 5. Auth Sync Effect (Runs when liffObject is ready)
    useEffect(() => {
        if (!liffObject || isSdkLoading) return

        const syncAuth = async () => {
            try {
                // A. Check LIFF Login Status
                if (!liffObject.isLoggedIn()) {
                    // Handle Guest / Auto-login logic
                    if (liffObject.isInClient()) {
                        const url = new URL(window.location.href)
                        if (!url.searchParams.has('error')) {
                            logger.info('In LINE client. Auto Login...', { feature: 'liff-provider' })
                            liffObject.login({ redirectUri: window.location.href })
                            return
                        }
                    }

                    // Not logged in and not in client (or error)
                    if (localStorage.getItem(CACHE_KEY)) {
                        logger.info('Clearing stale cache - Not logged in', { feature: 'liff-provider' })
                        setDbUser(null)
                        setIsLoggedIn(false)
                        localStorage.removeItem(CACHE_KEY)
                    }
                    setIsLoading(false)
                    return
                }

                // B. Authenticated User Sync
                setIsLoggedIn(true)
                const userProfile = await liffObject.getProfile()
                setProfile(userProfile)

                const accessToken = liffObject.getAccessToken()
                if (accessToken) {
                    // Use Service Layer
                    const data = await AuthService.syncWithBackend(accessToken)
                    setDbUser(data.user)

                    // Update Cache
                    const newCache: CachedUser = {
                        id: data.user.id,
                        line_user_id: data.user.line_user_id,
                        display_name: data.user.display_name,
                        picture_url: data.user.picture_url,
                        membership_status: data.user.membership_status,
                        updated_at: new Date().toISOString()
                    }
                    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))
                }
            } catch (err) {
                logger.error('Auth Sync Error', err as Error, { feature: 'liff-provider' })
                setSyncError(err as Error)
            } finally {
                setIsLoading(false)
            }
        }

        void syncAuth()
    }, [liffObject, isSdkLoading])

    return (
        <LiffContext.Provider value={{ liffObject, isLoggedIn, profile, dbUser, error, isLoading, login, logout, retry }}>
            {children}
        </LiffContext.Provider>
    )
}
