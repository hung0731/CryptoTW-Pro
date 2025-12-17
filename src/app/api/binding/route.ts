import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getInviteeDetail, parseOkxData } from '@/lib/okx-affiliate'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'
import { verifyLineAccessToken } from '@/lib/line-auth'

// Default verification rules (fallback if DB config unavailable)
const DEFAULT_CONFIG = {
    okx_affiliate_code: 'CTW20',
    okx_min_deposit: 1,
    okx_require_kyc: true,
    auto_verify_enabled: true,
}

// Get verification config from database
async function getVerificationConfig(supabase: ReturnType<typeof createAdminClient>) {
    try {
        const { data } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'verification_rules')
            .single()

        if (data?.value) {
            return { ...DEFAULT_CONFIG, ...data.value }
        }
    } catch (e) {
        console.error('[Binding] ⚠️ FALLBACK: Using default config (DB unavailable)', {
            error: e instanceof Error ? e.message : 'Unknown error'
        })
        // TODO: Integrate alerting system (Sentry, Discord webhook, etc.)
    }
    return DEFAULT_CONFIG
}

// Allowed exchanges
const ALLOWED_EXCHANGES = ['okx', 'binance', 'bybit']

export async function POST(req: NextRequest) {
    // Rate limit: 5 binding requests per minute per IP (prevent abuse)
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

        const supabase = createAdminClient()
        const { exchange, uid } = await req.json()

        // 1. Basic field validation (lineUserId now comes from verified token)
        if (!exchange || !uid) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // 2. Validate exchange name (whitelist)
        const normalizedExchange = exchange.toLowerCase().trim()
        if (!ALLOWED_EXCHANGES.includes(normalizedExchange)) {
            return NextResponse.json({ error: 'Invalid exchange' }, { status: 400 })
        }

        // 3. Validate UID format (5-20 digits, numbers only)
        const trimmedUid = uid.trim()
        if (!/^\d{5,20}$/.test(trimmedUid)) {
            return NextResponse.json({ error: 'Invalid UID format (5-20 digits required)' }, { status: 400 })
        }

        // Note: lineUserId validation is no longer needed here as it comes from verified LINE token

        // 1. Get User ID from verified LINE user ID (not from request body!)
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, line_user_id, display_name')
            .eq('line_user_id', verifiedLineUserId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. For OKX bindings, try auto-verification
        let autoVerified = false
        let okxUpdateData = {}
        let rejectionReason: string | null = null

        if (normalizedExchange === 'okx') {
            // Get verification config from database
            const config = await getVerificationConfig(supabase)

            if (!config.auto_verify_enabled) {
                console.log('[Binding] Auto-verify disabled, skipping')
            } else {
                try {
                    console.log('[Binding] Checking OKX API for UID:', trimmedUid)
                    const okxData = await getInviteeDetail(trimmedUid)

                    if (okxData) {
                        console.log('[Binding] OKX data received:', JSON.stringify(okxData))

                        // Parse and prepare update data
                        okxUpdateData = parseOkxData(okxData)

                        // Check auto-verification criteria using DB config
                        const affiliateMatch = okxData.affiliateCode === config.okx_affiliate_code
                        const hasKyc = !config.okx_require_kyc || (!!okxData.kycTime && okxData.kycTime !== '')
                        const hasDeposit = parseFloat(okxData.depAmt) >= config.okx_min_deposit

                        console.log('[Binding] Verification check:', {
                            config,
                            affiliateCode: okxData.affiliateCode,
                            affiliateMatch,
                            kycTime: okxData.kycTime,
                            hasKyc,
                            depAmt: okxData.depAmt,
                            hasDeposit
                        })

                        if (affiliateMatch && hasKyc && hasDeposit) {
                            autoVerified = true
                            console.log('[Binding] ✅ Auto-verified!')
                        } else {
                            // Build rejection reason
                            const reasons: string[] = []
                            if (!affiliateMatch) reasons.push(`邀請碼不符 (需 ${config.okx_affiliate_code}，實際 ${okxData.affiliateCode})`)
                            if (!hasKyc) reasons.push('尚未完成 KYC')
                            if (!hasDeposit) reasons.push(`入金不足 (需 ≥$${config.okx_min_deposit}，實際 $${okxData.depAmt})`)
                            rejectionReason = reasons.join('; ')
                            console.log('[Binding] ❌ Auto-verify failed:', rejectionReason)
                        }
                    } else {
                        rejectionReason = `OKX API 查無此 UID，請確認是否已使用推薦碼 ${config.okx_affiliate_code} 註冊`
                        console.log('[Binding] ❌ OKX API returned no data for UID:', trimmedUid)
                    }
                } catch (okxError) {
                    console.error('[Binding] OKX API error:', okxError)
                    // If API fails, fall back to manual review
                    rejectionReason = null // Don't set reason, just pending
                }
            }
        }

        // 3. Insert Binding with appropriate status
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

        // 4. Update user membership status
        if (autoVerified) {
            // Auto-verified: upgrade to pro immediately
            await supabase
                .from('users')
                .update({ membership_status: 'pro', updated_at: new Date().toISOString() })
                .eq('id', user.id)

            // Send LINE notification for auto-verification
            try {
                const { pushMessage } = await import('@/lib/line-bot')
                await pushMessage(verifiedLineUserId, [{
                    type: 'text',
                    text: '🎉 恭喜！您的 OKX 帳號已自動驗證通過，Pro 會員資格已開通！'
                }])
            } catch (e) {
                console.error('[Binding] Failed to send LINE notification:', {
                    message: e instanceof Error ? e.message : 'Unknown error'
                })
            }

            return NextResponse.json({
                success: true,
                binding: data,
                autoVerified: true,
                message: '🎉 驗證通過！Pro 會員已開通'
            })
        } else {
            // Not auto-verified: set to pending
            await supabase
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
        console.error('[Binding] API Error:', {
            message: e instanceof Error ? e.message : 'Unknown error',
            // Only include stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: (e as Error).stack })
        })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
