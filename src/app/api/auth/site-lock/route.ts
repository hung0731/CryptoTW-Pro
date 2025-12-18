import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 簡單的密碼保護，實際專案建議使用環境變數
const SITE_PASSWORD = process.env.SITE_PASSWORD || '888888'
const COOKIE_NAME = 'site_access_token'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { password } = body

        if (password === SITE_PASSWORD) {
            // Set cookie valid for 30 days
            (await cookies()).set(COOKIE_NAME, 'granted', {
                httpOnly: true,
                secure: false, // Changed from process.env.NODE_ENV === 'production' to fix URL change issues
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: false }, { status: 401 })
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
