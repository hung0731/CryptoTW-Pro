
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCache, setCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'api:announcement:active'

export async function GET(req: NextRequest) {
    try {
        // Check cache first (5 min)
        const cached = await getCache(CACHE_KEY)
        if (cached !== null) {
            return NextResponse.json({ announcement: cached }, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const { data } = await supabase
            .from('system_announcements')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        // Cache for 5 minutes (even if null)
        await setCache(CACHE_KEY, data || null, CacheTTL.MEDIUM)

        return NextResponse.json({ announcement: data }, {
            headers: { 'X-Cache': 'MISS' }
        })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
