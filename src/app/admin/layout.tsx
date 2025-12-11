'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-black px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">CryptoTW Pro 管理後台</span>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-black text-white">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
