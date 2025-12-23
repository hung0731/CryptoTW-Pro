/**
 * Unified Logger for CryptoTW Alpha
 * 
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info('Message', { userId: '123', feature: 'market' })
 *   logger.error('Failed', error, { feature: 'api' })
 * 
 * Future: Can integrate with Sentry, Datadog, etc.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    userId?: string
    requestId?: string
    feature?: string
    latency_ms?: number
    [key: string]: unknown
}

class Logger {
    private env = process.env.NODE_ENV
    private isServer = typeof window === 'undefined'
    private context: Partial<LogContext> = {}

    setContext(context: Partial<LogContext>) {
        this.context = { ...this.context, ...context }
    }

    clearContext() {
        this.context = {}
    }

    private log(level: LogLevel, message: string, context?: LogContext) {
        // Production: Only log warn/error to reduce noise
        if (this.env === 'production' && level === 'debug') return

        const timestamp = new Date().toISOString()
        const prefix = this.isServer ? '[Server]' : '[Client]'

        const logData = {
            timestamp,
            level,
            env: prefix,
            message,
            ...this.context,  // ← Include request context
            ...context
        }

        // Structured logging for easier parsing
        const logString = JSON.stringify(logData)

        // Future: Send to external service (Sentry, Axiom, etc.)
        if (level === 'error') {
            console.error(logString)
        } else if (level === 'warn') {
            console.warn(logString)
        } else {
            console.log(logString)
        }
    }

    debug(message: string, context?: LogContext) {
        this.log('debug', message, context)
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context)
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context)
    }

    error(message: string, error?: Error | unknown, context?: LogContext) {
        const errorData = error instanceof Error
            ? { error: error.message, stack: error.stack }
            : { error: String(error) }

        this.log('error', message, {
            ...context,
            ...errorData
        })
    }
}

export const logger = new Logger()

// ================================================
// Specialized Event Loggers
// ================================================

interface BotEventLog extends LogContext {
    event: 'message_received' | 'reply_sent' | 'cron_executed' | 'webhook_received'
    user?: string
    feature: string
    latency_ms: number
    success: boolean
    error?: string
}

export function logBotEvent(data: BotEventLog) {
    logger.info('Bot event', data)
}

interface ApiEventLog extends LogContext {
    endpoint: string
    method: string
    status: number
    latency_ms: number
    cached?: boolean
}

export function logApiEvent(data: ApiEventLog) {
    logger.info('API event', data)
}
