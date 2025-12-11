import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as _createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase Client (Singleton-ish for Browser)
export const createClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase Client (For API Routes & Server Actions)
// Note: Requires cookie store to be passed in, or use inside specific context
export const createSafeServerClient = (cookieStore: any) => {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet: any[]) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            }
        }
    })
}

export const createAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error('Server Security Violation: SUPABASE_SERVICE_ROLE_KEY is required for AdminClient.')
    }
    // Strict Input Validation: Ensure we are not in browser
    if (typeof window !== 'undefined') {
        throw new Error('Security Violation: AdminClient cannot be initialized in browser.')
    }
    return _createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

export const supabase = createClient()

