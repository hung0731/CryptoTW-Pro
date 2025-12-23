/**
 * LINE Access Token verification utilities
 * Used to authenticate requests from LIFF applications
 */
import { logger } from '@/lib/logger'

interface TokenVerificationResult {
    valid: boolean
    userId?: string
    error?: string
}

/**
 * Verify a LINE Access Token and extract user information
 * @param accessToken - The LINE access token from LIFF
 * @returns Verification result with userId if valid
 */
export async function verifyLineAccessToken(accessToken: string): Promise<TokenVerificationResult> {
    try {
        // 1. Verify token with LINE API
        const verifyResponse = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ access_token: accessToken })
        })

        if (!verifyResponse.ok) {
            return { valid: false, error: 'Token verification failed' }
        }

        const verifyData = await verifyResponse.json()

        // 2. Verify client_id matches our LINE channel (prevent token from other apps)
        const expectedChannelId = process.env.LINE_CHANNEL_ID
        if (expectedChannelId && verifyData.client_id !== expectedChannelId) {
            logger.warn('[LINE Auth] Token client_id mismatch:', {
                feature: 'line-auth',
                expected: expectedChannelId,
                received: verifyData.client_id
            })
            return { valid: false, error: 'Token not from authorized app' }
        }

        // 3. Check token expiration
        if (verifyData.expires_in <= 0) {
            return { valid: false, error: 'Token expired' }
        }

        // 4. Get user profile to extract userId
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })

        if (!profileResponse.ok) {
            return { valid: false, error: 'Failed to get user profile' }
        }

        const profile = await profileResponse.json()

        if (!profile.userId) {
            return { valid: false, error: 'No userId in profile' }
        }

        return { valid: true, userId: profile.userId }
    } catch (e) {
        logger.error('[LINE Auth] Verification error:', e instanceof Error ? e : new Error('Unknown error'), { feature: 'line-auth' })
        return { valid: false, error: 'Verification error' }
    }
}
