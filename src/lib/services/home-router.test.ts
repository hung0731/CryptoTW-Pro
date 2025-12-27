import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomeRouterService } from './home-router'
import { CACHE_KEYS } from '@/lib/cache-keys'

// Mock Dependencies
vi.mock('@/lib/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn()
    }
}))

vi.mock('@/app/api/market/derivatives/route', () => ({
    getDerivativesData: vi.fn().mockResolvedValue({
        metrics: { fundingRate: 0.0001, lsRatio: 1.2, longLiq: 50, shortLiq: 50 }
    })
}))

vi.mock('@/app/api/market/whales/route', () => ({
    getWhaleData: vi.fn().mockResolvedValue({ summary: 'Whales accumulated' })
}))

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                        data: [{ sentiment_score: 60, metadata: { market_structure: { bias: 'Neutral' } } }]
                    })
                })
            })
        })
    }
}))

vi.mock('@/lib/coinglass', () => ({
    cachedCoinglassV4Request: vi.fn().mockResolvedValue([])
}))

vi.mock('@/lib/ai', () => ({
    generateMarketContextBrief: vi.fn().mockResolvedValue({ sentiment: 'neutral' }),
    generateAIDecision: vi.fn().mockResolvedValue({ decision: 'HOLD' })
}))

vi.mock('@/lib/cache', () => ({
    getCache: vi.fn().mockResolvedValue(null),
    setCache: vi.fn().mockResolvedValue(undefined),
    withCache: vi.fn().mockImplementation((key, ttl, fn) => fn()) // Bypass cache wrapper
}))

describe('HomeRouterService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should generate valid router data with all dependencies', async () => {
        const data = await HomeRouterService.getRouterData(true)

        expect(data).toBeDefined()
        expect(data.mainline).toBeDefined()
        expect(data.aiDecision).toEqual({ decision: 'HOLD' })  // From mock
        expect(data.marketContext).toEqual({ sentiment: 'neutral' }) // From mock
    })

    it('should handle API failures gracefully', async () => {
        // Mock failure for one dependency
        const { getDerivativesData } = await import('@/app/api/market/derivatives/route')
            ; (getDerivativesData as any).mockRejectedValue(new Error('API fail'))

        const data = await HomeRouterService.getRouterData()

        // Should still return data, just with defaults/fallbacks
        expect(data).toBeDefined()
        expect(data.mainline.dimensions).toBeDefined()
    })
})
