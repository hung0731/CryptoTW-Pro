import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const path = searchParams.get('path')

    // Debug log (can be removed in prod)
    // console.log(`Middleware: ${request.nextUrl.pathname}, Query Path: ${path}`)

    // 1. Handle "path" query param redirect (Fix for LIFF Concatenate issue)
    // If ?path=/vip exists, redirect to /vip immediately
    if (path && path.startsWith('/')) {
        const targetUrl = new URL(path, request.url)

        // Preserve other params if needed (optional)
        // searchParams.forEach((value, key) => {
        //   if (key !== 'path') targetUrl.searchParams.set(key, value)
        // })

        return NextResponse.redirect(targetUrl)
    }

    // 2. Security: Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Strict check: Must have Supabase Session Cookie
        // Note: The specific cookie name depends on Supabase config, usually `sb-<ref>-auth-token`
        // We will check for any cookie starting with `sb-` or containing `auth` as a heuristic if strict name unknown,
        // OR better: check for specific `sb-access-token` if generic, or try to use specific project ref if known.
        // Given we don't know the exact project ref here easily, we check for 'sb-' prefix primarily.

        const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

        // Also check for localhost development cookie if applicable, but strict mode prefers strict check.

        if (!hasAuthCookie) {
            console.warn(`Security: Unauthorized access attempt to ${request.nextUrl.pathname}`)
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
