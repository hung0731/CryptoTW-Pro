import { NextResponse } from 'next/server'

// Hyperliquid API Constants
const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info'

interface Position {
    coin: string
    szi: string // size
    entryPx: string // entry price
    positionValue: string
    returnOnEquity: string
    unrealizedPnl: string
    leverage: {
        type: string
        value: number
    }
}

interface WebData2 {
    clearinghouseState: {
        assetPositions: {
            position: Position
        }[]
        marginSummary: {
            accountValue: string
        }
    }
}

interface LeaderboardRow {
    window: string
    address: string
    pnl: string
    roi: string
    accountValue: string
}

export async function GET() {
    try {
        // 1. Fetch Leaderboard (Month)
        const leaderboardRes = await fetch(HYPERLIQUID_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'leaderboard',
                period: 'month'
            }),
            next: { revalidate: 60 } // Cache for 60 seconds
        })

        if (!leaderboardRes.ok) {
            throw new Error('Failed to fetch leaderboard')
        }

        const leaderboardData = await leaderboardRes.json()
        const topTraders = (leaderboardData.leaderboardRows as LeaderboardRow[] || [])
            .slice(0, 10) // Take top 10
            .map(row => ({
                address: row.address,
                pnl: parseFloat(row.pnl),
                roi: parseFloat(row.roi),
                displayAddress: `${row.address.slice(0, 6)}...${row.address.slice(-4)}`
            }))

        // 2. Fetch positions for each top trader (Parallel)
        const tradersWithPositions = await Promise.all(
            topTraders.map(async (trader) => {
                try {
                    const stateRes = await fetch(HYPERLIQUID_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'clearinghouseState',
                            user: trader.address
                        }),
                        next: { revalidate: 30 } // Cache shorter for positions
                    })

                    if (!stateRes.ok) return { ...trader, positions: [] }

                    const stateData: WebData2 = await stateRes.json()

                    // Filter meaningful positions (size != 0)
                    const positions = stateData.clearinghouseState.assetPositions
                        .filter(p => parseFloat(p.position.szi) !== 0)
                        .map(p => ({
                            coin: p.position.coin,
                            size: parseFloat(p.position.szi),
                            entryPrice: parseFloat(p.position.entryPx),
                            leverage: p.position.leverage.value,
                            type: parseFloat(p.position.szi) > 0 ? 'LONG' : 'SHORT',
                            roi: parseFloat(p.position.returnOnEquity) * 100,
                            pnl: parseFloat(p.position.unrealizedPnl)
                        }))
                        // Sort by size (absolute value * entry price approx)
                        .sort((a, b) => (Math.abs(b.size) * b.entryPrice) - (Math.abs(a.size) * a.entryPrice))
                        .slice(0, 3) // Only keep top 3 positions per whale to reduce noise

                    return { ...trader, positions }
                } catch (e) {
                    console.error(`Failed to fetch state for ${trader.address}`, e)
                    return { ...trader, positions: [] }
                }
            })
        )

        // Return all top traders (including ones without active positions)
        return NextResponse.json({ whales: tradersWithPositions })

    } catch (error) {
        console.error('Whale Watch API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
