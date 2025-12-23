import { createAdminClient } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'

export async function rateLimit(identifier: string, limit: number, windowSeconds: number): Promise<{ success: boolean }> {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase.rpc('check_rate_limit', {
            rate_key: identifier,
            max_requests: limit,
            window_seconds: windowSeconds
        })

        if (error) {
            logger.error('Rate Limit RPC Error:', error as Error, { feature: 'rate-limit' })
            // Fail open (allow request) if rate limiter fails, to avoid blocking legit users during outage
            return { success: true }
        }

        return { success: data as boolean }
    } catch (e) {
        logger.error('Rate Limit Exception:', e as Error, { feature: 'rate-limit' })
        return { success: true }
    }
}
