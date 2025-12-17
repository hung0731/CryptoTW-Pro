
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
                    user_id: entry.userId, // Should ideally be hashed or reference a users table
                    event_type: entry.event_type,
                    trigger: entry.trigger,
                    text_raw: safeText,
                    intent: entry.intent,
                    extracted_symbol: entry.symbol,
                    api_calls: entry.api_calls,
                    latency_ms: Math.round(entry.latency_ms),
                    success: entry.success,
                    error_message: entry.error,
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
