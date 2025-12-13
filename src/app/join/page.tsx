'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/components/LiffProvider'
import { useToast } from '@/hooks/use-toast'
import { ProAccessGate } from '@/components/ProAccessGate'
import GlobalLoader from '@/components/GlobalLoader'

export default function JoinPage() {
    const { dbUser, isLoading } = useLiff()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (isLoading) return

        // Check if user is already Pro
        const status = dbUser?.membership_status
        const isPro = status === 'pro' || status === 'lifetime'

        if (isPro) {
            // Show toast and redirect to home
            toast({
                title: "✅ 你已經是 Pro 會員",
                description: "歡迎回來！享受完整的 Pro 功能。",
            })
            router.replace('/')
        }
    }, [dbUser, isLoading, router, toast])

    // Show loader while checking
    if (isLoading) {
        return <GlobalLoader />
    }

    // If user is Pro, don't render gate (will redirect)
    const status = dbUser?.membership_status
    const isPro = status === 'pro' || status === 'lifetime'
    if (isPro) {
        return <GlobalLoader />
    }

    // Show the access gate for non-Pro users
    return <ProAccessGate />
}
