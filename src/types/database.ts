export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type MembershipStatus = 'free' | 'pending' | 'pro' | 'lifetime'
export type BindingStatus = 'pending' | 'verified' | 'rejected'
export type AccessLevel = 'free' | 'pro'
export type ContentType = 'news' | 'alpha' | 'weekly'
export type ExchangeName = 'binance' | 'okx' | 'bybit' | 'bingx' | 'pionex' | 'all' | 'vip' | 'pro' | 'prime'

export interface Database {
    public: {
        Tables: {
            // ... users ...
            // ... exchange_bindings ...
            // ... content ...
            activities: {
                Row: {
                    id: string
                    exchange_name: ExchangeName
                    title: string
                    description: string | null
                    content: string | null // Added
                    url: string | null
                    start_date: string | null
                    end_date: string | null // Added/Ensured
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    exchange_name: ExchangeName
                    title: string
                    description?: string | null
                    content?: string | null // Added
                    url?: string | null
                    start_date?: string | null
                    end_date?: string | null // Added
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    exchange_name?: ExchangeName
                    title?: string
                    description?: string | null
                    url?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            vip_applications: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    contact_method: string
                    contact_handle: string
                    asset_tier: string
                    trading_volume_monthly: string | null
                    preferred_exchange: string | null
                    notes: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    contact_method: string
                    contact_handle: string
                    asset_tier: string
                    trading_volume_monthly?: string | null
                    preferred_exchange?: string | null
                    notes?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    contact_method?: string
                    contact_handle?: string
                    asset_tier?: string
                    trading_volume_monthly?: string | null
                    preferred_exchange?: string | null
                    notes?: string | null
                    status?: string
                    created_at?: string
                }
            }
        }
    }
}
