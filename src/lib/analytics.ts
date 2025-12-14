// Simple Analytics Tracking
// Events: join_view, join_click, pro_complete

type AnalyticsEvent = 'join_view' | 'join_click' | 'pro_complete'

export function trackEvent(event: AnalyticsEvent, data?: Record<string, any>) {
    // Console log for debugging
    console.log(`[Analytics] ${event}`, data || '')

    // If you have Google Analytics, Facebook Pixel, etc:
    // gtag('event', event, data)
    // fbq('track', event, data)

    // Future: send to your own API
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, data, timestamp: Date.now() }) })
}
