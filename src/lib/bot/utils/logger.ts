import { createAdminClient } from '@/lib/supabase-admin'
import { logger, logBotEvent } from '@/lib/logger'

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
        // 1. Log to unified logger (stdout with requestId)
        logBotEvent({
            event: 'message_received',
            feature: 'bot_metric',
            user: entry.userId,
            latency_ms: entry.latency_ms,
            success: entry.success,
            error: entry.error,
            // Include extra metadata
            trigger: entry.trigger,
            intent: entry.intent,
            symbol: entry.symbol
        })

        // 2. Persist to Supabase (Async, fire-and-forget)
        const logPromise = async () => {
            try {
                const supabase = createAdminClient()

                // Sanitize / Mask text if needed
                const safeText = entry.text_raw && entry.text_raw.length > 50
                    ? entry.text_raw.substring(0, 50) + '...'
                    : entry.text_raw

                await supabase.from('line_events').insert({
                    user_id: entry.userId,
                    type: entry.event_type || 'interaction',
                    message: safeText || entry.trigger || 'No content',
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
                // Silently fail for metrics to not impact user experience
                logger.error('[MetricLogger] Failed to persist to Supabase', e as Error, {
                    feature: 'bot_metric_persist'
                })
            }
        }

        // Fire and forget
        void logPromise()
    }
}
