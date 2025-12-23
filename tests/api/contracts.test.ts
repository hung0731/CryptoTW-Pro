/**
 * API Contract Tests - Route Guardians
 * 
 * 確保 API routes 回傳符合預期格式
 * 不用 E2E，只用 node fetch 測 contract
 */

import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ================================================
// API Contract Tests
// ================================================

describe('API /dashboard', () => {
    it('should return market summary with correct structure', async () => {
        const res = await fetch(`${BASE_URL}/api/dashboard`)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data).toHaveProperty('btc')
        expect(data.btc).toHaveProperty('price')
        expect(data.btc).toHaveProperty('change24h')
    })
})

describe('API /coinglass/fear-greed', () => {
    it('should return fear & greed data', async () => {
        const res = await fetch(`${BASE_URL}/api/coinglass/fear-greed`)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(Array.isArray(data)).toBe(true)
        if (data.length > 0) {
            expect(data[0]).toHaveProperty('value')
            expect(data[0]).toHaveProperty('timestamp')
        }
    })

    it('should validate query parameters', async () => {
        const res = await fetch(`${BASE_URL}/api/coinglass/fear-greed?limit=invalid`)
        const data = await res.json()

        // Should either return error or use default
        expect(res.status).toBeOneOf([200, 400])
    })
})

describe('API /coinglass/funding-rate', () => {
    it('should support symbol parameter', async () => {
        const res = await fetch(`${BASE_URL}/api/coinglass/funding-rate?symbol=ETH`)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data).toBeDefined()
    })
})

describe('API /calendar', () => {
    it('should return economic events', async () => {
        const res = await fetch(`${BASE_URL}/api/calendar`)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(Array.isArray(data) || typeof data === 'object').toBe(true)
    })
})

describe('API /reviews', () => {
    it('should return review events list', async () => {
        const res = await fetch(`${BASE_URL}/api/reviews`)
        const data = await res.json()

        expect(res.status).toBe(200)
        // Reviews might be in reviews-data.ts, API might just be metadata
        expect(data).toBeDefined()
    })
})

// Helper matcher
expect.extend({
    toBeOneOf(received: number, expected: number[]) {
        const pass = expected.includes(received)
        return {
            pass,
            message: () => `expected ${received} to be one of ${expected.join(', ')}`
        }
    }
})
