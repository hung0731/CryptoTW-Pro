import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('market_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching market summary:', error)
            return NextResponse.json({ report: null })
        }

        // Merge metadata fields into the response for frontend consumption
        const report = {
            ...data,
            headline: data.metadata?.headline || data.summary,
            analysis: data.metadata?.analysis,
            action_suggestion: data.metadata?.action_suggestion,
        }

        return NextResponse.json({ report })
    } catch (e) {
        console.error('Market Summary API Error:', e)
        return NextResponse.json({ report: null })
    }
}

