
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // 1. Verify Admin
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    // 2. Fetch Logs
    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const level = searchParams.get('level')

        const supabase = createAdminClient()
        let query = supabase
            .from('line_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        // Filter: Mapping UI 'level' to DB 'success'
        // 'error' -> success=false
        // 'info'/'success' -> success=true
        if (level === 'error') {
            query = query.eq('success', false)
        } else if (level === 'success' || level === 'info') {
            query = query.eq('success', true)
        }

        const { data: events, error } = await query

        if (error) throw error

        // Transform line_events to SystemLog format for UI
        const logs = events.map((event: any) => {
            const isError = !event.success
            const isSlow = event.latency_ms > 2000

            let logLevel = 'info'
            if (isError) logLevel = 'error'
            else if (isSlow) logLevel = 'warning'
            else logLevel = 'success'

            return {
                id: event.id,
                level: logLevel,
                module: event.trigger || 'unknown',
                message: event.error_message
                    ? `[Error] ${event.error_message}`
                    : `User: ${event.text_raw || '(Image/Audio)'}`,
                metadata: {
                    userId: event.user_id,
                    intent: event.intent,
                    symbol: event.extracted_symbol,
                    latency: `${event.latency_ms}ms`,
                    apiCalls: event.api_calls
                },
                created_at: event.created_at
            }
        })

        return NextResponse.json({ logs })
    } catch (error) {
        console.error('Error fetching logs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
