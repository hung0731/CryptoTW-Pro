
import { FlexMessage, TextMessage } from '@line/bot-sdk'
import { logger } from '@/lib/logger'
import { BotContext, BotHandler, HandlerResult } from './handlers/base'
import { ExactCommandHandler } from './handlers/exact-command'
import { CurrencyHandler } from './handlers/currency'
import { CryptoHandler } from './handlers/crypto'
import { FallbackHandler } from './handlers/fallback'
import { MetricLogger } from './utils/logger'

// Simple in-memory rate limiter / deduplicator
const userRequestCache = new Map<string, { lastText: string, timestamp: number }>()

export class BotPipeline {
    private handlers: BotHandler[]

    constructor() {
        this.handlers = [
            new ExactCommandHandler(),
            new CurrencyHandler(),
            new CryptoHandler(),
            new FallbackHandler()
        ]
    }

    async execute(context: BotContext): Promise<FlexMessage | TextMessage | null> {
        const startTime = performance.now()
        let result: HandlerResult | null = null

        try {
            // 1. Rate Limit / Deduplication
            if (this.isDuplicateOrSpam(context)) {
                return null // Silently ignore spam
            }

            // 2. Loop Handlers
            for (const handler of this.handlers) {
                result = await handler.handle(context)
                if (result) {
                    break // Stop chain on first match
                }
            }

            // 3. Log Result
            const latency = performance.now() - startTime

            if (result) {
                void MetricLogger.log({
                    userId: context.userId,
                    event_type: 'message',
                    text_raw: context.userMessage,
                    trigger: result.metadata.trigger,
                    intent: result.metadata.intent,
                    symbol: result.metadata.symbol,
                    api_calls: result.metadata.apiCalls,
                    latency_ms: latency,
                    success: true,
                    error: result.metadata.error
                })

                return result.message
            } else {
                // No handler matched (ignore)
                void MetricLogger.log({
                    userId: context.userId,
                    event_type: 'message',
                    text_raw: context.userMessage,
                    trigger: 'ignored_pipeline_exhausted',
                    latency_ms: latency,
                    success: true // It's a success that we safely ignored it
                })
                return null
            }


        } catch (e: any) {
            logger.error('[BotPipeline] Critical Error:', e)
            void MetricLogger.log({
                userId: context.userId,
                event_type: 'error',
                trigger: 'pipeline_crash',
                latency_ms: performance.now() - startTime,
                success: false,
                error: e.message
            })
            // Graceful degradation: return nothing or a generic error?
            // User requested tiered errors.
            return { type: 'text', text: '系統暫時繁忙，請稍後再試。' }
        }
    }

    private isDuplicateOrSpam(context: BotContext): boolean {
        const key = context.userId
        const now = Date.now()
        const lastRec = userRequestCache.get(key)

        // Update cache
        userRequestCache.set(key, { lastText: context.userMessage, timestamp: now })

        if (lastRec) {
            // Deduplication: Same text within 1.5 seconds
            if (context.userMessage === lastRec.lastText && (now - lastRec.timestamp) < 1500) {
                logger.debug(`[RateLimit] Dedup: ${key}`, { feature: 'bot_ratelimit' })
                return true
            }
            // Rate Limit: Any text within 500ms (Hyper spam)
            if ((now - lastRec.timestamp) < 500) {
                return true
            }
        }

        return false
    }
}
