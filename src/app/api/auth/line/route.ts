import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json()

        if (!idToken) {
            return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
        }

        const channelId = process.env.NEXT_PUBLIC_LIFF_ID?.split('-')[0] // Assuming LIFF ID is ChannelID-AppID format? No, LIFF ID is separate. We need Channel ID.
        // Actually for verify, we need the Channel ID. 
        // The user provided LIFF ID. Usually we need Channel ID for verify. 
        // However, verify endpoint just needs id_token and client_id (Channel ID).
        // Let's assume we might not have Channel ID in env yet.
        // But wait, the verify endpoint is: POST https://api.line.me/oauth2/v2.1/verify

        // Simplification for MVP: We trust the idToken content if we can decode it, BUT we MUST verify signature.
        // Correct way: Call https://api.line.me/oauth2/v2.1/verify with id_token and client_id.

        // For now, let's just use the LINE PROFILE endpoint with Access Token if we had it, but we have ID Token.
        // Let's use the verify endpoint.

        // If we don't have CHANNEL_ID in env, we can't secure verify. 
        // User only was asked for LIFF_ID. 
        // Let's assume for now we just parse the simple profile from payload if verification fails or skip strict verify if dev.
        // BUT, security is key.

        // Alternative: Client sends Access Token, Server calls https://api.line.me/v2/profile
        // This is easier as it doesn't require Channel ID to verify, just the Token. 
        // Let's switch to AccessToken based auth for simplicity in MVP configuration.

        // Wait, the client code (LiffProvider) gets `profile`. 
        // Secure way: Client sends `accessToken`. Server calls LINE `POST /v2/profile`.

        const { accessToken } = await req.json() // Changing to expect accessToken as well or instead.

        if (accessToken) {
            const profileRes = await fetch('https://api.line.me/v2/profile', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            if (!profileRes.ok) {
                return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
            }

            const profile = await profileRes.json()
            const { userId, displayName, pictureUrl } = profile

            // Upsert user
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    line_user_id: userId,
                    display_name: displayName,
                    picture_url: pictureUrl,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'line_user_id' })
                .select()
                .single()

            if (error) {
                console.error('Supabase Upsert Error:', error)
                return NextResponse.json({ error: 'Database error' }, { status: 500 })
            }

            return NextResponse.json({ user: data })
        }

        return NextResponse.json({ error: 'No access token provided' }, { status: 400 })

    } catch (e) {
        console.error('Auth Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
