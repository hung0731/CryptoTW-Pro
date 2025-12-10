'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import liff from '@line/liff'
import { Database } from '@/types/database'

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
                            } else {
                                console.error('Failed to sync user with backend')
                            }
                        } catch (err) {
                            console.error('Auth API Error', err)
                        }
                    }
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
            {children}
        </LiffContext.Provider>
    )
}
