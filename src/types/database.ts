export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type MembershipStatus = 'free' | 'pending' | 'pro'
export type BindingStatus = 'pending' | 'verified' | 'rejected'
export type AccessLevel = 'free' | 'pro'
export type ContentType = 'news' | 'alpha' | 'weekly'
export type ExchangeName = 'binance' | 'okx' | 'bybit' | 'bingx' | 'pionex'

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    line_user_id: string
                    display_name: string | null
                    picture_url: string | null
                    membership_status: MembershipStatus
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    line_user_id: string
                    display_name?: string | null
                    picture_url?: string | null
                    membership_status?: MembershipStatus
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    line_user_id?: string
                    display_name?: string | null
                    picture_url?: string | null
                    membership_status?: MembershipStatus
                    created_at?: string
                    updated_at?: string
                }
            }
            exchange_bindings: {
                Row: {
                    id: string
                    user_id: string
                    exchange_name: ExchangeName
                    exchange_uid: string
                    status: BindingStatus
                    rejection_reason: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    exchange_name: ExchangeName
                    exchange_uid: string
                    status?: BindingStatus
                    rejection_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    exchange_name?: ExchangeName
                    exchange_uid?: string
                    status?: BindingStatus
                    rejection_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            content: {
                Row: {
                    id: string
                    title: string
                    body: string | null
                    type: ContentType
                    access_level: AccessLevel
                    is_published: boolean
                    author_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    body?: string | null
                    type: ContentType
                    access_level?: AccessLevel
                    is_published?: boolean
                    author_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    body?: string | null
                    type?: ContentType
                    access_level?: AccessLevel
                    is_published?: boolean
                    author_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            activities: {
                Row: {
                    id: string
                    exchange_name: ExchangeName
                    title: string
                    description: string | null
                    url: string | null
                    start_date: string | null
                    end_date: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    exchange_name: ExchangeName
                    title: string
                    description?: string | null
                    url?: string | null
                    start_date?: string | null
                    end_date?: string | null
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
        }
    }
}
