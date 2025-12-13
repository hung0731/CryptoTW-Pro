import { NextRequest, NextResponse } from 'next/server'
import { runAlertCheck } from '@/lib/alert-service'

export async function GET(req: NextRequest) {
    // 1. Verify Cron Secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const result = await runAlertCheck()
        return NextResponse.json({ success: true, result })
    } catch (error: any) {
        console.error('Alert Check Failed:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
