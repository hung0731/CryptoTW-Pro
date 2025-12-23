import crypto from 'crypto'
import { logger } from '@/lib/logger'

const OKX_API_BASE = 'https://www.okx.com'

interface OkxInviteeData {
    inviteeLevel: string      // "2" = 直客
    joinTime: string          // Unix timestamp (ms)
    inviteeRebateRate: string // 返佣比例 (0.01 = 1%)
    totalCommission: string   // 累計返佣 (USDT)
    firstTradeTime: string    // 首次交易時間
    level: string             // 平台等級 Lv1-5
    depAmt: string            // 累計充值 (USDT)
    volMonth: string          // 當月交易量 (USDT)
    accFee: string            // 累計手續費 (USDT)
    kycTime: string           // KYC2 時間
    region: string            // 國家/地區
    affiliateCode: string     // 節點邀請碼
}

interface OkxApiResponse<T> {
    code: string
    msg: string
    data: T[]
}

/**
 * Generate OKX API signature
 * sign = Base64(HmacSHA256(timestamp + method + requestPath + body, SecretKey))
 */
function generateSignature(
    timestamp: string,
    method: string,
    requestPath: string,
    body: string,
    secretKey: string
): string {
    const prehash = timestamp + method.toUpperCase() + requestPath + body
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(prehash)
    return hmac.digest('base64')
}

/**
 * Make authenticated request to OKX API
 */
async function okxRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params?: Record<string, string>,
    body?: object
): Promise<OkxApiResponse<T>> {
    const apiKey = process.env.OKX_API_KEY
    const secretKey = process.env.OKX_SECRET_KEY
    const passphrase = process.env.OKX_PASSPHRASE

    if (!apiKey || !secretKey || !passphrase) {
        throw new Error('Missing OKX API credentials in environment variables')
    }

    // Build request path with query params for GET
    let requestPath = endpoint
    if (method === 'GET' && params) {
        const queryString = new URLSearchParams(params).toString()
        requestPath = `${endpoint}?${queryString}`
    }

    const timestamp = new Date().toISOString()
    const bodyString = body ? JSON.stringify(body) : ''
    const signature = generateSignature(timestamp, method, requestPath, bodyString, secretKey)

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
    }

    const url = `${OKX_API_BASE}${requestPath}`

    const res = await fetch(url, {
        method,
        headers,
        body: method === 'POST' && body ? bodyString : undefined,
    })

    if (!res.ok) {
        const errorText = await res.text()
        logger.error('[OKX API] Error response:', new Error(errorText), { feature: 'okx-affiliate', errorText })
        throw new Error(`OKX API error: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

/**
 * Get invitee (被邀請人) details by UID
 * Endpoint: GET /api/v5/affiliate/invitee/detail
 */
export async function getInviteeDetail(uid: string): Promise<OkxInviteeData | null> {
    try {
        const response = await okxRequest<OkxInviteeData>(
            'GET',
            '/api/v5/affiliate/invitee/detail',
            { uid }
        )

        if (response.code !== '0') {
            logger.error('[OKX API] Error:', new Error(response.msg), { feature: 'okx-affiliate', msg: response.msg })
            return null
        }

        if (response.data && response.data.length > 0) {
            return response.data[0]
        }

        return null
    } catch (error) {
        logger.error('[OKX API] getInviteeDetail error:', error as Error, { feature: 'okx-affiliate' })
        return null
    }
}

/**
 * Parse OKX data to database-friendly format
 */
export function parseOkxData(data: OkxInviteeData) {
    return {
        monthly_volume: parseFloat(data.volMonth) || 0,
        accumulated_fee: parseFloat(data.accFee) || 0,
        total_commission: parseFloat(data.totalCommission) || 0,
        deposit_amount: parseFloat(data.depAmt) || 0,
        okx_level: data.level,
        rebate_rate: parseFloat(data.inviteeRebateRate) || 0,
        first_trade_at: data.firstTradeTime ? new Date(parseInt(data.firstTradeTime)) : null,
        kyc_at: data.kycTime ? new Date(parseInt(data.kycTime)) : null,
        join_time: data.joinTime ? new Date(parseInt(data.joinTime)) : null,
        region: data.region,
        affiliate_code: data.affiliateCode,
        okx_data: data, // Store complete raw data
        last_synced_at: new Date(),
    }
}

/**
 * Batch sync multiple users (for cron job)
 * Respects rate limit: 20 requests / 2 seconds
 */
export async function batchSyncInvitees(
    uids: string[],
    onProgress?: (completed: number, total: number) => void
): Promise<Map<string, OkxInviteeData | null>> {
    const results = new Map<string, OkxInviteeData | null>()
    const BATCH_SIZE = 20
    const BATCH_DELAY_MS = 2100 // Slightly over 2s for safety

    for (let i = 0; i < uids.length; i += BATCH_SIZE) {
        const batch = uids.slice(i, i + BATCH_SIZE)

        // Process batch in parallel
        const batchPromises = batch.map(async (uid) => {
            const data = await getInviteeDetail(uid)
            results.set(uid, data)
        })

        await Promise.all(batchPromises)

        if (onProgress) {
            onProgress(Math.min(i + BATCH_SIZE, uids.length), uids.length)
        }

        // Wait before next batch (if not last)
        if (i + BATCH_SIZE < uids.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
        }
    }

    return results
}
