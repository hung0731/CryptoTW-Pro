import { createAdminClient } from '@/lib/supabase'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { detectAlerts } from '@/lib/alert-engine'

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
    // We assume 'BTC' for now
    const { data: prevState, error: fetchError } = await supabase
        .from('market_states')
        .select('*')
        .eq('market', 'BTC')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Relation not found" or "No rows"
        console.error('Error fetching market state:', fetchError)
        // Assuming table exists, if row not found (PGRST116), we treat as first run
    }

    // 3. Detect Alerts
    // If no prevState, we can't compare, just save current state
    const currentPrice = btc.price
    const currentOI = capital_flow.open_interest_total || 0
    const currentFunding = capital_flow.funding_rate || 0
    const currentLSR = long_short.global_ratio || 1

    const alerts = prevState ? detectAlerts(
        {
            price: currentPrice,
            oi: currentOI,
            funding: currentFunding,
            lsr: currentLSR,
            liquidations: {
                total: snapshot.liquidations?.total_liquidated || 0,
                long: snapshot.liquidations?.long_liquidated || 0,
                short: snapshot.liquidations?.short_liquidated || 0
            }
        },
        signals,
        prevState
    ) : []

    // 4. Save New State
    // Insert new row to keep history, or update single row? 
    // User said "Update market_state". Usually keeping history is better for charts, but we only need latest for alerts.
    // Migration said we keep history (IDs are unique). 
    // But we might want to clean up old states periodically.
    const { error: insertError } = await supabase.from('market_states').insert({
        market: 'BTC',
        leverage_state: signals.leverage_status,
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

    // 5. Save Events if any
    if (alerts.length > 0) {
        console.log(`[Alert] Detected ${alerts.length} alerts for BTC`)

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
        } else {
            // TODO: Trigger Notification Service (LINE Push)
            // await sendAlertNotifications(eventsToInsert)
        }
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
