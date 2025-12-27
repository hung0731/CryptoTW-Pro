/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLiffInit } from './useLiffInit'

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn()
    }
}))

describe('useLiffInit', () => {
    const mockLiff = {
        init: vi.fn().mockResolvedValue(undefined),
        isLoggedIn: vi.fn(),
        isInClient: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        // Setup window.liff
        Object.defineProperty(window, 'liff', {
            value: mockLiff,
            writable: true
        })
    })

    afterEach(() => {
        delete (window as any).liff
    })

    it('should initialize LIFF successfully', async () => {
        const { result } = renderHook(() => useLiffInit('test-liff-id'))

        // Initially loading
        expect(result.current.isSdkLoading).toBe(true)

        // Wait for init
        await waitFor(() => {
            expect(result.current.isSdkLoading).toBe(false)
        })

        expect(mockLiff.init).toHaveBeenCalledWith({ liffId: 'test-liff-id' })
        expect(result.current.liffObject).toBe(mockLiff)
        expect(result.current.error).toBe(null)
    })

    it('should handle LIFF init error', async () => {
        mockLiff.init.mockRejectedValue(new Error('Init failed'))

        const { result } = renderHook(() => useLiffInit('test-liff-id'))

        await waitFor(() => {
            expect(result.current.isSdkLoading).toBe(false)
        })

        expect(result.current.error).toBeDefined()
        expect(result.current.error?.message).toBe('Init failed')
    })
})
