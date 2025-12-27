import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type DBUser = Database['public']['Tables']['users']['Row']

interface BackendAuthResponse {
    user: DBUser
    session: any
    isNewUser: boolean
}

export class AuthService {
    /**
     * Exchange LIFF access token for backend session and user data
     */
    static async syncWithBackend(accessToken: string): Promise<BackendAuthResponse> {
        try {
            const res = await fetch('/api/auth/line', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to sync with backend')
            }

            const data = await res.json()

            // Set Supabase session if returned
            if (data.session) {
                await supabase.auth.setSession(data.session)
            }

            return data
        } catch (error) {
            console.error('[AuthService] Sync Error:', error)
            throw error
        }
    }
}
