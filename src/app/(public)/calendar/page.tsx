import { PageHeader } from '@/components/PageHeader'
import CalendarClient from '@/components/CalendarClient'
import fs from 'fs'
import path from 'path'

// Server Component - reads JSON directly
export default async function CalendarPage() {
    // Read JSON file on server
    const filePath = path.join(process.cwd(), 'src/data/macro-reactions.json')
    let reactions = {}

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(fileContent)
        reactions = data.data || {}
        console.log('Server: Loaded', Object.keys(reactions).length, 'reactions')
    } catch (error) {
        console.error('Failed to load reactions:', error)
    }

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <PageHeader title="經濟日曆" />
            <CalendarClient reactions={reactions} />
        </main>
    )
}
