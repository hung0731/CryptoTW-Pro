import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return unauthorizedResponse()

    try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        return NextResponse.json({ ip: data.ip })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
