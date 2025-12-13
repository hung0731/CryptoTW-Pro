import { createAdminClient } from '@/lib/supabase'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { detectAlerts, MarketStateRecord } from '@/lib/alert-engine'
// LINE Notification temporarily disabled
// import { sendAlertNotifications } from '@/lib/notification-service'

export async function runAlertCheck() {
    const supabase = createAdminClient()

    // 1. Get Real-time Data
    const snapshot = await getMarketSnapshot()
    const { signals, btc, capital_flow, long_short } = snapshot

    if (!btc.price) {
        console.warn('Skipping alert check: No BTC Price')
        return
    }

    // 2. Get Previous State from DB
    const { data: prevStateData, error: fetchError } = await supabase
        .from('market_states')
        .select('*')
        .eq('market', 'BTC')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    // Map DB response to strict Type (handle potential nulls or type mismatch)
    const prevState: MarketStateRecord | null = prevStateData ? {
        price: Number(prevStateData.price),
        open_interest: Number(prevStateData.open_interest),
        funding_rate: Number(prevStateData.funding_rate),
        long_short_ratio: Number(prevStateData.long_short_ratio),
        leverage_status: prevStateData.leverage_state, // DB: leverage_state -> Interface: leverage_status
        whale_status: prevStateData.whale_state,       // DB: whale_state -> Interface: whale_status
        liquidation_pressure: prevStateData.liquidation_pressure,
        updated_at: prevStateData.updated_at
    } : null

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching market state:', fetchError)
    }

    // 3. Detect Alerts
    const currentPrice = btc.price
    const currentOI = capital_flow.open_interest_total || 0
    const currentFunding = capital_flow.funding_rate || 0
    const currentLSR = long_short.global_ratio || 1
    const currentWhaleLSR = long_short.whale_ratio // Added for whale divergence

    const alerts = detectAlerts(
        {
            price: currentPrice,
            oi: currentOI,
            funding: currentFunding,
            lsr: currentLSR,
            whale_lsr: currentWhaleLSR,
            price_high_24h: btc.high_24h, // market-aggregator returns high_24h
            price_low_24h: btc.low_24h,   // market-aggregator returns low_24h
            liquidations: {
                total: snapshot.liquidations?.total_liquidated || 0,
                long: snapshot.liquidations?.long_liquidated || 0,
                short: snapshot.liquidations?.short_liquidated || 0
            }
        },
        signals,
        prevState
    )

    // 4. Save New State
    // Always insert new state for history tracking (Analytics/AI Interpretation needs history)
    const { error: insertError } = await supabase.from('market_states').insert({
        market: 'BTC',
        leverage_state: signals.leverage_status, // Map signal engine Enum to DB Enum string (ensure they match)
        whale_state: signals.whale_status,
        liquidation_pressure: signals.liquidation_pressure,
        price: currentPrice,
        funding_rate: currentFunding,
        open_interest: currentOI,
        long_short_ratio: currentLSR
    })

    if (insertError) {
        console.error('Error saving market state:', insertError)
    }

    // 5. Processing Alerts
    if (alerts.length > 0) {
        console.log(`[Alert] Detected ${alerts.length} alerts for BTC`)

        // Save to DB
        const eventsToInsert = alerts.map(alert => ({
            market: alert.market,
            alert_type: alert.type,
            summary: alert.summary,
            severity: alert.severity,
            metrics_snapshot: alert.metrics
        }))

        const { error: alertError } = await supabase.from('alert_events').insert(eventsToInsert)

        if (alertError) {
            console.error('Error saving alerts:', alertError)
        }
        // LINE Notification temporarily disabled
        // else {
        //     await sendAlertNotifications(alerts)
        // }
    }

    return {
        checked: true,
        alerts: alerts.length,
        state: {
            price: currentPrice,
            leverage: signals.leverage_status
        }
    }
}
