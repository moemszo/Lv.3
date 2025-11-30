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
            memos: {
                Row: {
                    id: number
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    content?: string
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                }
            }
            search_history: {
                Row: {
                    id: number
                    user_id: string
                    city: string
                    city_id: number | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string
                    city: string
                    city_id?: number | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    city?: string
                    city_id?: number | null
                    created_at?: string
                }
            }
            favorites: {
                Row: {
                    id: number
                    user_id: string
                    city: string
                    city_id: number | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string
                    city: string
                    city_id?: number | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    city?: string
                    city_id?: number | null
                    created_at?: string
                }
            }
        }
    }
}
