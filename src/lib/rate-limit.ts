import { createAdminClient } from '@/lib/supabase'

export async function rateLimit(identifier: string, limit: number, windowSeconds: number): Promise<{ success: boolean }> {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase.rpc('check_rate_limit', {
            rate_key: identifier,
            max_requests: limit,
            window_seconds: windowSeconds
        })

        if (error) {
            console.error('Rate Limit RPC Error:', error)
            // Fail open (allow request) if rate limiter fails, to avoid blocking legit users during outage
            return { success: true }
        }

        return { success: data as boolean }
    } catch (e) {
        console.error('Rate Limit Exception:', e)
        return { success: true }
    }
}
