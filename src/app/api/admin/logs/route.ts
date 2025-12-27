
import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
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
        const source = searchParams.get('source') // 'system' (for cron) or 'line' (default)

        const supabase = createAdminClient()

        // Mode 1: System Logs (Cron, etc.)
        if (source === 'system') {
            let query = supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)

            if (level) {
                query = query.eq('level', level)
            }

            const { data: logs, error } = await query
            if (error) throw error

            return NextResponse.json({
                logs: logs.map((log: any) => ({
                    id: log.id,
                    level: log.level,
                    module: log.module,
                    message: log.message,
                    metadata: log.metadata,
                    created_at: log.created_at
                }))
            })
        }

        // Mode 2: Line Events (Default)
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
        logger.error('Error fetching logs', error, { feature: 'admin-api', endpoint: 'logs' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
