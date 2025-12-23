import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'src/data/macro-reactions.json')
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(fileContent)

        return NextResponse.json(data)
    } catch (error) {
        logger.error('Failed to load macro reactions', error, { feature: 'macro-api', endpoint: 'reactions' })
        return NextResponse.json({ data: {} }, { status: 500 })
    }
}
