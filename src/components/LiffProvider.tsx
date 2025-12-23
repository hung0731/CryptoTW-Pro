'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

    useEffect(() => {
        if (!liffId) {
            logger.warn('LIFF ID is not provided.', { feature: 'liff-provider' })
            setIsLoading(false)
            return
        }

        const initLiff = async () => {
            try {
                // 1. Optimistic Load from Cache
                const cachedUser = localStorage.getItem('dbUser')
                if (cachedUser) {
                    try {
                        const parsed = JSON.parse(cachedUser)
                        setDbUser(parsed)
                        setIsLoggedIn(true)

                        // Smart Optimistic UI:
                        // Only unblock immediately if user was already PRO.
                        // If they were FREE, wait for fresh API data to check if they upgraded.
                        // This prevents "Flash of Gate" for users who just bound/upgraded.
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

                await liff.init({ liffId })
                setLiffObject(liff)

                if (liff.isLoggedIn()) {
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
                                // Security: Only cache non-sensitive fields to minimize XSS impact
                                const safeCache = {
                                    id: data.user.id,
                                    line_user_id: data.user.line_user_id,
                                    display_name: data.user.display_name,
                                    avatar_url: data.user.avatar_url,
                                    membership_status: data.user.membership_status,
                                    // Do NOT cache sensitive fields like email, session tokens, etc.
                                }
                                localStorage.setItem('dbUser', JSON.stringify(safeCache))

                                // Set Supabase Session
                                if (data.session) {
                                    const { error: sessionError } = await supabase.auth.setSession(data.session)
                                    if (sessionError) {
                                        logger.error('Supabase SetSession Error:', sessionError, { feature: 'liff-provider' })
                                    }
                                }
                            } else {
                                logger.error('Failed to sync user with backend', new Error('Auth API failed'), { feature: 'liff-provider', status: res.status })
                                // If sync failed and we have 'basic' cache, we might want to retry or clear?
                                // For now, keep as is, but maybe force reload?
                            }
                        } catch (err) {
                            logger.error('Auth API Error', err as Error, { feature: 'liff-provider' })
                        }
                    }
                } else {
                    // CRITICAL FIX:
                    // If LIFF is NOT logged in, but we have optimistic cache (isLoggedIn=true),
                    // we MUST clear it. Otherwise user appears as "Basic" (from cache) but effectively logged out relative to Line.
                    // This prevents "Basic" state triggering Gate when they should just be "Guest" (Login Page).
                    if (cachedUser) {
                        logger.info('Clearing stale cache - LIFF not logged in', { feature: 'liff-provider' })
                        setDbUser(null)
                        setIsLoggedIn(false)
                        localStorage.removeItem('dbUser')
                    }
                }
            } catch (e) {
                logger.error('LIFF Initialization failed', e as Error, { feature: 'liff-provider' })
                setError(e)
            } finally {
                setIsLoading(false)
            }
        }

        initLiff()
    }, [liffId])

    return (
        <LiffContext.Provider value={{ liffObject, isLoggedIn, profile, dbUser, error, isLoading }}>
            {isLoading && <GlobalLoader />}
            {children}
        </LiffContext.Provider>
    )
}
