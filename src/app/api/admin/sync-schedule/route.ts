/**
 * Admin API: Sync Event Schedule
 * 
 * POST /api/admin/sync-schedule
 * 
 * Regenerates future event dates for CPI, NFP, and FOMC
 * and writes to a schedule file that can be used alongside MACRO_OCCURRENCES
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { generateFullSchedule } from '@/lib/schedule-generator'
import { MACRO_OCCURRENCES } from '@/lib/macro-events'
import { logger } from '@/lib/logger'

const SCHEDULE_FILE_PATH = join(process.cwd(), 'src/data/generated-schedule.json')

export async function POST(request: NextRequest) {
    try {
        logger.info('Starting schedule generation', { feature: 'admin', endpoint: 'sync-schedule' })

        const currentYear = new Date().getFullYear()

        // Generate schedule for current year + next 2 years
        const generatedSchedule = generateFullSchedule(currentYear - 2, currentYear + 2)

        // Merge with existing MACRO_OCCURRENCES data (preserve actual/forecast values)
        const existingDataMap = new Map(
            MACRO_OCCURRENCES.map(occ => {
                const key = `${occ.eventKey}-${new Date(occ.occursAt).toISOString().split('T')[0]}`
                return [key, occ]
            })
        )

        const mergedSchedule = generatedSchedule.map(generated => {
            const key = `${generated.eventKey}-${new Date(generated.occursAt).toISOString().split('T')[0]}`
            const existing = existingDataMap.get(key)

            if (existing) {
                // Preserve existing actual/forecast values
                return {
                    ...generated,
                    forecast: existing.forecast,
                    actual: existing.actual,
                    notes: existing.notes || generated.notes
                }
            }

            return generated
        })

        // Sort by date
        mergedSchedule.sort((a, b) =>
            new Date(a.occursAt).getTime() - new Date(b.occursAt).getTime()
        )

        // Count by type
        const counts = {
            cpi: mergedSchedule.filter(e => e.eventKey === 'cpi').length,
            nfp: mergedSchedule.filter(e => e.eventKey === 'nfp').length,
            fomc: mergedSchedule.filter(e => e.eventKey === 'fomc').length,
            total: mergedSchedule.length
        }

        // Save to file
        const outputData = {
            generatedAt: new Date().toISOString(),
            yearRange: {
                start: currentYear - 2,
                end: currentYear + 2
            },
            counts,
            schedule: mergedSchedule
        }

        writeFileSync(SCHEDULE_FILE_PATH, JSON.stringify(outputData, null, 2), 'utf-8')

        logger.info('Schedule generation completed', {
            feature: 'admin',
            endpoint: 'sync-schedule',
            counts
        })

        return NextResponse.json({
            success: true,
            message: 'Event schedule generated successfully',
            results: {
                ...counts,
                yearRange: `${currentYear - 2} - ${currentYear + 2}`,
                generatedAt: outputData.generatedAt
            }
        })

    } catch (error) {
        logger.error('Schedule generation failed', {
            feature: 'admin',
            endpoint: 'sync-schedule',
            error: String(error)
        })

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// GET endpoint to check schedule status
export async function GET() {
    try {
        if (!existsSync(SCHEDULE_FILE_PATH)) {
            return NextResponse.json({
                exists: false,
                message: 'Schedule not generated yet'
            })
        }

        const data = JSON.parse(readFileSync(SCHEDULE_FILE_PATH, 'utf-8'))

        return NextResponse.json({
            exists: true,
            generatedAt: data.generatedAt,
            counts: data.counts,
            yearRange: data.yearRange
        })
    } catch {
        return NextResponse.json({
            exists: false,
            message: 'Error reading schedule'
        })
    }
}
