/**
 * Minimal Test Suite - 8 Guardians
 * 
 * 最小必做測試：守住核心邏輯與 API contracts
 * 不求 100% coverage，只要關鍵路徑有守門員
 */

import { describe, it, expect } from 'vitest'
import { buildCacheKey, buildCoinglassCacheKey } from '@/lib/cache-key-builder'
import { formatPercent, formatPrice, formatLargeNumber } from '@/lib/format-helpers'
import { generateMarketSignals } from '@/lib/signal-engine'
import type { RawMarketData } from '@/lib/signal-engine'

// ================================================
// Unit Tests (Domain Logic)
// ================================================

describe('Cache Key Builder', () => {
    it('should generate same key for same params in different order', () => {
        const key1 = buildCacheKey({
            baseKey: 'test',
            params: { symbol: 'BTC', interval: '1h' }
        })

        const key2 = buildCacheKey({
            baseKey: 'test',
            params: { interval: '1h', symbol: 'BTC' }
        })

        expect(key1).toBe(key2)
        expect(key1).toBe('test:interval=1h:symbol=BTC')
    })

    it('should use defaults for invalid params', () => {
        const key = buildCoinglassCacheKey('funding', {
            symbol: 'INVALID' as any,
            interval: 'invalid' as any
        })

        // Should fallback to defaults: BTC, 1h
        expect(key).toContain('symbol=BTC')
        expect(key).toContain('interval=1h')
    })
})

describe('Number Formatters', () => {
    it('should format percentages correctly', () => {
        expect(formatPercent(5.5)).toBe('+5.5%')
        expect(formatPercent(-12.3)).toBe('-12.3%')
        expect(formatPercent(15)).toBe('+15%')  // no decimal for > 10
        expect(formatPercent(0)).toBe('0%')
        expect(formatPercent(null)).toBe('—')
    })

    it('should format prices correctly', () => {
        expect(formatPrice(1234.56)).toBe('$1,234.56')
        expect(formatPrice(67890)).toBe('$67,890')  // no decimal for >= 1000
        expect(formatPrice(null)).toBe('—')
    })

    it('should format large numbers with abbreviations', () => {
        expect(formatLargeNumber(1200000000)).toBe('$1.2B')
        expect(formatLargeNumber(5600000)).toBe('$6M')
        expect(formatLargeNumber(7800)).toBe('$7.8K')
    })
})

describe('Judgment Engine', () => {
    it('should generate correct signals from market data', () => {
        const mockData: RawMarketData = {
            oi_change_24h: 15,  // High OI increase
            funding_rate: 0.02,  // High funding
            long_short_ratio: 1.5,  // Skewed to longs
            liquidation_above_usd: 100_000_000,
            liquidation_below_usd: 50_000_000,
            price_change_24h: 5
        }

        const signals = generateMarketSignals(mockData)

        // Should detect leverage buildup
        expect(signals.leverage_status).toContain('高')
        expect(signals.evidence.leverage.length).toBeGreaterThan(0)
    })

    it('should handle missing data gracefully', () => {
        const emptyData: RawMarketData = {}

        const signals = generateMarketSignals(emptyData)

        // Should not crash
        expect(signals).toBeDefined()
        expect(signals.leverage_status).toBeDefined()
    })
})
