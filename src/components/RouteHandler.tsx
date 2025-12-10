'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function RouteHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const path = searchParams.get('path')
        if (path) {
            // Check if we are already on the correct path to avoid loops
            if (window.location.pathname !== path) {
                console.log(`RouteHandler: Redirecting to ${path}`)
                router.replace(path)
            }
        }
    }, [searchParams, router])

    return null
}
