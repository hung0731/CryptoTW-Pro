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

// createAdminClient has been moved to @/lib/supabase-admin.ts to enforce server-only usage

export const supabase = createClient()

