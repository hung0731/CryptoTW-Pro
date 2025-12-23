import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export const createAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error('Server Security Violation: SUPABASE_SERVICE_ROLE_KEY is required for AdminClient.')
    }
    // Strict Input Validation: Ensure we are not in browser
    if (typeof window !== 'undefined') {
        throw new Error('Security Violation: AdminClient cannot be initialized in browser.')
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
