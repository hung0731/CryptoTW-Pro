import fs from 'fs'
import path from 'path'
import { HomePageClient } from './HomePageClient'
import { MacroReaction } from '@/lib/macro-events'
import { logger } from '@/lib/logger'
import { getMarketStatusAction } from '@/app/actions/market'
import { getMarketContextAction } from '@/app/actions/news'

// Server Component
export default async function HomePage() {
    // Read JSON file on server
    const filePath = path.join(process.cwd(), 'src/data/macro-reactions.json')
    let reactions: Record<string, MacroReaction> = {}

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8')
            const data = JSON.parse(fileContent)
            reactions = data.data || {}
        }
    } catch (error) {
        logger.error('Failed to load reactions:', error, { feature: 'home-page' })
    }

    // Prefetch Market Status & Context
    let marketStatus = null
    let marketConclusion = null
    let marketContext = null

    try {
        const [statusRes, contextRes] = await Promise.all([
            getMarketStatusAction(),
            getMarketContextAction()
        ])

        if (statusRes && 'status' in statusRes) {
            // Check type safety - if it's the direct return object or {success, data} wrapper?
            // Market Action returns direct object (cached)
            // Let's verify usage in MarketStatusGrid
            // Actually getMarketStatusAction returns `MarketStatusResponse | null` directly based on previous file view
            marketStatus = (statusRes as any)?.status
            marketConclusion = (statusRes as any)?.conclusion
        }

        if (contextRes.success && contextRes.data) {
            marketContext = contextRes.data
        }
    } catch (error) {
        logger.error('Failed to prefetch homepage data:', error, { feature: 'home-page' })
    }

    return (
        <HomePageClient
            reactions={reactions}
            initialStatus={marketStatus}
            initialConclusion={marketConclusion}
            initialContext={marketContext}
        />
    )
}
