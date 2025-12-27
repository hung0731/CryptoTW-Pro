'use client'

import { useState, useEffect, useRef } from 'react'
import { logger } from '@/lib/logger'

// Minimal LIFF definition
export interface LiffInstance {
    init: (config: { liffId: string }) => Promise<void>
    isLoggedIn: () => boolean
    isInClient: () => boolean
    login: (config?: { redirectUri?: string }) => void
    logout: () => void
    getAccessToken: () => string | null
    getProfile: () => Promise<any>
    getOS: () => string
    getLanguage: () => string
    getVersion: () => string
}

interface UseLiffInitReturn {
    liffObject: LiffInstance | null
    error: Error | null
    isSdkLoading: boolean
}

const SDK_MAX_WAIT = 5000 // 5 seconds timeout

export function useLiffInit(liffId: string): UseLiffInitReturn {
    const [liffObject, setLiffObject] = useState<LiffInstance | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [isSdkLoading, setIsSdkLoading] = useState(true)
    const initRef = useRef(false)

    useEffect(() => {
        if (!liffId || initRef.current) return
        initRef.current = true

        const initialize = async () => {
            try {
                // 1. Wait for SDK (Adaptive polling)
                const startTime = Date.now()
                let liff: any = (window as any).liff

                while (!liff) {
                    if (Date.now() - startTime > SDK_MAX_WAIT) {
                        logger.warn('LIFF SDK timeout', { feature: 'useLiffInit' })
                        break
                    }
                    await new Promise(r => setTimeout(r, 50))
                    liff = (window as any).liff
                }

                if (!liff) {
                    throw new Error('LIFF SDK failed to load')
                }

                // 2. Init
                await liff.init({ liffId })
                setLiffObject(liff as LiffInstance)
            } catch (err) {
                logger.error('LIFF Init Error', err as Error, { feature: 'useLiffInit' })
                setError(err as Error)
            } finally {
                setIsSdkLoading(false)
            }
        }

        void initialize()
    }, [liffId])

    return { liffObject, error, isSdkLoading }
}
