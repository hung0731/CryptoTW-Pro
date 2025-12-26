import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient()

        // 1. Get User ID safely
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            // Need to double check how "binding" route works. 
            // In binding route, it queried users table by lineUserID. 
            // Here we assume standard auth flow or we need to handle LINE user mapping if auth.uid() is not used.
            // Let's try standard auth.getUser() first. 
            // If the client is using LINE Login and exchanging for Supabase Session, this works.
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Fetch User Rewards
        const { data, error } = await supabase
            .from('user_rewards')
            .select('reward_id, status, created_at')
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ rewards: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { rewardId, status } = await req.json()

        if (!rewardId) {
            return NextResponse.json({ error: 'Missing Reward ID' }, { status: 400 })
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Upsert user reward status
        const { data, error } = await supabase
            .from('user_rewards')
            .upsert({
                user_id: user.id,
                reward_id: rewardId,
                status: status || 'claimed',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, reward_id' })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, reward: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
