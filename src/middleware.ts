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
