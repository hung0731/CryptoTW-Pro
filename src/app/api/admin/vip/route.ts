import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('vip_applications')
            .select(`
                *,
                user:users(display_name, picture_url)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ applications: data })
    } catch (error) {
        console.error('Admin VIP Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
