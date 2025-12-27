
import { createAdminClient } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'

export type CronJobName = 'price-alert' | 'fred-sync' | 'daily-report' | 'test-cron'

export class CronLogger {
    static async logStart(job: CronJobName, metadata?: any) {
        // Optional: Log start state if needed, but usually we just want to know result.
        // For long running jobs, we might want a 'started' log.
        logger.info(`[CRON] Starting ${job}`, { feature: 'cron', job, metadata })
    }

    static async logSuccess(job: CronJobName, result: any, durationMs: number) {
        const supabase = createAdminClient()

        // 1. Log to Logger (StdOut/File)
        logger.info(`[CRON] Success ${job} (${durationMs}ms)`, { feature: 'cron', job, result, durationMs })

        // 2. Log to DB (system_logs)
        // We use 'cron' as module
        try {
            await supabase.from('system_logs').insert({
                level: 'success',
                module: 'cron',
                message: `Cron Job Completed: ${job}`,
                metadata: {
                    job,
                    status: 'success',
                    duration: `${durationMs}ms`,
                    result
                }
            })
        } catch (e) {
            console.error('Failed to write cron log to DB:', e)
        }
    }

    static async logFailure(job: CronJobName, error: any, durationMs: number) {
        const supabase = createAdminClient()
        const errorMessage = error instanceof Error ? error.message : String(error)

        // 1. Log to Logger
        logger.error(`[CRON] Failed ${job} (${durationMs}ms): ${errorMessage}`, { feature: 'cron', job, error, durationMs })

        // 2. Log to DB
        try {
            await supabase.from('system_logs').insert({
                level: 'error',
                module: 'cron',
                message: `Cron Job Failed: ${job}`,
                metadata: {
                    job,
                    status: 'error',
                    duration: `${durationMs}ms`,
                    error: errorMessage
                }
            })
        } catch (e) {
            console.error('Failed to write cron log to DB:', e)
        }
    }
}
