import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const supabase = createAdminClient()

        const { data: reviews, error } = await supabase
            .from('market_reviews')
            .select('*')
            .order('year', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            logger.error('Reviews Fetch Error', error instanceof Error ? error : new Error(String(error)), { feature: 'admin-api', endpoint: 'content/reviews' })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ reviews })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
