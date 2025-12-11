import { NextResponse } from 'next/server'
import { createSafeServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/admin'

    if (code) {
        // await cookies() is required in Next.js 15+, or use direct access if 14
        // assuming Next.js 16 based on report (v16.0.8)
        const cookieStore = await cookies()
        const supabase = createSafeServerClient(cookieStore)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
