/**
 * Market Data Schemas
 * 
 * Zod schemas for validating external API responses
 * Ensures type safety at runtime boundaries
 */

import { z } from 'zod'

// ================================================
// BTC Ticker Schema
// ================================================

export const BtcTickerSchema = z.object({
    symbol: z.string(),
    price: z.number(),
    change24h: z.number(),
    high24h: z.number(),
    low24h: z.number(),
    volume24h: z.number().optional(),
    marketCap: z.number().optional()
})

export type BtcTicker = z.infer<typeof BtcTickerSchema>

// ================================================
// Market Snapshot Schema
// ================================================

export const MarketSnapshotSchema = z.object({
    btc: z.object({
        price: z.number(),
        change24h: z.number(),
        high24h: z.number(),
        low24h: z.number(),
        volume24h: z.number().optional()
    }),
    sentiment: z.object({
        fearGreed: z.number().min(0).max(100),
        fundingRate: z.number(),
        longShortRatio: z.number(),
        openInterest: z.number()
    }).optional(),
    timestamp: z.string().datetime()
})

export type MarketSnapshot = z.infer<typeof MarketSnapshotSchema>

// ================================================
// Raw Market Data (for signal-engine input)
// ================================================

export const RawMarketDataSchema = z.object({
    oi_change_24h: z.number().optional(),
    total_oi: z.number().optional(),
    funding_rate: z.number().optional(),
    long_short_ratio: z.number().optional(),
    top_trader_long_short_ratio: z.number().optional(),
    liquidation_above_usd: z.number().optional(),
    liquidation_below_usd: z.number().optional(),
    liquidation_total_24h: z.number().optional(),
    liquidation_long_24h: z.number().optional(),
    liquidation_short_24h: z.number().optional(),
    price: z.number().optional(),
    price_change_24h: z.number().optional(),
    price_high_24h: z.number().optional(),
    price_low_24h: z.number().optional(),
    whale_long_count: z.number().optional(),
    whale_short_count: z.number().optional(),
    whale_long_value: z.number().optional(),
    whale_short_value: z.number().optional(),
    whale_sentiment: z.string().optional()
})

export type RawMarketData = z.infer<typeof RawMarketDataSchema>
