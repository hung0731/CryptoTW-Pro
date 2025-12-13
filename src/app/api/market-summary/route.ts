import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

export async function GET() {
    try {
        // Fetch the latest report
        const { data, error } = await supabase
            .from('market_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            // If table doesn't exist or empty, return null gracefully (or demo data)
            console.error('Error fetching market summary:', error)
            return NextResponse.json({ report: null })
        }

        return NextResponse.json({ report: data })
    } catch (e) {
        console.error('Market Summary API Error:', e)
        return NextResponse.json({ report: null })
    }
}
