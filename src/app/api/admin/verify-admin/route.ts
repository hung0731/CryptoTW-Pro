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

        // Use server-side only env var (not NEXT_PUBLIC_)
        const allowedEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map(e => e.trim())
            .filter(Boolean)

        const isAdmin = allowedEmails.length === 0 || allowedEmails.includes(user.email)

        return NextResponse.json({ isAdmin })
    } catch (error) {
        console.error('[verify-admin] Error:', error)
        return NextResponse.json({ isAdmin: false }, { status: 500 })
    }
}
