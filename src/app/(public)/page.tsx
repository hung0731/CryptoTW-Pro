import fs from 'fs'
import path from 'path'
import { HomePageClient } from './HomePageClient'
import { MacroReaction } from '@/lib/macro-events'

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
        console.error('Failed to load reactions:', error)
    }

    // Prefetch Market Status & Context
    let marketStatus = null
    let marketConclusion = null
    let marketContext = null

    try {
        const [statusRes, contextRes] = await Promise.all([
            fetch(`${process.env.INTERNAL_API_URL || 'http://localhost:3000'}/api/market/status`, { next: { revalidate: 60 } }),
            fetch(`${process.env.INTERNAL_API_URL || 'http://localhost:3000'}/api/market-context`, { next: { revalidate: 300 } })
        ])

        if (statusRes.ok) {
            const statusJson = await statusRes.json()
            marketStatus = statusJson.status
            marketConclusion = statusJson.conclusion
        }

        if (contextRes.ok) {
            const contextJson = await contextRes.json()
            marketContext = contextJson.context
        }
    } catch (error) {
        console.error('Failed to prefetch homepage data:', error)
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
