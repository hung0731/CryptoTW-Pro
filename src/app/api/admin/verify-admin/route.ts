import { NextResponse } from 'next/server'
import { createSafeServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

// Server-side admin verification - uses non-public ADMIN_EMAILS
export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !user.email) {
            return NextResponse.json({ isAdmin: false }, { status: 401 })
        }

        // Check for admin role
        const role = user.app_metadata?.role || user.user_metadata?.role || 'user'
        const isAdmin = role === 'admin' || role === 'super_admin'

        return NextResponse.json({ isAdmin })
    } catch (error) {
        console.error('[verify-admin] Error:', error)
        return NextResponse.json({ isAdmin: false }, { status: 500 })
    }
}
