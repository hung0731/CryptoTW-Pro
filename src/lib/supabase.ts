import { createClient as _createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
    return _createClient(supabaseUrl, supabaseAnonKey)
}

export const createAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key. Admin operations may fail.')
        return createClient()
    }
    return _createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

export const supabase = createClient()

