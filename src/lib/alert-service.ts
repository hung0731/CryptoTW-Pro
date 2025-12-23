import { createAdminClient } from '@/lib/supabase-admin'
import { getMarketSnapshot } from '@/lib/market-aggregator'
import { detectAlerts, MarketStateRecord } from '@/lib/alert-engine'
import { generateMarketSignals, RawMarketData } from '@/lib/signal-engine'
// LINE Notification temporarily disabled
// import { sendAlertNotifications } from '@/lib/notification-service'
import { logger } from '@/lib/logger'

// ============================================
// Enum Mappers (Signal Engine uses Chinese, DB uses English)
// ============================================

function mapLeverageStatus(status: string): 'normal' | 'heated' | 'overheated' {
    switch (status) {
        case '過熱': return 'overheated'
        case '升溫': return 'heated'
        case '降溫': return 'normal'  // DB doesn't have 'cooling', use 'normal'
        case '正常':
        default: return 'normal'
    }
}

function mapWhaleStatus(status: string): 'long' | 'neutral' | 'hedge' | 'exit' {
    switch (status) {
        case '偏多': return 'long'
        case '偏空': return 'hedge'
        case '撤退':
        case '出場': return 'exit'
        case '中性':
        default: return 'neutral'
    }
}

function mapLiquidationPressure(pressure: string): 'upper' | 'lower' | 'balanced' {
    switch (pressure) {
        case '上方': return 'upper'
        case '下方': return 'lower'
        case '均衡':
        default: return 'balanced'
    }
}

export async function runAlertCheck() {
    const supabase = createAdminClient()

    // 1. Get Real-time Data
    const snapshot = await getMarketSnapshot()
    const { btc, capital_flow, long_short } = snapshot as any

    // Reconstruct signals using Signal Engine
    const rawData: RawMarketData = {
        price: btc.price,
        price_change_24h: btc.change_24h,
        funding_rate: capital_flow.funding_rate,
        oi_change_24h: capital_flow.oi_change_24h,
        long_short_ratio: long_short.global_ratio,
        top_trader_long_short_ratio: long_short.whale_ratio,
        whale_sentiment: (snapshot as any).whales?.summary?.whale_sentiment
    }
    const signals = generateMarketSignals(rawData)

    if (!btc.price) {
        logger.warn('Skipping alert check: No BTC Price', { feature: 'alert-service' })
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
        logger.error('Error fetching market state:', fetchError as Error, { feature: 'alert-service' })
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
        leverage_state: mapLeverageStatus(signals.leverage_status),
        whale_state: mapWhaleStatus(signals.whale_status),
        liquidation_pressure: mapLiquidationPressure(signals.liquidation_pressure),
        price: currentPrice,
        funding_rate: currentFunding,
        open_interest: currentOI,
        long_short_ratio: currentLSR
    })

    if (insertError) {
        logger.error('Error saving market state:', insertError as Error, { feature: 'alert-service' })
    }

    // 5. Processing Alerts
    if (alerts.length > 0) {
        logger.info(`[Alert] Detected ${alerts.length} alerts for BTC`, { feature: 'alert-service', count: alerts.length })

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
            logger.error('Error saving alerts:', alertError as Error, { feature: 'alert-service' })
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
