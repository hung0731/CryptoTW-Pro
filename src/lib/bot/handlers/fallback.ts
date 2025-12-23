
import { logger } from '@/lib/logger'
import { BotContext, BotHandler, HandlerResult } from './base'
import { generateFallbackReply } from '@/lib/gemini'
import { fetchStockTicker, createStockCard } from '@/lib/stocks'
import { createHelpFlexMessage } from '../ui/flex-generator'
import { normalizeInput } from '../utils/parsers'

// 低頻引導緩存：記錄用戶最後一次收到提示的時間
const fallbackHintCache = new Map<string, number>()

export class FallbackHandler implements BotHandler {
    async handle(context: BotContext): Promise<HandlerResult | null> {
        // LLM Classification
        const aiResult = await generateFallbackReply(context.userMessage)

        if (aiResult?.type === 'price_query' && aiResult.symbol) {
            const normalizedSymbol = normalizeInput(aiResult.symbol).toUpperCase()

            // 1. Try Crypto Again (just in case LLM extracted something our regex missed, or if regex missed it)
            // But usually CryptoHandler runs first. 
            // If we are here, it means CryptoHandler FAILED to find it in "Common Alias Map" OR it's a stock.

            // 2. Try Stock Fallback
            // Note: In original route.ts, it calls fetchTicker first (which calls Coinglass), if fail -> fetchStockTicker
            // Since CryptoHandler already ran (assuming pipeline order), we can assume it's NOT a common crypto we know.
            // But CryptoHandler uses `parseCoinSymbol` which is strict. LLM might match "BTC" from "查比特幣".
            // So we might want to try to delegate back to Crypto logic? 
            // OR just rely on "If it was a valid Crypto Alias, CryptoHandler would have caught it".
            // So here we assume it's either an unknown crypto or a stock.

            try {
                // Try Stock first if it looks like a stock ticker (implicit fallback)
                // Or try checking if it's a crypto that parsers missed? 
                // Let's stick to the "Stock Fallback" pattern requested.

                const stockData = await fetchStockTicker(normalizedSymbol)
                if (stockData) {
                    return {
                        message: { ...createStockCard(stockData), type: 'flex' as const },
                        metadata: {
                            trigger: 'llm_price_stock',
                            intent: 'price_query',
                            symbol: normalizedSymbol,
                            apiCalls: ['yahoo_finance']
                        }
                    }
                }

                // If Stock also fails
                return {
                    message: { type: 'text', text: `抱歉，找不到代號「${normalizedSymbol}」的相關報價。` },
                    metadata: {
                        trigger: 'llm_price_fail',
                        intent: 'price_query',
                        symbol: normalizedSymbol,
                        error: 'symbol_not_found'
                    }
                }

            } catch (e) {
                logger.error('Stock Fallback Error:', e as Error)
            }
        }

        // 3. Unknown / Low Confidence
        // Check Rate Limit for Help Message
        const lastHintTime = fallbackHintCache.get(context.userId) || 0
        const now = Date.now()

        // 6 小時一次
        if (now - lastHintTime > 6 * 60 * 60 * 1000) {
            fallbackHintCache.set(context.userId, now)
            return {
                message: { ...createHelpFlexMessage(), type: 'flex' as const },
                metadata: {
                    trigger: 'soft_guide',
                    intent: 'unknown'
                }
            }
        }

        return {
            message: null, // Silent
            metadata: {
                trigger: 'ignored_unknown',
                intent: 'unknown'
            }
        }
    }
}
