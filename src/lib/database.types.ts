export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            market_reviews: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    year: number
                    importance: 'S' | 'A' | 'B' | 'C'
                    tags: string[]
                    content: Json
                    is_published: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    year: number
                    importance: 'S' | 'A' | 'B' | 'C'
                    tags?: string[]
                    content?: Json
                    is_published?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    year?: number
                    importance?: 'S' | 'A' | 'B' | 'C'
                    tags?: string[]
                    content?: Json
                    is_published?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
