import crypto from 'crypto'
import { logger } from '@/lib/logger'

const LBANK_API_BASE = 'https://affiliate.lbankverify.com'

export interface LBankInviteeData {
    openId: string
    code: string
    createTime: number
    directInvitation: boolean
    deposit: boolean
    transaction: boolean
    kycStatus: number // 0, 1
    userLevel: number
    currencyFeeAmt: string // Spot rate
    contractFeeAmt: string // Futures rate
    currencyTotalFeeAmt: string // Total Spot Assets
    currencyTotalFeeAmtUsdt: string // Total Spot Assets (USDT)
    contractTotalFeeAmt: string // Total Futures Assets
    reserveAmt: string // Futures Bonus
}

interface LBankApiResponse<T> {
    result: string // "true"
    error_code: number
    msg?: string
    data: T
    ts: number
}

/**
 * Generate LBank V2 Affiliate API Signature
 * Method: HmacSHA256
 * 1. Sort params (excluding sign)
 * 2. Add signature_method, timestamp, echostr
 * 3. MD5(sorted_query_string) -> Uppercase
 * 4. HmacSHA256(MD5_Digest, SecretKey) -> Base64
 */
function generateSignature(
    params: Record<string, any>,
    secretKey: string,
    timestamp: string,
    echostr: string
): string {
    // 1. Prepare params
    const allParams = {
        ...params,
        signature_method: 'HmacSHA256',
        timestamp: timestamp,
        echostr: echostr
    }

    // 2. Sort args
    const sortedKeys = Object.keys(allParams).sort()
    const sortedParams: Record<string, any> = {}
    sortedKeys.forEach(key => {
        sortedParams[key] = (allParams as any)[key]
    })

    // 3. Build query string
    // Note: LBank typically uses key=value&key2=value2 format for signing
    const queryString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')

    // 4. MD5 Digest
    const md5Digest = crypto.createHash('md5').update(queryString).digest('hex').toUpperCase()

    // 5. HmacSHA256
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(md5Digest)
    return hmac.digest('base64')
}

/**
 * Make authenticated request to LBank Affiliate API
 */
async function lbankRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
): Promise<T | null> {
    const apiKey = process.env.LBANK_API_KEY
    const secretKey = process.env.LBANK_SECRET_KEY

    if (!apiKey || !secretKey) {
        logger.error('[LBank API] Missing credentials', new Error('Missing LBANK_API_KEY or LBANK_SECRET_KEY'), { feature: 'lbank-affiliate' })
        return null
    }

    const timestamp = Date.now().toString()
    const echostr = crypto.randomBytes(16).toString('hex') // Random string

    const signature = generateSignature(params, secretKey, timestamp, echostr)

    const finalParams = new URLSearchParams()
    // Add all params used in signature
    Object.entries(params).forEach(([k, v]) => finalParams.append(k, String(v)))
    // Add api_key to query parameters (standard for LBank)
    finalParams.append('api_key', apiKey)
    finalParams.append('signature_method', 'HmacSHA256')
    finalParams.append('timestamp', timestamp)
    finalParams.append('echostr', echostr)
    finalParams.append('sign', signature)

    const url = `${LBANK_API_BASE}${endpoint}?${finalParams.toString()}`

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Add browser-like User-Agent to avoid Cloudflare 403
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        if (!res.ok) {
            const txt = await res.text()
            logger.error(`[LBank API] HTTP ${res.status}`, new Error(txt), { feature: 'lbank-affiliate', url })
            throw new Error(`LBank API error: ${res.status}`)
        }

        const json = await res.json() as LBankApiResponse<T>

        if (json.result !== 'true' || json.error_code !== 0) {
            logger.error('[LBank API] Business Error', new Error(json.msg || 'Unknown error'), { feature: 'lbank-affiliate', json })
            return null
        }

        return json.data

    } catch (e) {
        logger.error('[LBank API] Request failed', e as Error, { feature: 'lbank-affiliate' })
        return null
    }
}

/**
 * Sync ALL LBank invitees and return a map of OpenID -> Data
 * Iterates through all pages of /affiliate-api/v2/invite/user/team/list
 */
export async function syncAllLBankInvitees(): Promise<Map<string, LBankInviteeData>> {
    const results = new Map<string, LBankInviteeData>()
    const pageSize = 100 // Max 100
    let start = 0
    let hasMore = true
    const startTime = 0 // From beginning
    const endTime = Date.now()

    while (hasMore) {
        logger.info(`[LBank Sync] Fetching page start=${start}`, { feature: 'lbank-affiliate', start })

        const data = await lbankRequest<LBankInviteeData[]>('/affiliate-api/v2/invite/user/team/list', {
            startTime,
            endTime,
            start,
            pageSize
        })

        if (!data || data.length === 0) {
            hasMore = false
            break
        }

        data.forEach(user => {
            if (user.openId) {
                results.set(user.openId, user)
            }
        })

        if (data.length < pageSize) {
            hasMore = false
        } else {
            start += pageSize
        }

        // Rate limit: 5 req/10s. Sleep 2.1s to be safe
        await new Promise(r => setTimeout(r, 2100))
    }

    return results
}

/**
 * Parse LBank data for DB
 */
export function parseLBankData(data: LBankInviteeData) {
    return {
        monthly_volume: 0, // LBank team list doesn't return volume directly, requires separate call /trade/user
        // Currently we only update basic stats.
        // For volume, we might need batchSyncVolume later.

        deposit_amount: parseFloat(data.currencyTotalFeeAmtUsdt) || 0, // Using total assets as proxy for deposit/value?
        // Or "deposit" bool field.
        // LBank doesn't return "accumulated deposit" in team list. 
        // It returns "currencyTotalFeeAmtUsdt" (Total Spot Assets).

        okx_level: data.userLevel.toString(), // Reuse column
        region: '',
        affiliate_code: data.code,
        okx_data: data, // Store raw data in JSON column
        last_synced_at: new Date(),

        // Custom fields mapping
        is_kyc: data.kycStatus === 1,
        has_deposit: data.deposit,
        has_trade: data.transaction
    }
}
