'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.replace('/login')
                    return
                }

                // Admin Whitelist Check
                const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
                    .split(',')
                    .map(e => e.trim())
                    .filter(Boolean)

                if (allowedEmails.length > 0 && session.user.email && !allowedEmails.includes(session.user.email)) {
                    console.warn('Unauthorized admin access attempt:', session.user.email)
                    await supabase.auth.signOut() // Force sign out
                    router.replace('/login?error=unauthorized')
                } else {
                    setIsAuthenticated(true)
                }
            } catch (e) {
                router.replace('/login')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router, supabase])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-black">
            <AppSidebar />
            <main className="ml-56 min-h-screen">
                <div className="p-8 text-white">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
