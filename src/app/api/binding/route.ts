import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase'
import { getInviteeDetail, parseOkxData } from '@/lib/okx-affiliate'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { verifyLineAccessToken } from '@/lib/line-auth'

// Define Config Type
interface VerificationConfig {
    okx_affiliate_code: string
    okx_min_deposit: number
    okx_require_kyc: boolean
    auto_verify_enabled: boolean
}

// Get verification config from database
// NOW SAFE: Uses provided client (User Client with RLS is fine for reading public system config, or Admin Client if needed)
// If you want to keep config hidden from public RLS, this helper might need AdminClient, 
// but for now let's assume system_config is readable or we use AdminClient JUST for this config fetch if it's sensitive.
// DECISION: Verification rules are business logic, better to fetch with AdminClient to ensure we get them regardless of RLS, 
// BUT this function is called inside the user flow. 
// To correspond with the plan "Use User Client for data fetching", we should ideally use User Client. 
// However, if RLS prevents reading 'system_config', we might fail.
// SAFE HYBRID APPROACH: Use a specific localized admin client just for fetching config to ensure reliability, 
// but keeping the main logic user-bound.
async function getVerificationConfig() {
    const supabase = createAdminClient()
    try {
        const { data } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'verification_rules')
            .single()

        if (data?.value) {
            return data.value as VerificationConfig
        }
    } catch (e) {
        console.error('[Binding] Failed to fetch config:', e)
    }
    return null // No fallback to hardcoded insecure defaults
}

// Allowed exchanges
const ALLOWED_EXCHANGES = ['okx', 'binance', 'bybit']

export async function POST(req: NextRequest) {
    // Rate limit: 5 binding requests per minute per IP
    const rateLimited = simpleApiRateLimit(req, 'binding', 5, 60)
    if (rateLimited) return rateLimited

    try {
        // Security: Verify LINE Access Token
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 })
        }
        const accessToken = authHeader.slice(7)
        const tokenVerification = await verifyLineAccessToken(accessToken)
        if (!tokenVerification.valid || !tokenVerification.userId) {
            console.warn('[Binding] Token verification failed:', tokenVerification.error)
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
        }
        const verifiedLineUserId = tokenVerification.userId

        // 1. Use User Client (Least Privilege)
        const supabase = createClient()
        const { exchange, uid } = await req.json()

        // 2. validation
        if (!exchange || !uid) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const normalizedExchange = exchange.toLowerCase().trim()
        if (!ALLOWED_EXCHANGES.includes(normalizedExchange)) {
            return NextResponse.json({ error: 'Invalid exchange' }, { status: 400 })
        }

        const trimmedUid = uid.trim()
        if (!/^\d{5,20}$/.test(trimmedUid)) {
            return NextResponse.json({ error: 'Invalid UID format (5-20 digits required)' }, { status: 400 })
        }

        // 3. Get User ID from verified LINE user ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, line_user_id, display_name')
            .eq('line_user_id', verifiedLineUserId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 4. For OKX bindings, try auto-verification
        let autoVerified = false
        let okxUpdateData = {}
        let rejectionReason: string | null = null

        if (normalizedExchange === 'okx') {
            // Securely fetch config
            const config = await getVerificationConfig()

            if (!config) {
                console.error('[Binding] Critical: Verification config missing')
                // Fail safe: Don't auto-verify if we can't check rules
                rejectionReason = '系統暫時無法驗證，將轉為人工審核'
            } else if (!config.auto_verify_enabled) {
                console.log('[Binding] Auto-verify disabled by config')
            } else {
                try {
                    console.log('[Binding] Checking OKX API for UID:', trimmedUid)
                    const okxData = await getInviteeDetail(trimmedUid)

                    if (okxData) {
                        okxUpdateData = parseOkxData(okxData)

                        const affiliateMatch = okxData.affiliateCode === config.okx_affiliate_code
                        const hasKyc = !config.okx_require_kyc || (!!okxData.kycTime && okxData.kycTime !== '')
                        const hasDeposit = parseFloat(okxData.depAmt) >= config.okx_min_deposit

                        if (affiliateMatch && hasKyc && hasDeposit) {
                            autoVerified = true
                        } else {
                            const reasons: string[] = []
                            if (!affiliateMatch) reasons.push(`邀請碼不符`)
                            if (!hasKyc) reasons.push('尚未完成 KYC')
                            if (!hasDeposit) reasons.push(`入金不足`)
                            rejectionReason = reasons.join('; ')
                        }
                    } else {
                        rejectionReason = `OKX API 查無此 UID`
                    }
                } catch (okxError) {
                    console.error('[Binding] OKX API error:', okxError)
                    rejectionReason = null
                }
            }
        }

        // 5. Insert Binding (Using User Client - RLS must allow insert for own user_id)
        const bindingStatus = autoVerified ? 'verified' : 'pending'

        const { data, error } = await supabase
            .from('exchange_bindings')
            .insert({
                user_id: user.id,
                exchange_name: exchange,
                exchange_uid: trimmedUid,
                status: bindingStatus,
                rejection_reason: autoVerified ? null : rejectionReason,
                ...okxUpdateData
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: '您已提交過此交易所的 UID' }, { status: 409 })
            }
            console.error('Binding Error', error)
            return NextResponse.json({ error: 'Failed to submit binding' }, { status: 500 })
        }

        // 6. Update user membership status (Privileged Operation)
        if (autoVerified) {
            try {
                // ELEVATED PRIVILEGES BEGIN
                const adminSupabase = createAdminClient()

                await adminSupabase
                    .from('users')
                    .update({ membership_status: 'pro', updated_at: new Date().toISOString() })
                    .eq('id', user.id)
                // ELEVATED PRIVILEGES END

                // Send Notification
                const { pushMessage } = await import('@/lib/line-bot')
                await pushMessage(verifiedLineUserId, [{
                    type: 'text',
                    text: '🎉 恭喜！您的 OKX 帳號已自動驗證通過，Pro 會員資格已開通！'
                }]).catch(e => console.error('Push error:', e))

                return NextResponse.json({
                    success: true,
                    binding: data,
                    autoVerified: true,
                    message: '🎉 驗證通過！Pro 會員已開通'
                })
            } catch (upgradeError) {
                console.error('[Binding] Upgrade failed:', upgradeError)
                // If upgrade fails, we still returned success for binding, but user isn't upgraded.
                // Ideally we should transaction this, but Supabase HTTP API doesn't support easy transactions across calls.
                // We will log critical error.
                return NextResponse.json({
                    success: true,
                    binding: data,
                    autoVerified: true,
                    warning: '驗證通過但會員狀態更新失敗，請聯繫管理員'
                })
            }
        } else {
            // Check if we need to set pending status
            // Using User Client (RLS might allow updating own status to pending? Or RLS prevents update?)
            // Usually users can't update their own membership_status.
            // So we use AdminClient here too if we need to change status.

            // Logic: "Not auto-verified: set to pending". 
            // Only if current status is 'free'.

            const adminSupabase = createAdminClient()
            await adminSupabase
                .from('users')
                .update({ membership_status: 'pending' })
                .eq('id', user.id)
                .eq('membership_status', 'free')

            return NextResponse.json({
                success: true,
                binding: data,
                autoVerified: false,
                message: rejectionReason
                    ? `⚠️ 自動驗證未通過：${rejectionReason}。已提交人工審核。`
                    : '已提交審核，我們將在 24 小時內驗證您的資訊。'
            })
        }
    } catch (e) {
        console.error('[Binding] API Error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
