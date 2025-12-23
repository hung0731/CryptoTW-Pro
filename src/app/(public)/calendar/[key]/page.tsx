import { PageHeader } from '@/components/PageHeader'
import { logger } from '@/lib/logger'
import SingleEventClient from '@/components/SingleEventClient'
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
        // Filter reactions for this event key
        const allReactions = data.data || {}
        reactions = Object.entries(allReactions)
            .filter(([k, v]: [string, any]) => v.eventKey === key)
            .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})

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
            <SingleEventClient eventKey={key} reactions={reactions} />
        </main>
    )
}
