import { PageHeader } from '@/components/PageHeader'
import { logger } from '@/lib/logger'
import EventDetailClient from '@/components/EventDetailClient'
import fs from 'fs'
import path from 'path'
import { getMacroEventDef } from '@/lib/macro-events'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Server Component
export default async function MacroEventDetailPage({ params }: { params: Promise<{ key: string }> }) {
    const { key } = await params
    const eventDef = getMacroEventDef(key)

    // Read JSON file on server
    const filePath = path.join(process.cwd(), 'src/data/macro-reactions.json')
    let reactions = {}

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(fileContent)
        // Handle both wrapped {data: ...} and flat structure
        // Exclude metadata keys like 'count', 'generatedAt', 'data'
        const allReactions = data.data || Object.fromEntries(
            Object.entries(data).filter(([k]) =>
                !['count', 'generatedAt', 'data', 'lastSync'].includes(k)
            )
        )

        // Debug: Log total entries and filter results
        const allKeys = Object.keys(allReactions)
        const eventKeys = [...new Set(Object.values(allReactions).map((v: any) => v.eventKey))]
        console.log(`[Calendar Debug] Key: ${key}, Total entries: ${allKeys.length}, Event types: ${eventKeys.join(', ')}`)

        const filtered = Object.entries(allReactions)
            .filter(([k, v]: [string, any]) => v.eventKey === key)
        console.log(`[Calendar Debug] Filtered for "${key}": ${filtered.length} entries`)

        reactions = filtered.reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})

        // loaded data
    } catch (error) {
        logger.error('Failed to load reactions:', error, { feature: 'calendar', page: 'detail', key })
    }

    if (!eventDef) {
        return (
            <main className="min-h-screen bg-black text-white pb-20">
                <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 py-3 px-4">
                    <Link href="/calendar" className="flex items-center gap-2 text-neutral-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                        返回
                    </Link>
                </div>
                <div className="flex items-center justify-center py-20">
                    <p className="text-neutral-500">找不到此事件</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <EventDetailClient eventKey={key} reactions={reactions} />
        </main>
    )
}
