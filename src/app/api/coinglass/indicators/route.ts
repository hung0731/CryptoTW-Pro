import { NextRequest, NextResponse } from 'next/server'
import { coinglassV4Request } from '@/lib/coinglass'
import { simpleApiRateLimit } from '@/lib/api-rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min cache

interface IndicatorData {
    ahr999: {
        value: number
        signal: string
        color: string
        description: string
    }
    bubbleIndex: {
        value: number
        signal: string
        color: string
        description: string
    }
    puellMultiple: {
        value: number
        signal: string
        color: string
        description: string
    }
    bullMarketPeak: {
        hitCount: number
        totalCount: number
        signal: string
        color: string
        description: string
        indicators: Array<{
            name: string
            currentValue: string
            targetValue: string
            hit: boolean
        }>
    }
}

export async function GET(req: NextRequest) {
    // Rate limit: 30 requests per minute per IP
    const rateLimited = await simpleApiRateLimit(req, 'cg-indicators', 30, 60)
    if (rateLimited) return rateLimited

    try {
        const [ahr999Res, bubbleRes, puellRes, peakRes] = await Promise.all([
            coinglassV4Request<any[]>('/api/index/ahr999', {}),
            coinglassV4Request<any[]>('/api/index/bitcoin/bubble-index', {}),
            coinglassV4Request<any[]>('/api/index/puell-multiple', {}),
            coinglassV4Request<any[]>('/api/bull-market-peak-indicator', {}),
        ])

        // Process AHR999
        const latestAhr999 = ahr999Res?.[ahr999Res.length - 1]
        const ahr999Value = latestAhr999?.ahr999_value || 0
        const ahr999 = {
            value: Number(ahr999Value.toFixed(2)),
            signal: getAhr999Signal(ahr999Value),
            color: getAhr999Color(ahr999Value),
            description: getAhr999Description(ahr999Value),
        }

        // Process Bubble Index
        const latestBubble = bubbleRes?.[bubbleRes.length - 1]
        const bubbleValue = latestBubble?.bubble_index || 0
        const bubbleIndex = {
            value: Number(bubbleValue.toFixed(2)),
            signal: getBubbleSignal(bubbleValue),
            color: getBubbleColor(bubbleValue),
            description: getBubbleDescription(bubbleValue),
        }

        // Process Puell Multiple
        const latestPuell = puellRes?.[puellRes.length - 1]
        const puellValue = latestPuell?.puell_multiple || 0
        const puellMultiple = {
            value: Number(puellValue.toFixed(2)),
            signal: getPuellSignal(puellValue),
            color: getPuellColor(puellValue),
            description: getPuellDescription(puellValue),
        }

        // Process Bull Market Peak
        const hitIndicators = peakRes?.filter((i: any) => i.hit_status) || []
        const totalIndicators = peakRes?.length || 0
        const hitCount = hitIndicators.length
        const bullMarketPeak = {
            hitCount,
            totalCount: totalIndicators,
            signal: getPeakSignal(hitCount, totalIndicators),
            color: getPeakColor(hitCount, totalIndicators),
            description: getPeakDescription(hitCount, totalIndicators),
            indicators: (peakRes || []).slice(0, 10).map((i: any) => ({
                name: i.indicator_name,
                currentValue: i.current_value,
                targetValue: i.target_value,
                hit: i.hit_status,
            })),
        }

        const data: IndicatorData = {
            ahr999,
            bubbleIndex,
            puellMultiple,
            bullMarketPeak,
        }

        return NextResponse.json({
            indicators: data,
            lastUpdated: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Indicators API error:', error)
        return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 })
    }
}

// AHR999 helpers
function getAhr999Signal(value: number): string {
    if (value < 0.45) return '抄底區'
    if (value < 1.2) return '定投區'
    if (value < 4) return '觀望區'
    return '賣出區'
}

function getAhr999Color(value: number): string {
    if (value < 0.45) return 'green'
    if (value < 1.2) return 'blue'
    if (value < 4) return 'yellow'
    return 'red'
}

function getAhr999Description(value: number): string {
    if (value < 0.45) return '極度低估，歷史性買入機會'
    if (value < 1.2) return '低於成本線，適合定期定額'
    if (value < 4) return '接近均價，建議減少買入'
    return '超過成本線，考慮分批賣出'
}

// Bubble Index helpers
function getBubbleSignal(value: number): string {
    if (value < -2) return '嚴重低估'
    if (value < 0) return '低估'
    if (value < 5) return '合理'
    if (value < 20) return '偏高'
    return '泡沫'
}

function getBubbleColor(value: number): string {
    if (value < -2) return 'green'
    if (value < 0) return 'blue'
    if (value < 5) return 'yellow'
    if (value < 20) return 'orange'
    return 'red'
}

function getBubbleDescription(value: number): string {
    if (value < -2) return '市場恐慌拋售，價值被嚴重低估'
    if (value < 0) return '低於歷史均值，買入機會'
    if (value < 5) return '處於合理估值範圍'
    if (value < 20) return '估值偏高，謹慎追漲'
    return '嚴重泡沫，考慮減倉'
}

// Puell Multiple helpers
function getPuellSignal(value: number): string {
    if (value < 0.5) return '礦工投降'
    if (value < 1) return '礦工低迷'
    if (value < 2) return '復甦中'
    if (value < 4) return '榮景期'
    return '過熱'
}

function getPuellColor(value: number): string {
    if (value < 0.5) return 'green'
    if (value < 1) return 'blue'
    if (value < 2) return 'yellow'
    if (value < 4) return 'orange'
    return 'red'
}

function getPuellDescription(value: number): string {
    if (value < 0.5) return '礦工收益極低，通常是底部'
    if (value < 1) return '礦工獲利低迷，市場低估'
    if (value < 2) return '市場正在復甦'
    if (value < 4) return '牛市行情，獲利豐厚'
    return '礦工超額獲利，警惕頂部'
}

// Bull Market Peak helpers
function getPeakSignal(hit: number, total: number): string {
    const ratio = hit / total
    if (ratio === 0) return '安全'
    if (ratio < 0.2) return '早期'
    if (ratio < 0.5) return '警戒'
    if (ratio < 0.8) return '危險'
    return '見頂'
}

function getPeakColor(hit: number, total: number): string {
    const ratio = hit / total
    if (ratio === 0) return 'green'
    if (ratio < 0.2) return 'blue'
    if (ratio < 0.5) return 'yellow'
    if (ratio < 0.8) return 'orange'
    return 'red'
}

function getPeakDescription(hit: number, total: number): string {
    const ratio = hit / total
    if (ratio === 0) return '沒有逃頂指標觸發，市場安全'
    if (ratio < 0.2) return `${hit}/${total} 指標觸發，處於牛市早期`
    if (ratio < 0.5) return `${hit}/${total} 指標觸發，開始警戒`
    if (ratio < 0.8) return `${hit}/${total} 指標觸發，牛市後期`
    return `${hit}/${total} 指標觸發，極大機率見頂`
}
