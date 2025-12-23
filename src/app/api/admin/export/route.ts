import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('exchange_bindings')
            .select(`
                *,
                user:users (
                    display_name,
                    line_user_id
                )
            `)
            .eq('status', 'verified')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Convert to CSV
        const headers = ['User ID', 'Display Name', 'LINE ID', 'Exchange', 'UID', 'Linked At']
        const rows = data.map((b: any) => [
            b.user_id,
            b.user?.display_name || 'Unknown',
            b.user?.line_user_id || 'Unknown',
            b.exchange_name,
            b.exchange_uid,
            new Date(b.created_at).toISOString()
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
        ].join('\n')

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="verified_users_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        logger.error('Export API Error', err, { feature: 'admin-api', endpoint: 'export' })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
