import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import jwt from 'jsonwebtoken'

// Token cache for anti-replay (in-memory, per instance)
// In production, consider using Redis for distributed systems
const usedTokens = new Map<string, number>()
const TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

// Clean up expired tokens periodically
function cleanupExpiredTokens() {
    const now = Date.now()
    for (const [token, timestamp] of usedTokens.entries()) {
        if (now - timestamp > TOKEN_EXPIRY_MS) {
            usedTokens.delete(token)
        }
    }
}

export async function POST(req: NextRequest) {
    const requestId = crypto.randomUUID()
    const feature = 'auth-line'

    try {
        const body = await req.json()
        const { accessToken } = body

        // 1. Validate input
        if (!accessToken || typeof accessToken !== 'string') {
            logger.warn('Missing accessToken', { feature, requestId })
            return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 })
        }

        // 2. Rate limit by IP (10 auth attempts per minute)
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        const { success: rateLimitOk } = await rateLimit(`auth:${ip}`, 10, 60)
        if (!rateLimitOk) {
            logger.warn('Rate limit exceeded', { feature, requestId, ip })
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        // 3. Verify LINE Token & Get Profile
        // logger.info('Verifying LINE token', { feature, requestId })
        const profileRes = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        if (!profileRes.ok) {
            const errorText = await profileRes.text()
            logger.error('Invalid LINE access token', new Error(errorText), { feature, requestId, status: profileRes.status })
            return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
        }

        const profile = await profileRes.json()
        const { userId: lineUserId, displayName, pictureUrl } = profile

        // Validate LINE userId format (basic sanity check)
        if (!lineUserId || typeof lineUserId !== 'string' || lineUserId.length < 10) {
            logger.error('Invalid LINE profile data received', new Error(`Invalid UserID: ${lineUserId}`), { feature, requestId })
            return NextResponse.json({ error: 'Invalid LINE profile' }, { status: 400 })
        }

        logger.info('LINE Auth Success', { feature, requestId, lineUserId, displayName })

        // 4. Init Admin Client (required for auth.admin operations)
        const supabase = createAdminClient()

        // 5. Upsert Public User to get UUID
        const { data: publicUser, error: upsertError } = await supabase
            .from('users')
            .upsert({
                line_user_id: lineUserId,
                display_name: displayName,
                picture_url: pictureUrl,
                updated_at: new Date().toISOString()
            }, { onConflict: 'line_user_id' })
            .select()
            .single()

        if (upsertError || !publicUser) {
            logger.error('Supabase Upsert Error', upsertError instanceof Error ? upsertError : new Error(String(upsertError)), { feature, requestId })
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // 6. Sync with Auth Users (Ensure Auth User exists with same UUID)
        const { data: authUser, error: getAuthError } = await supabase.auth.admin.getUserById(publicUser.id)

        if (getAuthError || !authUser.user) {
            // User doesn't exist in Auth, create it
            const dummyEmail = `${lineUserId}@line.login.cryptotw`
            // logger.info('Creating new Auth User', { feature, requestId, userId: publicUser.id })

            const { error: createAuthError } = await supabase.auth.admin.createUser({
                id: publicUser.id,
                email: dummyEmail,
                email_confirm: true,
                user_metadata: { line_user_id: lineUserId, display_name: displayName }
            })

            if (createAuthError) {
                logger.error('Create Auth User Error', createAuthError instanceof Error ? createAuthError : new Error(String(createAuthError)), { feature, requestId })
                return NextResponse.json({ error: 'Auth creation failed' }, { status: 500 })
            }
        }

        // 7. Mint Supabase JWT
        const jwtSecret = process.env.SUPABASE_JWT_SECRET
        if (!jwtSecret) {
            logger.error('Missing SUPABASE_JWT_SECRET', { feature, requestId })
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const token = jwt.sign({
            aud: 'authenticated',
            role: 'authenticated',
            sub: publicUser.id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
            app_metadata: {
                provider: 'line',
                providers: ['line']
            },
            user_metadata: {
                full_name: displayName,
                avatar_url: pictureUrl
            }
        }, jwtSecret)

        return NextResponse.json({
            user: publicUser,
            session: {
                access_token: token,
                token_type: 'bearer',
                user: {
                    id: publicUser.id,
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: `${lineUserId}@line.login.cryptotw`,
                    app_metadata: { provider: 'line' },
                    user_metadata: { full_name: displayName }
                }
            }
        })

    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Unhandled Auth Route Error', err, { feature: 'auth-line', requestId })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
