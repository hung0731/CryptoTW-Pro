
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // Fetch verified bindings joined with user data
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
        console.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
