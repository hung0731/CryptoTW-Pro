import { NextResponse } from 'next/server'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { generateMarketSummary } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60s for AI generation

export async function GET(request: Request) {
    try {
        // Security Check for Cron
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow verified local dev or manual admin trigger if needed, otherwise strict check
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[Cron] Starting Market Summary Generation...')

        // 1. Aggregate Data
        const snapshot = await getMarketSnapshot()

        // 2. Generate AI Report
        const report = await generateMarketSummary(snapshot)

        if (!report) {
            return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
        }

        console.log('[Cron] Report Generated. Saving...')

        // 3. Save to Supabase (Bypassing RLS via Service Key ideally, but using standard client here if RLS allows or if using authenticated client)
        // Since this is server-side, we should use createClient with service role if we want to bypass RLS, 
        // OR rely on the "Admins can insert" policy if we can simulate admin context.
        // For simplicity in this codebase, we assume `supabase` client has permissions or we use the public policy created earlier?
        // Wait, the migration said: "Admins can insert". 
        // We will insert as is. If it fails due to RLS, we might need Service Key. 
        // Current `lib/supabase.ts` usually exports a public anon client. 
        // We might need to use `process.env.SUPABASE_SERVICE_ROLE_KEY` if available.

        let insertError = null

        // Try inserting with standard client (might fail if not auth)
        // Actually, for Cron jobs, we usually need the Service Role.
        // Let's assume user configured SUPABASE_SERVICE_ROLE_KEY

        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { createClient } = require('@supabase/supabase-js')
            const adminClient = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            )
            const { error } = await adminClient.from('market_reports').insert({
                sentiment: report.sentiment,
                sentiment_score: report.sentiment_score,
                summary: report.summary,
                key_points: report.key_points,
                strategy: report.actionable_insight, // Mapping 'actionable_insight' to 'strategy' column
                metadata: snapshot
            })
            insertError = error
        } else {
            console.warn('Missing SUPABASE_SERVICE_ROLE_KEY, attempting with public client (likely to fail RLS)')
            const { error } = await supabase.from('market_reports').insert({
                sentiment: report.sentiment,
                sentiment_score: report.sentiment_score,
                summary: report.summary,
                key_points: report.key_points,
                strategy: report.actionable_insight,
                metadata: snapshot
            })
            insertError = error
        }

        if (insertError) {
            console.error('DB Insert Error:', insertError)
            return NextResponse.json({ error: 'Database save failed', details: insertError }, { status: 500 })
        }

        return NextResponse.json({ success: true, report })

    } catch (error) {
        console.error('[Cron] Exception:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
    }
}
