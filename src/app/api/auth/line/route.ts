import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { idToken, accessToken } = body

        if (!idToken && !accessToken) {
            return NextResponse.json({ error: 'Missing idToken or accessToken' }, { status: 400 })
        }

        // Strategy 1: Use ID Token (Not implemented fully on client yet)
        if (idToken) {
            // ... verification logic would go here
        }

        // Strategy 2: Use Access Token (Implemented on client)
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

        return NextResponse.json({ error: 'Unsupported auth method' }, { status: 400 })

    } catch (e) {
        console.error('Auth Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
