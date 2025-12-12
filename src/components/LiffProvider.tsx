'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import liff from '@line/liff'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import GlobalLoader from './GlobalLoader'

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
            console.warn('LIFF ID is not provided.')
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
                            console.log('Optimistic load success (Pro)')
                        } else {
                            console.log('Optimistic load success (Basic - waiting for verify)')
                        }
                    } catch (e) {
                        console.error('Cache parse error', e)
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
                                // Update Cache
                                localStorage.setItem('dbUser', JSON.stringify(data.user))

                                // Set Supabase Session
                                if (data.session) {
                                    const { error: sessionError } = await supabase.auth.setSession(data.session)
                                    if (sessionError) {
                                        console.error('Supabase SetSession Error:', sessionError)
                                    }
                                }
                            } else {
                                console.error('Failed to sync user with backend')
                            }
                        } catch (err) {
                            console.error('Auth API Error', err)
                        }
                    }
                } else {
                    // If not logged in but had cache, clear it? 
                    // Ideally yes, to prevent stale state if user cleared LINE auth but not local Storage
                    // But for speed we keep it until explicit logout or error
                }
            } catch (e) {
                console.error('LIFF Initialization failed', e)
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
