'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import GlobalLoader from './GlobalLoader'
import { logger } from '@/lib/logger'

type DBUser = Database['public']['Tables']['users']['Row']

interface LiffContextType {
    liffObject: any | null
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
    const [liffObject, setLiffObject] = useState<any | null>(null)
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
        // Always clear local state first
        setProfile(null)
        setDbUser(null)
        localStorage.removeItem('dbUser')
        setIsLoggedIn(false)

        // Then try LIFF logout if available
        if (liffObject && liffObject.isLoggedIn()) {
            liffObject.logout()
        }
        window.location.reload()
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
                // 1. Optimistic Load
                const cachedUser = localStorage.getItem('dbUser')
                if (cachedUser) {
                    try {
                        const parsed = JSON.parse(cachedUser)
                        setDbUser(parsed)
                        setIsLoggedIn(true)
                        setIsLoading(false)
                        logger.info('Optimistic load success', { feature: 'liff-provider', userId: parsed.id })
                    } catch (e) {
                        logger.error('Cache parse error', e as Error, { feature: 'liff-provider' })
                        localStorage.removeItem('dbUser')
                    }
                }

                // 2. Wait for LIFF SDK to load (CDN)
                let attempts = 0
                // Increase wait time to 20 seconds (200 * 100ms) for slower mobile networks
                while (!(window as any).liff && attempts < 200) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                    attempts++
                }

                if (!(window as any).liff) {
                    throw new Error('LIFF SDK failed to load from CDN (Timeout 20s)')
                }

                const liff = (window as any).liff

                // 3. Initialize LIFF
                logger.info('Starting LIFF Init (CDN)...', { feature: 'liff-provider', liffId })
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
                                    picture_url: data.user.picture_url,
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
                        // External Browser
                        if (isLoggedIn) {
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
                setIsLoading(false)
            }
        }

        void initLiff()
    }, [liffId]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <LiffContext.Provider value={{ liffObject, isLoggedIn, profile, dbUser, error, isLoading, login, logout }}>
            {isLoading && !dbUser && <GlobalLoader />}

            {children}
        </LiffContext.Provider>
    )
}
