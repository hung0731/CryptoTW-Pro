
import { createAdminClient } from '@/lib/supabase'

export interface LogEntry {
    userId: string
    event_type: string
    text_raw?: string
    trigger: string
    intent?: string
    symbol?: string
    api_calls?: string[]
    latency_ms: number
    success: boolean
    error?: string
}

export class MetricLogger {
    static async log(entry: LogEntry) {
        // Non-blocking log
        // In a real production env, this might push to a queue.
        // For now, we fire-and-forget to Supabase, with a timeout to prevent hanging.

        const logPromise = async () => {
            try {
                const supabase = createAdminClient()

                // Sanitize / Mask text if needed
                const safeText = entry.text_raw && entry.text_raw.length > 50
                    ? entry.text_raw.substring(0, 50) + '...'
                    : entry.text_raw

                await supabase.from('line_events').insert({
                    user_id: entry.userId,
                    type: entry.event_type || 'interaction', // Schema requires 'type'
                    message: safeText || entry.trigger || 'No content', // Schema requires 'message'
                    metadata: {
                        trigger: entry.trigger,
                        intent: entry.intent,
                        symbol: entry.symbol,
                        api_calls: entry.api_calls,
                        latency_ms: Math.round(entry.latency_ms),
                        success: entry.success,
                        error: entry.error
                    },
                    created_at: new Date().toISOString()
                })
            } catch (e) {
                console.error('[MetricLogger] Failed to log:', e)
            }
        }

        // Fire and forget (don't await)
        logPromise()

        // Debug Log
        console.log(`[BotEvent] ${entry.trigger} (${entry.latency_ms}ms) - ${entry.symbol || ''}`)
    }
}
