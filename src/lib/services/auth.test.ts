import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './auth'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            setSession: vi.fn().mockResolvedValue({ data: { session: {} }, error: null })
        }
    }
}))

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
    })

    it('should successfully sync with backend', async () => {
        const mockResponse = {
            user: { id: 'test-user' },
            session: { access_token: 'valid' },
            isNewUser: false
        }

            // Mock fetch response
            ; (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            })

        const result = await AuthService.syncWithBackend('fake-access-token')

        expect(global.fetch).toHaveBeenCalledWith('/api/auth/line', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ accessToken: 'fake-access-token' })
        }))
        expect(result).toEqual(mockResponse)
    })

    it('should throw error when backend returns non-ok status', async () => {
        ; (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Invalid token' })
        })

        await expect(AuthService.syncWithBackend('bad-token')).rejects.toThrow('Invalid token')
    })
})
