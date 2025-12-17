import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ==========================================
    // Site Lock Protection
    // ==========================================
    const isLockPage = request.nextUrl.pathname === '/lock'
    const isApiAuth_SiteLock = request.nextUrl.pathname === '/api/auth/site-lock'
    const isLineWebhook = request.nextUrl.pathname.startsWith('/api/webhook/line') // Allow LINE bot
    // const isOtherPublicApi = ... (Add if needed)

    // Check access cookie
    const hasAccess = request.cookies.get('site_access_token')?.value === 'granted'

    // If not locked and no access -> Redirect to /lock
    // Exclude: API routes (except site-lock itself is an API but handled above), static files are already excluded by matcher
    if (!hasAccess && !isLockPage && !isApiAuth_SiteLock && !isLineWebhook && !request.nextUrl.pathname.startsWith('/api')) {
        const lockUrl = new URL('/lock', request.url)
        lockUrl.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(lockUrl)
    }

    // If has access but trying to go to lock page -> Redirect home
    if (hasAccess && isLockPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Refresh Session
    const { data: { user } } = await supabase.auth.getUser()


    // Handle "path" query param redirect (Fix for LIFF Concatenate issue)
    const { searchParams } = request.nextUrl
    const path = searchParams.get('path')
    if (path && path.startsWith('/')) {
        return NextResponse.redirect(new URL(path, request.url))
    }

    // Fix 404: Redirect legacy routes (/pro, /feed) to /
    if (request.nextUrl.pathname === '/pro' || request.nextUrl.pathname === '/feed') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Security: Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(loginUrl)
        }

        // RBAC: Check for admin role
        // Prioritize app_metadata (secure) over user_metadata
        const role = user.app_metadata?.role || user.user_metadata?.role || 'user'
        if (role !== 'admin' && role !== 'super_admin') {
            // Log unauthorized access attempt if needed
            // console.warn(`Unauthorized admin access attempt by ${user.id} (${user.email})`) // optional
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)', // Removed 'api' exclusion to protect API routes if needed, but logic above handles it. 
        // Actually, let's keep the user's original matcher or modify it slightly?
        // Original: '/((?!api|_next/static|_next/image|favicon.ico).*)'
        // If we want to protect the "site" (pages), usually we exclude API from middleware for perf, unless we want to protect API too.
        // The user said "pro website ... mask", implying UI.
        // Let's stick to protecting pages. APIs are usually protected by Auth headers anyway.
        // If I use the original matcher, API requests won't reach middleware, so they won't be blocked by this lock. That's probably fine for "visual mask".
        // However, if I want to "cut" the site, maybe blocking API is good too?
        // Let's keep API excluded for now to avoid breaking the LINE bot or other integrations that might fetch data.
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
