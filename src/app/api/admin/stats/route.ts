import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const supabase = createAdminClient()

        // 1. Basic Stats (Parallel Fetch)
        const results = await Promise.all([
            // Total
            supabase.from('users').select('*', { count: 'exact', head: true }),
            // Pro
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('membership_status', 'pro'),
            // Pending
            supabase.from('exchange_bindings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            // VIP
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('membership_status', 'vip'),
            // User Growth Data (Last 30 Days) - Fetch created_at only
            supabase
                .from('users')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true }),
            // OKX Verified Bindings
            supabase.from('exchange_bindings').select('*', { count: 'exact', head: true }).eq('exchange_name', 'okx').eq('status', 'verified'),
            // LBank Verified Bindings
            supabase.from('exchange_bindings').select('*', { count: 'exact', head: true }).eq('exchange_name', 'lbank').eq('status', 'verified')
        ])

        const totalUsers = results[0].count
        const verifiedUsers = results[1].count
        const pendingBindings = results[2].count
        const vipUsers = results[3].count
        const recentUsers = results[4].data
        const okxUsers = results[5].count
        const lbankUsers = results[6].count

        // 2. Aggregate User Growth (Daily)
        const dailyGrowth: Record<string, number> = {}
        const today = new Date()
        // Initialize last 30 days with 0
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().split('T')[0] // YYYY-MM-DD
            dailyGrowth[key] = 0
        }

        // Fill real data
        recentUsers?.forEach((u: any) => {
            const key = new Date(u.created_at).toISOString().split('T')[0]
            if (dailyGrowth[key] !== undefined) {
                dailyGrowth[key]++
            }
        })

        const userGrowthChart = Object.entries(dailyGrowth).map(([date, count]) => ({
            date: date.slice(5), // MM-DD
            value: count
        }))

        // 3. Mock Volume/Revenue Data (Until we have real transaction logs synced)
        // In production, this would verify against an aggregations table
        const volumeTrendChart = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return {
                date: d.toISOString().slice(5, 10), // MM-DD
                volume: Math.floor(Math.random() * 5000000) + 1000000, // 1M - 6M mockup
                commission: Math.floor(Math.random() * 5000) + 1000      // 1K - 6K mockup
            }
        })

        return NextResponse.json({
            stats: {
                total_users: totalUsers || 0,
                verified_users: verifiedUsers || 0,
                okx_users: okxUsers || 0,
                lbank_users: lbankUsers || 0,
                pending_bindings: pendingBindings || 0,
                vip_users: vipUsers || 0,
                // Mock total volume/commission for now
                total_volume: 125400000,
                total_commission: 45200
            },
            charts: {
                userGrowth: userGrowthChart,
                volumeTrend: volumeTrendChart
            }
        })

    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Stats API Error', err, { feature: 'admin-api', endpoint: 'stats' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
