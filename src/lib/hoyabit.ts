
export interface HoyabitTicker {
    buy: number | null
    sell: number | null
    timestamp: number
}

// Internal API endpoints discovered via network inspection
// Buy USDT (Pay TWD): Base=1(TWD), Target=4(USDT), Type=1 -> We want target_price (TWD per USDT)
const HOYABIT_API_BUY = 'https://guest-apis.hoyabit.com/guest/apis/v2/trades/symbol/1/target/4/price?type=1'

// Sell USDT (Get TWD): Base=4(USDT), Target=1(TWD), Type=2 -> We want base_price (TWD per USDT)
const HOYABIT_API_SELL = 'https://guest-apis.hoyabit.com/guest/apis/v2/trades/symbol/4/target/1/price?type=2'

/**
 * Fetches current TWD/USDT prices from Hoyabit
 * Returns buy price (how many TWD to buy 1 USDT) and sell price (how many TWD you get for 1 USDT)
 */
export async function getHoyabitPrices(): Promise<HoyabitTicker> {
    try {
        const [buyRes, sellRes] = await Promise.all([
            fetch(HOYABIT_API_BUY),
            fetch(HOYABIT_API_SELL)
        ])

        if (!buyRes.ok || !sellRes.ok) {
            console.error('[Hoyabit] API error:', { buyStatus: buyRes.status, sellStatus: sellRes.status })
            return { buy: null, sell: null, timestamp: Date.now() }
        }

        const [buyData, sellData] = await Promise.all([
            buyRes.json(),
            sellRes.json()
        ])

        // Parse logic:
        // Buy: TWD -> USDT. target_price is the cost in TWD for 1 unit of Target (USDT).
        const buyPrice = parseFloat(buyData?.data?.target_price)

        // Sell: USDT -> TWD. base_price is the value in Target(TWD) for 1 unit of Base (USDT).
        // Wait, normally price is Quote/Base.
        // Let's trust the data observation: Sell result had base_price ~ 31.46 (Sell) and target_price ~ 0.03.
        // We want the ~31.46 number.
        // Actually, looking at the JSON output for Sell (Base=USDT, Target=TWD):
        // "price":"31.46126320", "base_price":"31.461", "target_price":"0.03178512"
        // price/base_price seem to be the rate we want.
        const sellPrice = parseFloat(sellData?.data?.base_price)

        return {
            buy: isNaN(buyPrice) ? null : buyPrice,
            sell: isNaN(sellPrice) ? null : sellPrice,
            timestamp: Date.now()
        }

    } catch (error) {
        console.error('[Hoyabit] Fetch error:', error)
        return { buy: null, sell: null, timestamp: Date.now() }
    }
}
