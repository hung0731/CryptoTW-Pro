import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // ==========================================
    // Request ID Injection & Logging Context
    // ==========================================
    const requestId = crypto.randomUUID()

    // Create new headers with requestId
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-request-id', requestId)

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    // Add requestId to response headers for client-side debugging
    response.headers.set('x-request-id', requestId)

    // ==========================================
    // Supabase Auth
    // ==========================================
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
                        request: {
                            headers: requestHeaders, // Keep requestId
                        },
                    })
                    // Restore response headers
                    response.headers.set('x-request-id', requestId)

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
    const isLineWebhook = request.nextUrl.pathname.startsWith('/api/webhook/line')

    // Check access cookie
    const hasAccess = request.cookies.get('site_access_token')?.value === 'granted'

    // If not locked and no access -> Redirect to /lock
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
    if (path && path.startsWith('/') && !path.startsWith('//')) {
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
        const role = user.app_metadata?.role || user.user_metadata?.role || 'user'
        if (role !== 'admin' && role !== 'super_admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
