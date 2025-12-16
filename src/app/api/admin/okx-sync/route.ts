import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'

// Admin proxy for OKX sync - handles auth server-side
export async function POST() {
    // Verify admin first (returns null if not admin)
    const admin = await verifyAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Call the actual cron endpoint with server-side secret
        const cronSecret = process.env.CRON_SECRET
        if (!cronSecret) {
            return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cron/okx-sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            }
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error('[admin/okx-sync] Error:', error)
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
}
