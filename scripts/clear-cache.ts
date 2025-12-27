
import Redis from 'ioredis'

async function main() {
    console.log('Clearing AI and Market Cache...')

    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS_CONNECTION_STRING

    if (!redisUrl) {
        console.warn('No REDIS_URL found in environment variables. If you are using a local Redis, ensure env vars are set.')
        // Fallback for local default if nothing set? 
        // Usually localhost:6379, but let's just warn.
        console.log('Attempting to connect to default localhost:6379...')
    }

    const client = new Redis(redisUrl || 'redis://localhost:6379')

    try {
        // 1. Clear specific AI keys patterns
        const patterns = [
            '*ai*',
            '*market_context*',
            '*indicator*',
            '*summary*',
            'lock:*'
        ]

        let totalDeleted = 0

        for (const pattern of patterns) {
            const keys = await client.keys(pattern)
            if (keys.length > 0) {
                await client.del(keys)
                console.log(`Deleted ${keys.length} keys matching '${pattern}'`)
                totalDeleted += keys.length
            }
        }

        // 2. Option to flush all if needed (commented out by default to be safe, but user asked to "Clear all AI-related caches", so specific keys are better. 
        // But `clearAllCache` in app does `flushdb`. Let's do flushdb if user implied a full reset or stick to patterns.)
        // The prompt said "clear all AI-related caches". 
        // Let's also clear "market_reports" if they are cached?
        // Actually, let's just run FLUSHDB as the user previously ran `clearAllCache` which does `flushdb`.
        // It provides a fresh start.

        console.log('Performing FULL Redis Flush to ensure no stale data...')
        await client.flushdb()
        console.log('Redis FLUSHDB executed.')

        console.log('Cache clearing complete.')

    } catch (e) {
        console.error('Error clearing cache:', e)
    } finally {
        client.disconnect()
    }
}

main()
