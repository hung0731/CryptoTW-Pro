import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { accessToken } = body

        if (!accessToken) {
            return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 })
        }

        // 1. Verify LINE Token & Get Profile
        const profileRes = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        if (!profileRes.ok) {
            return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
        }

        const profile = await profileRes.json()
        const { userId: lineUserId, displayName, pictureUrl } = profile

        // 2. Init Admin Client
        const supabase = createAdminClient()

        // 3. Upsert Public User to get UUID
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
            console.error('Supabase Upsert Error:', upsertError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // 4. Sync with Auth Users (Ensure Auth User exists with same UUID)
        const { data: authUser, error: getAuthError } = await supabase.auth.admin.getUserById(publicUser.id)

        if (getAuthError || !authUser.user) {
            // User doesn't exist in Auth, create it
            // Use a dummy email for mapping (LINE users might not provide email)
            const dummyEmail = `${lineUserId}@line.login.cryptotw`

            const { error: createAuthError } = await supabase.auth.admin.createUser({
                id: publicUser.id, // FORCE SAME UUID
                email: dummyEmail,
                email_confirm: true,
                user_metadata: { line_user_id: lineUserId, display_name: displayName }
            })

            if (createAuthError) {
                console.error('Create Auth User Error:', createAuthError)
                return NextResponse.json({ error: 'Auth creation failed' }, { status: 500 })
            }
        }

        // 5. Mint Supabase JWT (Custom Token)
        const jwtSecret = process.env.SUPABASE_JWT_SECRET
        if (!jwtSecret) {
            console.error('Missing SUPABASE_JWT_SECRET')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Payload must match Supabase expectation
        const token = jwt.sign({
            aud: 'authenticated',
            role: 'authenticated',
            sub: publicUser.id, // The User UUID
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
        console.error('Auth Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
