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

// Demo wallet addresses for top traders (fallback data)
const TOP_TRADER_ADDRESSES = [
    '0x5078c0a9dF71dc0ADF64a8B97E9c2dF8eA29A9fE',
    '0x8b0f5c0D6c5f349C6A9d0F9e8c2E6e1c5b2a1E7D',
    '0x4a3B2d1e5c6F8a9b0C1d2e3F4a5b6c7D8e9F0a1B',
    '0x7e6D5c4B3a2f1E0d9C8b7A6f5E4d3C2b1A0f9E8D',
    '0x2c4E6a8B0d2F4a6C8e0A2c4E6a8B0d2F4a6C8e0A'
]

// Demo data for when API fails
function getDemoData() {
    return {
        whales: [
            {
                address: TOP_TRADER_ADDRESSES[0],
                displayAddress: '0x5078...9fE',
                pnl: 285432,
                roi: 42.5,
                positions: [
                    { coin: 'BTC', size: 2.5, entryPrice: 97500, leverage: 10, type: 'LONG', roi: 8.2, pnl: 4250 },
                    { coin: 'ETH', size: 45, entryPrice: 3620, leverage: 5, type: 'LONG', roi: 5.1, pnl: 1820 }
                ]
            },
            {
                address: TOP_TRADER_ADDRESSES[1],
                displayAddress: '0x8b0f...7D',
                pnl: 198765,
                roi: 38.2,
                positions: [
                    { coin: 'SOL', size: -320, entryPrice: 220, leverage: 15, type: 'SHORT', roi: 12.5, pnl: 6800 },
                    { coin: 'ARB', size: 12500, entryPrice: 0.85, leverage: 8, type: 'LONG', roi: 4.2, pnl: 890 }
                ]
            },
            {
                address: TOP_TRADER_ADDRESSES[2],
                displayAddress: '0x4a3B...1B',
                pnl: 156890,
                roi: 34.8,
                positions: [
                    { coin: 'DOGE', size: 850000, entryPrice: 0.41, leverage: 12, type: 'LONG', roi: 7.8, pnl: 3200 }
                ]
            },
            {
                address: TOP_TRADER_ADDRESSES[3],
                displayAddress: '0x7e6D...8D',
                pnl: 124567,
                roi: 28.5,
                positions: [
                    { coin: 'AVAX', size: -1200, entryPrice: 52.5, leverage: 10, type: 'SHORT', roi: 9.4, pnl: 4100 },
                    { coin: 'LINK', size: 4500, entryPrice: 24.8, leverage: 7, type: 'LONG', roi: 3.8, pnl: 1560 }
                ]
            },
            {
                address: TOP_TRADER_ADDRESSES[4],
                displayAddress: '0x2c4E...0A',
                pnl: 98234,
                roi: 22.1,
                positions: [
                    { coin: 'BTC', size: -0.8, entryPrice: 101200, leverage: 20, type: 'SHORT', roi: 6.2, pnl: 2890 }
                ]
            }
        ]
    }
}

export async function GET() {
    try {
        // Try to fetch real positions for demo addresses
        const tradersWithPositions = await Promise.all(
            TOP_TRADER_ADDRESSES.slice(0, 5).map(async (address, idx) => {
                try {
                    const stateRes = await fetch(HYPERLIQUID_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'clearinghouseState',
                            user: address
                        }),
                        next: { revalidate: 60 }
                    })

                    if (!stateRes.ok) throw new Error('Failed to fetch')

                    const stateData = await stateRes.json()

                    // Check if we have valid data
                    if (!stateData?.assetPositions) {
                        throw new Error('No position data')
                    }

                    // Filter meaningful positions (size != 0)
                    const positions = stateData.assetPositions
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
                        .slice(0, 3)

                    const marginSummary = stateData.marginSummary || {}

                    return {
                        address,
                        displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
                        pnl: parseFloat(marginSummary.accountValue || '0'),
                        roi: (Math.random() * 40 + 10).toFixed(1), // Placeholder
                        positions
                    }
                } catch (e) {
                    // Return demo data for this trader
                    const demoWhales = getDemoData().whales
                    return demoWhales[idx] || demoWhales[0]
                }
            })
        )

        return NextResponse.json({ whales: tradersWithPositions })

    } catch (error) {
        console.error('Whale Watch API Error:', error)
        // Return demo data on error
        return NextResponse.json(getDemoData())
    }
}
