import { NextResponse } from 'next/server'

// Hyperliquid API Constants
const HYPERLIQUID_LEADERBOARD_URL = 'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard'
const HYPERLIQUID_INFO_URL = 'https://api.hyperliquid.xyz/info'

interface LeaderboardEntry {
    ethAddress: string
    accountValue: string
    windowPerformances: [string, { pnl: string; roi: string; vlm: string }][]
    displayName: string | null
}

export async function GET() {
    try {
        // 1. Fetch Leaderboard
        const leaderboardRes = await fetch(HYPERLIQUID_LEADERBOARD_URL, {
            next: { revalidate: 60 }
        })

        if (!leaderboardRes.ok) {
            throw new Error('Failed to fetch leaderboard')
        }

        const leaderboardData = await leaderboardRes.json()
        const topTraders = (leaderboardData.leaderboardRows as LeaderboardEntry[] || [])
            .slice(0, 10) // Take top 10
            .map(row => {
                // Find month performance
                const monthPerf = row.windowPerformances.find(([window]) => window === 'month')
                const pnl = monthPerf ? parseFloat(monthPerf[1].pnl) : 0
                const roi = monthPerf ? parseFloat(monthPerf[1].roi) * 100 : 0

                return {
                    address: row.ethAddress,
                    displayAddress: row.displayName || `${row.ethAddress.slice(0, 6)}...${row.ethAddress.slice(-4)}`,
                    pnl,
                    roi: roi.toFixed(1),
                    accountValue: parseFloat(row.accountValue)
                }
            })

        // 2. Fetch positions for each top trader (Parallel)
        const tradersWithPositions = await Promise.all(
            topTraders.map(async (trader) => {
                try {
                    const stateRes = await fetch(HYPERLIQUID_INFO_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'clearinghouseState',
                            user: trader.address
                        }),
                        next: { revalidate: 30 }
                    })

                    if (!stateRes.ok) return { ...trader, positions: [] }

                    const stateData = await stateRes.json()

                    // Filter meaningful positions (size != 0)
                    const positions = (stateData.assetPositions || [])
                        .filter((p: any) => parseFloat(p.position.szi) !== 0)
                        .map((p: any) => ({
                            coin: p.position.coin,
                            size: parseFloat(p.position.szi),
                            entryPrice: parseFloat(p.position.entryPx),
                            leverage: p.position.leverage?.value || 1,
                            type: parseFloat(p.position.szi) > 0 ? 'LONG' : 'SHORT',
                            roi: (parseFloat(p.position.returnOnEquity) || 0) * 100,
                            pnl: parseFloat(p.position.unrealizedPnl) || 0
                        }))
                        .sort((a: any, b: any) => (Math.abs(b.size) * b.entryPrice) - (Math.abs(a.size) * a.entryPrice))
                        .slice(0, 3) // Only keep top 3 positions

                    return { ...trader, positions }
                } catch (e) {
                    console.error(`Failed to fetch state for ${trader.address}`, e)
                    return { ...trader, positions: [] }
                }
            })
        )

        return NextResponse.json({ whales: tradersWithPositions })

    } catch (error) {
        console.error('Whale Watch API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch whale data' }, { status: 500 })
    }
}
