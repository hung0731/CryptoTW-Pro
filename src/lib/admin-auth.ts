import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSafeServerClient } from '@/lib/supabase'

/**
 * Verifies that the request is from an authenticated admin user.
 * Returns the user if authenticated, or null if not.
 * 
 * Usage:
 * const user = await verifyAdmin()
 * if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function verifyAdmin(): Promise<{ id: string; email: string } | null> {
    try {
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user || !user.email) {
            return null
        }

        // Email Whitelist Check - only use server-side env var
        const allowedEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map(e => e.trim())
            .filter(Boolean)

        // If whitelist is configured, check it
        if (allowedEmails.length > 0 && !allowedEmails.includes(user.email)) {
            return null
        }

        return { id: user.id, email: user.email }
    } catch (e) {
        console.error('Admin verification error:', e)
        return null
    }
}

/**
 * Helper to return a standard unauthorized response
 */
export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized', message: '請先登入管理員帳號' },
        { status: 401 }
    )
}
