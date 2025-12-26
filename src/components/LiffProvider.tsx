'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
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
    error: any | null
    isLoading: boolean
}

const LiffContext = createContext<LiffContextType>({
    liffObject: null,
    isLoggedIn: false,
    profile: null,
    dbUser: null,
    error: null,
    isLoading: true,
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
    const [error, setError] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const liffInitRef = useRef(false)

    useEffect(() => {
        if (!liffId) {
            logger.warn('LIFF ID is not provided.', { feature: 'liff-provider' })
            setIsLoading(false)
            return
        }

        // Prevent double initialization (React Strict Mode fix)
        if (liffInitRef.current) {
            return
        }
        liffInitRef.current = true

        const initLiff = async () => {
            try {
                // 1. Optimistic Load from Cache
                const cachedUser = localStorage.getItem('dbUser')
                if (cachedUser) {
                    try {
                        const parsed = JSON.parse(cachedUser)
                        setDbUser(parsed)
                        setIsLoggedIn(true)

                        const status = parsed.membership_status
                        const isPro = status === 'pro' || status === 'lifetime' || status === 'vip'

                        if (isPro) {
                            setIsLoading(false)
                            logger.info('Optimistic load success (Pro)', { feature: 'liff-provider', status: 'pro' })
                        } else {
                            logger.info('Optimistic load success (Basic - waiting for verify)', { feature: 'liff-provider', status: 'basic' })
                        }
                    } catch (e) {
                        logger.error('Cache parse error', e as Error, { feature: 'liff-provider' })
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
                logger.info('Initializing LIFF...', { feature: 'liff-provider', liffId })
                await liff.init({ liffId })
                setLiffObject(liff)

                // 4. Check Login Status
                if (liff.isLoggedIn()) {
                    logger.info('LIFF is logged in. Fetching profile...', { feature: 'liff-provider' })
                    setIsLoggedIn(true)
                    const userProfile = await liff.getProfile()
                    setProfile(userProfile)

                    // Authenticate with Backend
                    const accessToken = liff.getAccessToken()
                    if (accessToken) {
                        try {
                            const res = await fetch('/api/auth/line', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ accessToken })
                            })

                            if (res.ok) {
                                const data = await res.json()
                                setDbUser(data.user)

                                const safeCache = {
                                    id: data.user.id,
                                    line_user_id: data.user.line_user_id,
                                    display_name: data.user.display_name,
                                    avatar_url: data.user.avatar_url,
                                    membership_status: data.user.membership_status,
                                }
                                localStorage.setItem('dbUser', JSON.stringify(safeCache))

                                if (data.session) {
                                    const { error: sessionError } = await supabase.auth.setSession(data.session)
                                    if (sessionError) {
                                        logger.error('Supabase SetSession Error:', sessionError, { feature: 'liff-provider' })
                                    }
                                }
                            } else {
                                const errorData = await res.json().catch(() => ({}))
                                logger.error('Failed to sync user with backend', new Error(errorData.error || 'Auth API failed'), { feature: 'liff-provider', status: res.status })
                            }
                        } catch (err) {
                            logger.error('Auth API Error', err as Error, { feature: 'liff-provider' })
                        }
                    }
                } else {
                    // Not Logged In
                    logger.info('LIFF not logged in.', { feature: 'liff-provider', isInClient: liff.isInClient() })

                    if (liff.isInClient()) {
                        logger.info('In LINE client. Forcing login...', { feature: 'liff-provider' })
                        // Remove auth params to prevent loops
                        const url = new URL(window.location.href)
                        url.searchParams.delete('code')
                        url.searchParams.delete('state')
                        url.searchParams.delete('liffClientId')
                        url.searchParams.delete('liffRedirectUri')

                        liff.login({ redirectUri: url.toString() })
                        return
                    }

                    // Clear stale cache if not in client and not logged in
                    if (cachedUser) {
                        logger.info('Clearing stale cache - LIFF not logged in', { feature: 'liff-provider' })
                        setDbUser(null)
                        setIsLoggedIn(false)
                        localStorage.removeItem('dbUser')
                    }
                }
            } catch (e) {
                const errMsg = (e as Error).message
                logger.error('LIFF Initialization failed', e as Error, { feature: 'liff-provider' })
                setError(e) // This will ensure UI can maybe show something
            } finally {
                setIsLoading(false)
            }
        }

        void initLiff()
    }, [liffId])

    return (
        <LiffContext.Provider value={{ liffObject, isLoggedIn, profile, dbUser, error, isLoading }}>
            {isLoading && <GlobalLoader />}
            {/* Debug UI for Mobile - only visual if strictly needed context, usually hidden. 
                For now we rely on logger/console, but if error exists we can show a toast or small banner? 
                Let's keep clean for now unless persisted error. */}
            {children}
        </LiffContext.Provider>
    )
}
