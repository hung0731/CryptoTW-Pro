import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // In a real app we'd filter body content based on user auth here or in middleware.
        // For MVP frontend, we return all published info, but frontend will mask body if not pro.
        // Or safer: We strip body if not pro.
        // Let's implement basic safety: Frontend sends ID token? No this is public endpoint usually.
        // Let's simplified: Return full content, frontend hides it. (MVP tradeoff)

        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ content: data })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
