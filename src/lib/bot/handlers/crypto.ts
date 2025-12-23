
import { logger } from '@/lib/logger'
import { BotContext, BotHandler, HandlerResult } from './base'
import { parseCoinSymbol } from '../utils/parsers'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { fetchCryptoTicker } from '../utils/market'
import { createPriceCard } from '../ui/flex-generator' // Moved here
import { createMiniAnalysisCard } from '@/lib/flex-market-dashboard'

export class CryptoHandler implements BotHandler {
    async handle(context: BotContext): Promise<HandlerResult | null> {
        const symbol = parseCoinSymbol(context.userMessage)
        if (!symbol) return null

        try {
            // 1. Fetch Basic Ticker (Price)
            const ticker = await fetchCryptoTicker(symbol)
            if (!ticker) return null

            // Generate Price Card Bubble
            const priceCardMsg = createPriceCard(ticker)
            const priceBubble = priceCardMsg.contents

            // 2. Check for Advanced Data (Funding, Sediment, etc.)
            const hasAdvancedData = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA'].includes(symbol)
            let analysisBubble: any = null

            if (hasAdvancedData) {
                try {
                    // Fetch full market snapshot (cached)
                    const marketData = await getMarketSnapshot(symbol)
                    if (marketData) {
                        analysisBubble = createMiniAnalysisCard(marketData)
                    }
                } catch (err) {
                    logger.warn('Advanced data fetch error:', { error: err })
                    // Continue without advanced data
                }
            }

            // 3. Construct Response
            // If we have analysis data, merge it into the Price Card Bubble
            if (analysisBubble) {
                // We want to append Analysis Body contents to Price Card Body
                // Analysis Body Structure: Header(Box) + Separator + Row1 + Row2 + Row3 + FooterHint
                // We skip the first Header(Box) and Separator to merge smoothly

                // Ensure priceBubble.body is a Box
                if (priceBubble.body?.type === 'box') {
                    const priceBodyContents = priceBubble.body.contents || []
                    const analysisBodyContents = analysisBubble?.body?.contents || []

                    // New 3-Column Layout does not have an internal header to skip.
                    // We append everything (The 3-col Box + The Footer Hint)
                    const extraContents = analysisBodyContents

                    // Add a separator before appending
                    const separator: { type: 'separator'; margin: 'lg'; color: string } = { type: 'separator' as const, margin: 'lg', color: '#f0f0f0' }

                        // Merge
                        ; (priceBubble.body as any).contents = [
                            ...priceBodyContents,
                            separator,
                            ...extraContents
                        ]
                }

                return {
                    message: {
                        type: 'flex' as const,
                        altText: `${symbol} 市場分析`,
                        contents: priceBubble // Now merged
                    },
                    metadata: {
                        trigger: 'crypto_symbol',
                        intent: 'price_query',
                        symbol: symbol,
                        apiCalls: ['okx', 'binance', 'coinglass']
                    }
                }
            }

            // Fallback to basic Price Card
            return {
                message: { ...priceCardMsg, type: 'flex' as const },
                metadata: {
                    trigger: 'crypto_symbol',
                    intent: 'price_query',
                    symbol: symbol,
                    apiCalls: ['okx', 'binance']
                }
            }

        } catch (e: any) {
            logger.error('CryptoHandler Error:', e)
            return {
                message: null,
                metadata: {
                    trigger: 'crypto_error',
                    intent: 'price_query',
                    symbol: symbol,
                    error: e.message
                }
            }
        }
    }
}
