import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// Default verification config
const DEFAULT_CONFIG = {
    okx_affiliate_code: 'CTW20',
    okx_min_deposit: 1,
    okx_require_kyc: true,
    auto_verify_enabled: true,
}

export async function GET() {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const supabase = createAdminClient()

        // Try to get config from system_config table
        const { data, error } = await supabase
            .from('system_config')
            .select('*')
            .eq('key', 'verification_rules')
            .single()

        if (error || !data) {
            // Return default config if not found
            return NextResponse.json({ config: DEFAULT_CONFIG })
        }

        return NextResponse.json({ config: data.value })
    } catch (e) {
        console.error('Config GET error:', e)
        return NextResponse.json({ config: DEFAULT_CONFIG })
    }
}

export async function PUT(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const body = await req.json()
        const { okx_affiliate_code, okx_min_deposit, okx_require_kyc, auto_verify_enabled } = body

        const config = {
            okx_affiliate_code: okx_affiliate_code || DEFAULT_CONFIG.okx_affiliate_code,
            okx_min_deposit: Number(okx_min_deposit) || DEFAULT_CONFIG.okx_min_deposit,
            okx_require_kyc: okx_require_kyc ?? DEFAULT_CONFIG.okx_require_kyc,
            auto_verify_enabled: auto_verify_enabled ?? DEFAULT_CONFIG.auto_verify_enabled,
        }

        const supabase = createAdminClient()

        // Upsert the config
        const { error } = await supabase
            .from('system_config')
            .upsert({
                key: 'verification_rules',
                value: config,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'key'
            })

        if (error) throw error

        return NextResponse.json({ success: true, config })
    } catch (e: any) {
        console.error('Config PUT error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
