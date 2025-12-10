import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const supabase = createClient()

        // In a real app, we should verify Admin status here using Middleware or Session
        // For now assuming the page is protected or user validation happens on client/middleware

        const { data, error } = await supabase
            .from('vip_applications')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ applications: data })
    } catch (error) {
        console.error('Admin VIP Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
